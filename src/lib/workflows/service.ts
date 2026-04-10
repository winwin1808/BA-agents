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
  type WorkflowGraph,
  type WorkflowInput,
  type WorkflowJiraPack,
} from "@/lib/workflows/types";

const REPAIR_OUTPUT_CHAR_LIMIT = 12000;
const WORKFLOW_TITLE_LIMIT = 160;
const JIRA_TITLE_LIMIT = 160;

const scopeLabels: Record<WorkflowContextScope, string> = {
  lock: "Lock",
  quote: "Quote / Quick",
  solution: "Solution",
  cross_suite: "Cross-suite",
};

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
    "Your output is used to render one workflow diagram only.",
    "Return one raw JSON object only.",
    "Do not wrap the JSON in markdown fences.",
    "Do not add commentary before or after the JSON.",
    "BPMN support is intentionally limited to start_event, task, exclusive_gateway, and end_event.",
    "Do not use pools, lanes, subprocesses, message flows, parallel gateways, or data objects.",
    "The workflow graph must have exactly one start_event, at least one end_event, and every node must be reachable from the start event.",
    "Use concise task and gateway labels that will render well in a BPMN diagram.",
    "Prefer diagram accuracy over explanation.",
    "If the input is large, keep one primary end-to-end workflow and collapse low-value detail into the nearest task node.",
    "Use repo context only for naming consistency. Do not invent extra process branches unless the user brief implies them.",
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
    "Convert the workflow brief below into one BPMN-style business workflow diagram.",
    "Prioritize a readable, accurate diagram over text detail.",
    "",
    "Workflow brief:",
    prompt,
    "",
    "Repo context:",
    contextPrompt,
    "",
    "Output requirements:",
    "- title: short artifact title",
    "- flow.nodes and flow.edges: supported BPMN subset only",
    "- top-level keys must be exactly: title, flow",
    "- keep labels short and diagram-friendly",
    "- represent only major decision or exception branches",
    "- if the brief contains multiple connected subflows, keep the main end-to-end workflow",
    "",
    "Extract these details from the workflow brief when available:",
    "- trigger",
    "- actors or owners",
    "- main flow steps",
    "- decision rules or thresholds",
    "- exception or rejection paths",
    "- end states",
    "",
    "Required JSON shape:",
    `{`,
    `  "title": "string",`,
    `  "flow": {`,
    `    "nodes": [`,
    `      { "id": "string", "kind": "start_event|task|exclusive_gateway|end_event", "label": "string" }`,
    `    ],`,
    `    "edges": [`,
    `      { "id": "string", "source": "string", "target": "string", "label": "string|null" }`,
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
    "Original workflow brief:",
    input.prompt,
    "",
    "Repo context:",
    input.contextPrompt,
    "",
    "Validation issue to fix:",
    input.repairReason,
    "",
    "Required top-level keys: title, flow.",
    "flow.nodes must be objects with id, kind, label.",
    "flow.edges must be objects with id, source, target, label.",
    "",
    "Invalid model output:",
    input.invalidOutput.slice(0, REPAIR_OUTPUT_CHAR_LIMIT),
  ].join("\n");
}

function truncateText(value: string, limit: number) {
  const trimmed = value.trim();
  if (trimmed.length <= limit) {
    return trimmed;
  }

  return `${trimmed.slice(0, limit - 1).trimEnd()}…`;
}

function buildFlowPreview(graph: WorkflowGraph) {
  const labels = graph.nodes
    .filter((node) => node.kind !== "start_event" && node.kind !== "end_event")
    .map((node) => node.label)
    .slice(0, 5);

  return labels.join(" -> ");
}

function buildWorkflowSummary(scope: WorkflowContextScope, flow: WorkflowGraph) {
  const preview = buildFlowPreview(flow);
  const scopeLabel = scopeLabels[scope];

  return truncateText(
    preview
      ? `Auto-generated ${scopeLabel} workflow diagram covering ${preview}.`
      : `Auto-generated ${scopeLabel} workflow diagram.`,
    600,
  );
}

function buildFallbackJiraPack(title: string, flow: WorkflowGraph): WorkflowJiraPack {
  const taskCount = flow.nodes.filter((node) => node.kind === "task").length;
  const decisionCount = flow.nodes.filter((node) => node.kind === "exclusive_gateway").length;

  return {
    epic: {
      titleEn: truncateText(`Doc: Review workflow diagram for ${title}`, JIRA_TITLE_LIMIT),
      descriptionVi:
        "Ra soat workflow diagram da sinh de xac nhan trigger, buoc chinh, decision point va end state khop voi yeu cau nghiep vu.",
    },
    stories: [
      {
        id: "story_review_workflow",
        titleEn: "Doc: Validate generated workflow logic",
        descriptionVi: `Doi chieu diagram voi workflow brief de xac nhan ${taskCount} buoc tac vu${
          decisionCount > 0 ? ` va ${decisionCount} decision point` : ""
        } phan anh dung luong chinh.`,
        acceptanceCriteriaVi: [
          "Diagram the hien dung trigger va end state chinh.",
          "Nhan task va gateway ngan gon, de doc tren BPMN.",
          "Nhanh ngoai le quan trong duoc the hien neu anh huong ket qua.",
        ],
      },
    ],
    tasks: [
      {
        id: "task_verify_workflow_diagram",
        titleEn: "Test: Verify workflow diagram against input",
        descriptionVi:
          "Kiem tra diagram voi workflow brief va context scope truoc khi dung artifact nay cho review BA/PM tiep theo.",
        storyId: "story_review_workflow",
        dependsOn: [],
      },
    ],
  };
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
    max_output_tokens: 1800,
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
    title: truncateText(generated.normalized.title, WORKFLOW_TITLE_LIMIT),
    summary: buildWorkflowSummary(input.contextScope, generated.normalized.flow),
    contextScope: input.contextScope,
    prompt: input.prompt,
    contextSnapshot: generated.contextSnapshot,
    flowGraphJson: generated.normalized.flow,
    // Keep minimal persisted metadata for compatibility while generation stays diagram-first.
    jiraPackJson: buildFallbackJiraPack(generated.normalized.title, generated.normalized.flow),
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
