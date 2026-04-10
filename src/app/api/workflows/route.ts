import { createHash } from "node:crypto";

import { z } from "zod";
import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "@/lib/db";
import {
  countWorkflowGenerationAttemptsSince,
  createWorkflowGenerationAttempt,
  listWorkflowArtifacts,
} from "@/lib/db/workflows";
import { getOpenAiKeyMetadata } from "@/lib/ai/openai-provider";
import { getWorkflowErrorCode, generateWorkflowArtifact } from "@/lib/workflows/service";
import { workflowInputSchema } from "@/lib/workflows/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const listSchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

function hashIp(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  return createHash("sha256").update(ip).digest("hex");
}

async function createAttemptLog(input: Parameters<typeof createWorkflowGenerationAttempt>[0]) {
  try {
    await createWorkflowGenerationAttempt(input);
  } catch (error) {
    console.error("Failed to persist workflow generation attempt:", error);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = listSchema.safeParse({
    cursor: url.searchParams.get("cursor") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const artifacts = await listWorkflowArtifacts(parsed.data);
  const nextCursor =
    artifacts.length === (parsed.data.limit ?? 12)
      ? artifacts[artifacts.length - 1]?.createdAt.toISOString() ?? null
      : null;

  return NextResponse.json({
    artifacts: artifacts.map((artifact) => ({
      ...artifact,
      createdAt: artifact.createdAt.toISOString(),
    })),
    nextCursor,
  });
}

export async function POST(request: Request) {
  const ipHash = hashIp(request);

  if (!isDatabaseConfigured()) {
    await createAttemptLog({
      ipHash,
      promptChars: 0,
      contextScope: "cross_suite",
      outcome: "unavailable",
      errorCode: "db_unavailable",
    });

    return NextResponse.json(
      { error: "Workflow generation is unavailable right now." },
      { status: 503 },
    );
  }

  const rawBody = await request.json().catch(() => null);
  const promptChars = typeof rawBody?.prompt === "string" ? rawBody.prompt.length : 0;
  const contextScope =
    rawBody && typeof rawBody.contextScope === "string" ? rawBody.contextScope : "cross_suite";

  const parsed = workflowInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    await createAttemptLog({
      ipHash,
      promptChars,
      contextScope: contextScope === "lock" || contextScope === "quote" || contextScope === "solution"
        ? contextScope
        : "cross_suite",
      outcome: "invalid_input",
      errorCode: "invalid_input",
    });

    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [hourCount, dayCount] = await Promise.all([
    countWorkflowGenerationAttemptsSince({
      ipHash,
      since: new Date(Date.now() - 60 * 60 * 1000),
    }),
    countWorkflowGenerationAttemptsSince({
      ipHash,
      since: new Date(Date.now() - 24 * 60 * 60 * 1000),
    }),
  ]);

  if (hourCount >= 5 || dayCount >= 20) {
    await createAttemptLog({
      ipHash,
      promptChars: parsed.data.prompt.length,
      contextScope: parsed.data.contextScope,
      outcome: "rate_limited",
      errorCode: "rate_limited",
    });

    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 },
    );
  }

  const keyMetadata = await getOpenAiKeyMetadata();
  if (keyMetadata.status !== "active") {
    await createAttemptLog({
      ipHash,
      promptChars: parsed.data.prompt.length,
      contextScope: parsed.data.contextScope,
      outcome: "unavailable",
      errorCode: "openai_unavailable",
    });

    return NextResponse.json(
      { error: "AI generation is unavailable right now." },
      { status: 503 },
    );
  }

  try {
    const artifact = await generateWorkflowArtifact(parsed.data);

    await createAttemptLog({
      ipHash,
      promptChars: parsed.data.prompt.length,
      contextScope: parsed.data.contextScope,
      outcome: "success",
      artifactId: artifact.id,
    });

    return NextResponse.json(
      {
        id: artifact.id,
        slug: artifact.slug,
        title: artifact.title,
        summary: artifact.summary,
        contextScope: artifact.contextScope,
        createdAt: artifact.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    const code = getWorkflowErrorCode(error);

    await createAttemptLog({
      ipHash,
      promptChars: parsed.data.prompt.length,
      contextScope: parsed.data.contextScope,
      outcome: code === "openai_unavailable" ? "unavailable" : "error",
      errorCode: code,
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Workflow generation failed.",
      },
      { status: code === "openai_unavailable" ? 503 : 502 },
    );
  }
}
