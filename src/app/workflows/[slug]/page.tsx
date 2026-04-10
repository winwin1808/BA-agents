import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getWorkflowArtifactBySlug } from "@/lib/db/workflows";
import { WorkflowDiagramViewer } from "@/components/workflows/workflow-diagram-viewer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workflow Diagram",
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

export default async function WorkflowArtifactPage(
  props: { params: Promise<{ slug: string }> },
) {
  const { slug } = await props.params;
  const artifact = await getWorkflowArtifactBySlug(slug);

  if (!artifact) {
    notFound();
  }

  return (
    <main className="py-6 md:py-8">
      <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="eyebrow">Workflow diagram</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {artifact.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-neutral-500">
            <span>{scopeLabels[artifact.contextScope] ?? artifact.contextScope}</span>
            <span>Generated {artifact.createdAt.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link className="rounded-2xl border border-neutral-300 px-4 py-3 text-sm font-medium transition hover:border-neutral-500 hover:bg-neutral-50" href="/workflows">
            Back to gallery
          </Link>
          <a
            className="rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            href={`/api/workflows/${artifact.slug}?download=xml`}
          >
            Download BPMN XML
          </a>
        </div>
      </section>

      <section>
        <WorkflowDiagramViewer xml={artifact.bpmnXml} />
      </section>
    </main>
  );
}
