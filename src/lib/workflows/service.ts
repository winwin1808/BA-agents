import { randomBytes } from "node:crypto";

import { z } from "zod";

import { getConfiguredOpenAiClient } from "@/lib/ai/openai-provider";
import { createWorkflowArtifact } from "@/lib/db/workflows";
import {
  buildWorkflowContextPrompt,
  buildWorkflowContextSnapshot,
} from "@/lib/workflows/context";
import { buildLaidOutBpmnXml } from "@/lib/workflows/bpmn";
import { normalizeAiWorkflowOutput } from "@/lib/workflows/graph";
import { parseWorkflowAiOutputText } from "@/lib/workflows/output";
import {
  type StoredWorkflowArtifact,
  type WorkflowContextScope,
  type WorkflowInput,
} from "@/lib/workflows/types";

const REPAIR_OUTPUT_CHAR_LIMIT = 12000;

class WorkflowGenerationError extends Error {
  code: string;
  recoverable: boolean;

  constructor(code: string, message: string, options?: { recoverable?: boolean; cause?: unknown }) {
    super(message, options);
    this.code = code;
    this.recoverable = options?.recoverable ?? false;
  }
}

function slugifyTitle(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${base || "workflow"}-${randomBytes(3).toString("hex")}`;
}

function buildWorkflowInstructions(scope: WorkflowContextScope, repairReason?: string) {
  return [
    "You generate structured workflow artifacts for a BA/PM knowledge system.",
    "Return one raw JSON object only.",
    "Do not wrap the JSON in markdown fences.",
    "Do not add commentary before or after the JSON.",
    "BPMN support is intentionally limited to start_event, task, exclusive_gateway, and end_event.",
    "Do not use pools, lanes, subprocesses, message flows, parallel gateways, or data objects.",
    "The workflow graph must have exactly one start_event, at least one end_event, and every node must be reachable from the start event.",
    "Use concise task and gateway labels that will render well in a BPMN diagram.",
    "Generate a Jira pack that follows the repo guideline: titles in English, descriptions in Vietnamese.",
    "Every Jira title must start with one of: New:, Improve:, Bug:, Tech:, Doc:, Research:, Discuss:, Test:.",
    "Keep the output small enough for an internal planning artifact.",
    `Scope focus: ${scope}.`,
    repairReason
      ? `Repair the previous invalid output. The issue to fix was: ${repairReason}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildWorkflowInput(prompt: string, contextPrompt: string) {
  return [
    "User request:",
    prompt,
    "",
    "Repo context:",
    contextPrompt,
    "",
    "Output requirements:",
    "- title: short artifact title",
    "- summary: 1 short paragraph summary",
    "- flow.nodes and flow.edges: supported BPMN subset only",
    "- jiraPack with 1 epic, 1-5 stories, and 1-12 tasks",
    "- tasks must reference a storyId from jiraPack.stories",
    "- top-level keys must be exactly: title, summary, flow, jiraPack",
    "",
    "Required JSON shape:",
    `{`,
    `  "title": "string",`,
    `  "summary": "string",`,
    `  "flow": {`,
    `    "nodes": [`,
    `      { "id": "string", "kind": "start_event|task|exclusive_gateway|end_event", "label": "string" }`,
    `    ],`,
    `    "edges": [`,
    `      { "id": "string", "source": "string", "target": "string", "label": "string|null" }`,
    `    ]`,
    `  },`,
    `  "jiraPack": {`,
    `    "epic": { "titleEn": "string", "descriptionVi": "string" },`,
    `    "stories": [`,
    `      {`,
    `        "id": "string",`,
    `        "titleEn": "string",`,
    `        "descriptionVi": "string",`,
    `        "acceptanceCriteriaVi": ["string"]`,
    `      }`,
    `    ],`,
    `    "tasks": [`,
    `      {`,
    `        "id": "string",`,
    `        "titleEn": "string",`,
    `        "descriptionVi": "string",`,
    `        "storyId": "string",`,
    `        "dependsOn": ["string"]`,
    `      }`,
    `    ]`,
    `  }`,
    `}`,
  ].join("\n");
}

function buildWorkflowRepairInput(input: {
  prompt: string;
  contextPrompt: string;
  invalidOutput: string;
  repairReason: string;
}) {
  return [
    "Repair the invalid workflow output below into one valid JSON object.",
    "Return raw JSON only. No markdown fences. No explanation.",
    "",
    "Original user request:",
    input.prompt,
    "",
    "Repo context:",
    input.contextPrompt,
    "",
    "Validation issue to fix:",
    input.repairReason,
    "",
    "Required top-level keys: title, summary, flow, jiraPack.",
    "flow.nodes must be objects with id, kind, label.",
    "flow.edges must be objects with id, source, target, label.",
    "jiraPack.epic must be an object with titleEn and descriptionVi.",
    "jiraPack.stories must be objects with id, titleEn, descriptionVi, acceptanceCriteriaVi.",
    "jiraPack.tasks must be objects with id, titleEn, descriptionVi, storyId, dependsOn.",
    "",
    "Invalid model output:",
    input.invalidOutput.slice(0, REPAIR_OUTPUT_CHAR_LIMIT),
  ].join("\n");
}

function parseNormalizedWorkflowOutput(rawOutput: string) {
  let parsedOutput;

  try {
    parsedOutput = parseWorkflowAiOutputText(rawOutput);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new WorkflowGenerationError(
        "invalid_model_output",
        "Model output did not match the required schema.",
        { recoverable: true, cause: error },
      );
    }

    throw new WorkflowGenerationError(
      "invalid_model_output",
      error instanceof Error ? error.message : "Model output was not valid JSON.",
      { recoverable: true, cause: error },
    );
  }

  try {
    return normalizeAiWorkflowOutput(parsedOutput);
  } catch (error) {
    throw new WorkflowGenerationError(
      "invalid_model_output",
      error instanceof Error ? error.message : "Model output could not be normalized.",
      { recoverable: true, cause: error },
    );
  }
}

async function requestWorkflowText(input: {
  client: NonNullable<Awaited<ReturnType<typeof getConfiguredOpenAiClient>>>;
  modelName: string;
  prompt: string;
  instructions: string;
}) {
  const response = await input.client.client.responses.create({
    model: input.modelName,
    instructions: input.instructions,
    input: input.prompt,
    max_output_tokens: 3000,
    text: {
      verbosity: "low",
    },
  });

  const outputText = response.output_text?.trim();
  if (!outputText) {
    throw new WorkflowGenerationError(
      "invalid_model_output",
      "Model response did not contain text output.",
      { recoverable: true },
    );
  }

  return outputText;
}

async function requestWorkflowOutput(input: {
  prompt: string;
  contextScope: WorkflowContextScope;
}) {
  const client = await getConfiguredOpenAiClient();
  if (!client) {
    throw new WorkflowGenerationError(
      "openai_unavailable",
      "Gemini generation is not configured.",
    );
  }

  const contextSnapshot = buildWorkflowContextSnapshot(input.contextScope);
  const contextPrompt = buildWorkflowContextPrompt(input.contextScope, contextSnapshot);
  const basePrompt = buildWorkflowInput(input.prompt, contextPrompt);

  const rawOutput = await requestWorkflowText({
    client,
    modelName: client.modelName,
    instructions: buildWorkflowInstructions(input.contextScope),
    prompt: basePrompt,
  });

  try {
    return {
      normalized: parseNormalizedWorkflowOutput(rawOutput),
      contextSnapshot,
      modelName: client.modelName,
    };
  } catch (error) {
    if (!(error instanceof WorkflowGenerationError) || !error.recoverable) {
      throw error;
    }

    const repairedRawOutput = await requestWorkflowText({
      client,
      modelName: client.modelName,
      instructions: buildWorkflowInstructions(input.contextScope, error.message),
      prompt: buildWorkflowRepairInput({
        prompt: input.prompt,
        contextPrompt,
        invalidOutput: rawOutput,
        repairReason: error.message,
      }),
    });

    try {
      return {
        normalized: parseNormalizedWorkflowOutput(repairedRawOutput),
        contextSnapshot,
        modelName: client.modelName,
      };
    } catch (repairError) {
      if (repairError instanceof WorkflowGenerationError) {
        throw new WorkflowGenerationError(
          repairError.code,
          `Model output remained invalid after repair retry. ${repairError.message}`,
          { recoverable: false, cause: repairError },
        );
      }

      throw repairError;
    }
  }
}

export async function generateWorkflowArtifact(
  input: WorkflowInput,
): Promise<StoredWorkflowArtifact> {
  const startedAt = Date.now();
  const generated = await requestWorkflowOutput(input);

  const bpmnXml = await buildLaidOutBpmnXml(
    generated.normalized.flow,
    generated.normalized.title,
  );

  return createWorkflowArtifact({
    slug: slugifyTitle(generated.normalized.title),
    title: generated.normalized.title,
    summary: generated.normalized.summary,
    contextScope: input.contextScope,
    prompt: input.prompt,
    contextSnapshot: generated.contextSnapshot,
    flowGraphJson: generated.normalized.flow,
    jiraPackJson: generated.normalized.jiraPack,
    bpmnXml,
    modelName: generated.modelName,
    latencyMs: Date.now() - startedAt,
  });
}

export function getWorkflowErrorCode(error: unknown) {
  if (error instanceof WorkflowGenerationError) {
    return error.code;
  }

  return "generation_failed";
}
