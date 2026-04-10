import type { Metadata } from "next";
import Link from "next/link";

import { getOpenAiKeyMetadata } from "@/lib/ai/openai-provider";
import { isDatabaseConfigured } from "@/lib/db";
import { listWorkflowArtifacts } from "@/lib/db/workflows";
import { hasAdminSecretsEncryptionKey } from "@/lib/env";
import { WorkflowGenerateForm } from "@/components/workflows/workflow-generate-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workflow Gallery",
  robots: {
    index: false,
    follow: false,
  },
};

const scopeLabels: Record<string, string> = {
  lock: "Lock",
  quote: "Quote / Quick",
  solution: "Solution",
  cross_suite: "Cross-suite",
};

export default async function WorkflowsPage() {
  const generationAvailable = isDatabaseConfigured() && hasAdminSecretsEncryptionKey()
    ? (await getOpenAiKeyMetadata()).status === "active"
    : false;
  const artifacts = isDatabaseConfigured() ? await listWorkflowArtifacts({ limit: 12 }) : [];

  return (
    <main className="py-8 md:py-12">
      <WorkflowGenerateForm generationAvailable={generationAvailable} />

      <section className="panel mt-8 p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="eyebrow">Gallery</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Latest generated workflow artifacts
            </h2>
            <p className="mt-3 text-sm leading-7 text-neutral-600">
              Each artifact stores the normalized workflow graph, Jira pack, and BPMN XML that powers the viewer page.
            </p>
          </div>
          <p className="text-sm text-neutral-500">{artifacts.length} item(s)</p>
        </div>

        {artifacts.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white/70 p-6 text-sm text-neutral-600">
            No workflow artifacts yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {artifacts.map((artifact) => (
              <Link
                key={artifact.id}
                className="rounded-2xl border border-neutral-200 bg-white/80 p-5 transition hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white"
                href={`/workflows/${artifact.slug}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    {scopeLabels[artifact.contextScope] ?? artifact.contextScope}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {artifact.createdAt.toLocaleString()}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold">{artifact.title}</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-600">{artifact.summary}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
