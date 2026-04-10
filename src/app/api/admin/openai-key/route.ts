import { z } from "zod";
import { NextResponse } from "next/server";

import { getRequestContext, logAuthEvent } from "@/lib/auth/audit";
import { requireAdminApiSession } from "@/lib/auth/admin";
import { hasAdminSecretsEncryptionKey } from "@/lib/env";
import { isDatabaseConfigured } from "@/lib/db";
import {
  disableCurrentOpenAiApiKey,
  getOpenAiKeyMetadata,
  setCurrentOpenAiApiKey,
} from "@/lib/ai/openai-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const putSchema = z.object({
  label: z.string().trim().min(1).max(255),
  modelName: z.string().trim().min(1).max(120),
  apiKey: z.string().trim().min(20),
});

function dbNotConfigured() {
  return NextResponse.json(
    {
      error:
        "Admin data store is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or POSTGRES_URL.",
    },
    { status: 500 },
  );
}

export async function GET() {
  const auth = await requireAdminApiSession({ ownerOnly: true });
  if (!auth.ok) {
    return auth.response;
  }

  if (!isDatabaseConfigured()) {
    return dbNotConfigured();
  }

  const key = await getOpenAiKeyMetadata();

  return NextResponse.json({
    key,
    secretsConfigured: hasAdminSecretsEncryptionKey(),
  });
}

export async function PUT(request: Request) {
  const auth = await requireAdminApiSession({ ownerOnly: true });
  if (!auth.ok) {
    return auth.response;
  }

  if (!isDatabaseConfigured()) {
    return dbNotConfigured();
  }

  if (!hasAdminSecretsEncryptionKey()) {
    return NextResponse.json(
      { error: "ADMIN_SECRETS_ENCRYPTION_KEY is not configured." },
      { status: 503 },
    );
  }

  const parsed = putSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await setCurrentOpenAiApiKey({
      label: parsed.data.label,
      modelName: parsed.data.modelName,
      apiKey: parsed.data.apiKey,
      adminUserId: auth.adminUser.id,
    });
  } catch (error) {
    await logAuthEvent({
      eventType: "provider_key_mutation",
      email: auth.adminUser.email,
      subject: "Gemini API key validation failed",
      outcome: "denied",
      reason: error instanceof Error ? error.message : "Gemini API key validation failed",
      route: "/api/admin/openai-key",
      ...getRequestContext(request),
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Gemini API key validation failed.",
      },
      { status: 400 },
    );
  }

  await logAuthEvent({
    eventType: "provider_key_mutation",
    email: auth.adminUser.email,
    subject: "Updated Gemini API key",
    outcome: "success",
    route: "/api/admin/openai-key",
    ...getRequestContext(request),
  });

  return NextResponse.json({
    key: await getOpenAiKeyMetadata(),
    secretsConfigured: true,
  });
}

export async function DELETE(request: Request) {
  const auth = await requireAdminApiSession({ ownerOnly: true });
  if (!auth.ok) {
    return auth.response;
  }

  if (!isDatabaseConfigured()) {
    return dbNotConfigured();
  }

  await disableCurrentOpenAiApiKey(auth.adminUser.id);
  await logAuthEvent({
    eventType: "provider_key_mutation",
    email: auth.adminUser.email,
    subject: "Disabled Gemini API key",
    outcome: "success",
    route: "/api/admin/openai-key",
    ...getRequestContext(request),
  });

  return NextResponse.json({
    key: await getOpenAiKeyMetadata(),
    secretsConfigured: hasAdminSecretsEncryptionKey(),
  });
}
