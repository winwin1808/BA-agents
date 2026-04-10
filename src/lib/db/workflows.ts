import { and, count, desc, eq, lt, gte } from "drizzle-orm";

import { getDb, isDatabaseConfigured } from "@/lib/db";
import {
  workflowArtifacts,
  workflowGenerationAttempts,
} from "@/lib/db/schema";
import {
  createWorkflowArtifactInSupabase,
  createWorkflowGenerationAttemptInSupabase,
  getWorkflowArtifactBySlugFromSupabase,
  isSupabaseConfigured,
  listWorkflowArtifactsFromSupabase,
  listWorkflowGenerationAttemptsFromSupabase,
} from "@/lib/supabase/admin-store";
import type {
  WorkflowArtifactListItem,
  WorkflowContextScope,
  StoredWorkflowArtifact,
} from "@/lib/workflows/types";

export async function listWorkflowArtifacts(input?: {
  cursor?: string | null;
  limit?: number;
}): Promise<WorkflowArtifactListItem[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  if (isSupabaseConfigured()) {
    const rows = await listWorkflowArtifactsFromSupabase(input);
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      contextScope: row.contextScope,
      createdAt: row.createdAt,
    }));
  }

  const limit = Math.min(Math.max(input?.limit ?? 12, 1), 50);
  const query = getDb()
    .select({
      id: workflowArtifacts.id,
      slug: workflowArtifacts.slug,
      title: workflowArtifacts.title,
      summary: workflowArtifacts.summary,
      contextScope: workflowArtifacts.contextScope,
      createdAt: workflowArtifacts.createdAt,
    })
    .from(workflowArtifacts);

  const constrained = input?.cursor
    ? query.where(lt(workflowArtifacts.createdAt, new Date(input.cursor)))
    : query;

  return constrained.orderBy(desc(workflowArtifacts.createdAt)).limit(limit);
}

export async function getWorkflowArtifactBySlug(
  slug: string,
): Promise<StoredWorkflowArtifact | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (isSupabaseConfigured()) {
    const row = await getWorkflowArtifactBySlugFromSupabase(slug);
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      contextScope: row.contextScope,
      prompt: row.prompt,
      contextSnapshot: row.contextSnapshot as StoredWorkflowArtifact["contextSnapshot"],
      flowGraphJson: row.flowGraphJson as StoredWorkflowArtifact["flowGraphJson"],
      jiraPackJson: row.jiraPackJson as StoredWorkflowArtifact["jiraPackJson"],
      bpmnXml: row.bpmnXml,
      modelName: row.modelName,
      latencyMs: row.latencyMs,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  const [row] = await getDb()
    .select()
    .from(workflowArtifacts)
    .where(eq(workflowArtifacts.slug, slug))
    .limit(1);

  return row
    ? {
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        contextScope: row.contextScope,
        prompt: row.prompt,
        contextSnapshot: row.contextSnapshot,
        flowGraphJson: row.flowGraphJson,
        jiraPackJson: row.jiraPackJson,
        bpmnXml: row.bpmnXml,
        modelName: row.modelName,
        latencyMs: row.latencyMs,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }
    : null;
}

export async function createWorkflowArtifact(input: {
  slug: string;
  title: string;
  summary: string;
  contextScope: WorkflowContextScope;
  prompt: string;
  contextSnapshot: StoredWorkflowArtifact["contextSnapshot"];
  flowGraphJson: StoredWorkflowArtifact["flowGraphJson"];
  jiraPackJson: StoredWorkflowArtifact["jiraPackJson"];
  bpmnXml: string;
  modelName: string;
  latencyMs: number;
}): Promise<StoredWorkflowArtifact> {
  if (isSupabaseConfigured()) {
    const row = await createWorkflowArtifactInSupabase(input);

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      contextScope: row.contextScope,
      prompt: row.prompt,
      contextSnapshot: row.contextSnapshot as StoredWorkflowArtifact["contextSnapshot"],
      flowGraphJson: row.flowGraphJson as StoredWorkflowArtifact["flowGraphJson"],
      jiraPackJson: row.jiraPackJson as StoredWorkflowArtifact["jiraPackJson"],
      bpmnXml: row.bpmnXml,
      modelName: row.modelName,
      latencyMs: row.latencyMs,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  const [row] = await getDb()
    .insert(workflowArtifacts)
    .values({
      slug: input.slug,
      title: input.title,
      summary: input.summary,
      contextScope: input.contextScope,
      prompt: input.prompt,
      contextSnapshot: input.contextSnapshot,
      flowGraphJson: input.flowGraphJson,
      jiraPackJson: input.jiraPackJson,
      bpmnXml: input.bpmnXml,
      modelName: input.modelName,
      latencyMs: input.latencyMs,
    })
    .returning();

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    contextScope: row.contextScope,
    prompt: row.prompt,
    contextSnapshot: row.contextSnapshot,
    flowGraphJson: row.flowGraphJson,
    jiraPackJson: row.jiraPackJson,
    bpmnXml: row.bpmnXml,
    modelName: row.modelName,
    latencyMs: row.latencyMs,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function createWorkflowGenerationAttempt(input: {
  ipHash: string;
  promptChars: number;
  contextScope: WorkflowContextScope;
  outcome: "success" | "error" | "rate_limited" | "unavailable" | "invalid_input";
  errorCode?: string | null;
  artifactId?: string | null;
}) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (isSupabaseConfigured()) {
    return createWorkflowGenerationAttemptInSupabase(input);
  }

  const [row] = await getDb()
    .insert(workflowGenerationAttempts)
    .values({
      ipHash: input.ipHash,
      promptChars: input.promptChars,
      contextScope: input.contextScope,
      outcome: input.outcome,
      errorCode: input.errorCode ?? null,
      artifactId: input.artifactId ?? null,
    })
    .returning();

  return row;
}

export async function countWorkflowGenerationAttemptsSince(input: {
  ipHash: string;
  since: Date;
}) {
  if (!isDatabaseConfigured()) {
    return 0;
  }

  if (isSupabaseConfigured()) {
    const rows = await listWorkflowGenerationAttemptsFromSupabase({
      ipHash: input.ipHash,
      since: input.since.toISOString(),
    });
    return rows.length;
  }

  const [row] = await getDb()
    .select({ value: count() })
    .from(workflowGenerationAttempts)
    .where(
      and(
        eq(workflowGenerationAttempts.ipHash, input.ipHash),
        gte(workflowGenerationAttempts.createdAt, input.since),
      ),
    );

  return Number(row?.value ?? 0);
}
