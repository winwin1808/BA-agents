"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  WORKFLOW_PROMPT_LIMIT,
  type WorkflowContextScope,
} from "@/lib/workflows/types";

const fieldClassName =
  "rounded-2xl border border-neutral-300 px-4 py-3 transition hover:border-neutral-500 focus:border-neutral-700 focus:outline-none";
const primaryButtonClassName =
  "rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60";

const scopeOptions: Array<{ value: WorkflowContextScope; label: string }> = [
  { value: "lock", label: "Lock" },
  { value: "quote", label: "Quote / Quick" },
  { value: "solution", label: "Solution" },
  { value: "cross_suite", label: "Cross-suite" },
];

export function WorkflowGenerateForm(props: { generationAvailable: boolean }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [contextScope, setContextScope] = useState<WorkflowContextScope>("cross_suite");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      setError(null);

      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          contextScope,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        slug?: string;
      };

      if (!response.ok || !payload.slug) {
        setError(payload.error ?? "Workflow generation failed.");
        return;
      }

      router.push(`/workflows/${payload.slug}`);
      router.refresh();
    });
  }

  return (
    <section className="panel p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="eyebrow">AI workflow</div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Generate a BPMN workflow diagram
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600">
            Describe one workflow to map. The generated artifact page is intentionally
            diagram-first so reviewers can open the link and focus on the flow only.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-600">
          {props.generationAvailable
            ? "Generation is available."
            : "Generation is unavailable until an owner configures the Gemini settings in admin."}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium">Context scope</span>
          <select
            className={fieldClassName}
            disabled={isPending}
            onChange={(event) => setContextScope(event.target.value as WorkflowContextScope)}
            value={contextScope}
          >
            {scopeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Prompt</span>
          <textarea
            className={`${fieldClassName} min-h-44`}
            disabled={isPending || !props.generationAvailable}
            maxLength={WORKFLOW_PROMPT_LIMIT}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={`Trigger:\nActors:\nMain flow:\nDecisions:\nExceptions:\nEnd states:\n\nExample:\nTrigger: Buyer submits RFQ from Quick Order.\nActors: Buyer, Sales rep, Approver.\nMain flow: Create draft quote -> validate pricing -> send quote -> buyer responds.\nDecisions: If discount exceeds threshold, manager approves before sending.\nExceptions: Buyer requests revision or quote expires.\nEnd states: Quote accepted and converted, or quote rejected/expired.`}
            value={prompt}
          />
          <span className="text-xs leading-6 text-neutral-500">
            For larger tasks, keep one primary workflow and structure the brief with
            Trigger, Actors, Main flow, Decisions, Exceptions, and End states.
          </span>
          <span className="text-xs text-neutral-500">
            {prompt.length}/{WORKFLOW_PROMPT_LIMIT}
          </span>
        </label>

        {error ? <p className="text-sm text-rose-700">{error}</p> : null}

        <div className="flex justify-end">
          <button
            className={primaryButtonClassName}
            disabled={isPending || !props.generationAvailable || prompt.trim().length < 20}
            onClick={submit}
            type="button"
          >
            {isPending ? "Generating..." : "Generate workflow"}
          </button>
        </div>
      </div>
    </section>
  );
}
