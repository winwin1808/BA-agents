import { z } from "zod";

import type { AppName } from "@/lib/content/types";

export const WORKFLOW_CONTEXT_SCOPES = [
  "lock",
  "quote",
  "solution",
  "cross_suite",
] as const;

export const WORKFLOW_NODE_LIMIT = 30;
export const WORKFLOW_EDGE_LIMIT = 50;
export const WORKFLOW_STORY_LIMIT = 5;
export const WORKFLOW_TASK_LIMIT = 12;
export const WORKFLOW_PROMPT_LIMIT = 6000;

export type WorkflowContextScope = (typeof WORKFLOW_CONTEXT_SCOPES)[number];
export type WorkflowAppScope = AppName | "cross_suite";

export const workflowContextScopeSchema = z.enum(WORKFLOW_CONTEXT_SCOPES);
export const workflowNodeKindSchema = z.enum([
  "start_event",
  "task",
  "exclusive_gateway",
  "end_event",
]);

export const workflowNodeSchema = z.object({
  id: z.string().min(1),
  kind: workflowNodeKindSchema,
  label: z.string().trim().min(1).max(120),
});

export const workflowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().trim().max(120).optional().nullable(),
});

export const workflowGraphSchema = z.object({
  nodes: z.array(workflowNodeSchema).min(2).max(WORKFLOW_NODE_LIMIT),
  edges: z.array(workflowEdgeSchema).min(1).max(WORKFLOW_EDGE_LIMIT),
});

export const workflowEpicSchema = z.object({
  titleEn: z.string().trim().min(1).max(160),
  descriptionVi: z.string().trim().min(1),
});

export const workflowStorySchema = z.object({
  id: z.string().min(1),
  titleEn: z.string().trim().min(1).max(160),
  descriptionVi: z.string().trim().min(1),
  acceptanceCriteriaVi: z.array(z.string().trim().min(1)).min(1).max(6),
});

export const workflowTaskSchema = z.object({
  id: z.string().min(1),
  titleEn: z.string().trim().min(1).max(160),
  descriptionVi: z.string().trim().min(1),
  storyId: z.string().min(1),
  dependsOn: z.array(z.string().min(1)).max(6).default([]),
});

export const workflowJiraPackSchema = z.object({
  epic: workflowEpicSchema,
  stories: z.array(workflowStorySchema).min(1).max(WORKFLOW_STORY_LIMIT),
  tasks: z.array(workflowTaskSchema).min(1).max(WORKFLOW_TASK_LIMIT),
});

export const workflowAiOutputSchema = z.object({
  title: z.string().trim().min(1).max(160),
  flow: workflowGraphSchema,
});

export const workflowInputSchema = z.object({
  prompt: z.string().trim().min(20).max(WORKFLOW_PROMPT_LIMIT),
  contextScope: workflowContextScopeSchema,
});

export type WorkflowNodeKind = z.infer<typeof workflowNodeKindSchema>;
export type WorkflowNode = z.infer<typeof workflowNodeSchema>;
export type WorkflowEdge = z.infer<typeof workflowEdgeSchema>;
export type WorkflowGraph = z.infer<typeof workflowGraphSchema>;
export type WorkflowEpic = z.infer<typeof workflowEpicSchema>;
export type WorkflowStory = z.infer<typeof workflowStorySchema>;
export type WorkflowTask = z.infer<typeof workflowTaskSchema>;
export type WorkflowJiraPack = z.infer<typeof workflowJiraPackSchema>;
export type WorkflowAiOutput = z.infer<typeof workflowAiOutputSchema>;
export type WorkflowInput = z.infer<typeof workflowInputSchema>;

export type WorkflowContextSnapshotEntry = {
  uri: string;
  title: string;
  summary: string;
  excerpt: string;
};

export type StoredWorkflowArtifact = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  contextScope: WorkflowContextScope;
  prompt: string;
  contextSnapshot: WorkflowContextSnapshotEntry[];
  flowGraphJson: WorkflowGraph;
  jiraPackJson: WorkflowJiraPack;
  bpmnXml: string;
  modelName: string;
  latencyMs: number;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkflowArtifactListItem = Pick<
  StoredWorkflowArtifact,
  "id" | "slug" | "title" | "summary" | "contextScope" | "createdAt"
>;
