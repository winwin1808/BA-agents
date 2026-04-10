import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getWorkflowArtifactBySlug } from "@/lib/db/workflows";
import { WorkflowDiagramViewer } from "@/components/workflows/workflow-diagram-viewer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workflow Artifact",
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
    <main className="py-8 md:py-12">
      <section className="panel p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow">Workflow artifact</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              {artifact.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-neutral-700">
              {artifact.summary}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-neutral-500">
              <span>{scopeLabels[artifact.contextScope] ?? artifact.contextScope}</span>
              <span>Generated {artifact.createdAt.toLocaleString()}</span>
              <span>Model {artifact.modelName}</span>
              <span>{artifact.latencyMs} ms</span>
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
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <WorkflowDiagramViewer xml={artifact.bpmnXml} />
        </div>
        <div className="space-y-6">
          <section className="panel p-6">
            <h2 className="text-2xl font-semibold">Prompt</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-neutral-700">
              {artifact.prompt}
            </p>
          </section>

          <section className="panel p-6">
            <h2 className="text-2xl font-semibold">Epic</h2>
            <p className="mt-4 text-sm font-medium">{artifact.jiraPackJson.epic.titleEn}</p>
            <p className="mt-3 text-sm leading-7 text-neutral-700">
              {artifact.jiraPackJson.epic.descriptionVi}
            </p>
          </section>

          <section className="panel p-6">
            <h2 className="text-2xl font-semibold">Stories and Tasks</h2>
            <div className="mt-5 space-y-5">
              {artifact.jiraPackJson.stories.map((story) => (
                <div key={story.id} className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
                  <p className="font-medium">{story.titleEn}</p>
                  <p className="mt-2 text-sm leading-7 text-neutral-700">
                    {story.descriptionVi}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                    {story.acceptanceCriteriaVi.map((criterion, index) => (
                      <li key={`${story.id}-${index}`}>AC{index + 1}. {criterion}</li>
                    ))}
                  </ul>
                  <div className="mt-4 space-y-3">
                    {artifact.jiraPackJson.tasks
                      .filter((task) => task.storyId === story.id)
                      .map((task) => (
                        <div key={task.id} className="rounded-2xl border border-neutral-200 px-4 py-3">
                          <p className="text-sm font-medium">{task.titleEn}</p>
                          <p className="mt-2 text-sm leading-7 text-neutral-700">
                            {task.descriptionVi}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-6">
            <h2 className="text-2xl font-semibold">Context snapshot</h2>
            <div className="mt-5 space-y-4">
              {artifact.contextSnapshot.map((entry) => (
                <div key={entry.uri} className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
                  <p className="font-medium">{entry.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">{entry.uri}</p>
                  <p className="mt-3 text-sm leading-7 text-neutral-700">{entry.summary}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
