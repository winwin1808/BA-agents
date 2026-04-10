import {
  workflowAiOutputSchema,
  type WorkflowAiOutput,
  type WorkflowEdge,
  type WorkflowGraph,
  type WorkflowJiraPack,
  type WorkflowNode,
  type WorkflowNodeKind,
} from "@/lib/workflows/types";

const TITLE_PREFIXES = [
  "New:",
  "Improve:",
  "Bug:",
  "Tech:",
  "Doc:",
  "Research:",
  "Discuss:",
  "Test:",
];

function slugToken(value: string, fallback: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || fallback;
}

function ensureUniqueId(id: string, seen: Set<string>) {
  let candidate = id;
  let index = 2;

  while (seen.has(candidate)) {
    candidate = `${id}_${index}`;
    index += 1;
  }

  seen.add(candidate);
  return candidate;
}

function normalizeNodeKind(kind: WorkflowNodeKind) {
  return kind;
}

function hasAllowedPrefix(title: string) {
  return TITLE_PREFIXES.some((prefix) => title.startsWith(prefix));
}

function traverseDirected(graph: WorkflowGraph, startId: string) {
  const outgoing = new Map<string, string[]>();
  for (const edge of graph.edges) {
    outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge.target]);
  }

  const visited = new Set<string>();
  const queue = [startId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);
    for (const target of outgoing.get(current) ?? []) {
      if (!visited.has(target)) {
        queue.push(target);
      }
    }
  }

  return visited;
}

function traverseUndirected(graph: WorkflowGraph, startId: string) {
  const adjacency = new Map<string, string[]>();
  for (const node of graph.nodes) {
    adjacency.set(node.id, []);
  }

  for (const edge of graph.edges) {
    adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge.target]);
    adjacency.set(edge.target, [...(adjacency.get(edge.target) ?? []), edge.source]);
  }

  const visited = new Set<string>();
  const queue = [startId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);
    for (const target of adjacency.get(current) ?? []) {
      if (!visited.has(target)) {
        queue.push(target);
      }
    }
  }

  return visited;
}

function normalizeGraph(flow: WorkflowAiOutput["flow"]): WorkflowGraph {
  const seenNodeIds = new Set<string>();
  const nodes: WorkflowNode[] = flow.nodes.map((node, index) => ({
    id: ensureUniqueId(slugToken(node.id, `node_${index + 1}`), seenNodeIds),
    kind: normalizeNodeKind(node.kind),
    label: node.label.trim(),
  }));

  const nodeIdMap = new Map(flow.nodes.map((node, index) => [node.id, nodes[index].id]));
  const seenEdgeIds = new Set<string>();
  const edges: WorkflowEdge[] = flow.edges.map((edge, index) => ({
    id: ensureUniqueId(slugToken(edge.id, `flow_${index + 1}`), seenEdgeIds),
    source: nodeIdMap.get(edge.source) ?? slugToken(edge.source, `missing_source_${index + 1}`),
    target: nodeIdMap.get(edge.target) ?? slugToken(edge.target, `missing_target_${index + 1}`),
    label: edge.label?.trim() ? edge.label.trim() : null,
  }));

  const graph: WorkflowGraph = { nodes, edges };
  validateGraph(graph);
  return graph;
}

export function validateGraph(graph: WorkflowGraph) {
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
  const startNodes = graph.nodes.filter((node) => node.kind === "start_event");
  const endNodes = graph.nodes.filter((node) => node.kind === "end_event");

  if (startNodes.length !== 1) {
    throw new Error("Workflow graph must contain exactly one start event.");
  }

  if (endNodes.length < 1) {
    throw new Error("Workflow graph must contain at least one end event.");
  }

  for (const edge of graph.edges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) {
      throw new Error("Workflow graph contains an edge that references a missing node.");
    }

    if (edge.source === edge.target) {
      throw new Error("Workflow graph does not support self-loop edges.");
    }
  }

  const directedReachable = traverseDirected(graph, startNodes[0].id);
  if (directedReachable.size !== graph.nodes.length) {
    throw new Error("Workflow graph contains nodes that are not reachable from the start event.");
  }

  const undirectedReachable = traverseUndirected(graph, startNodes[0].id);
  if (undirectedReachable.size !== graph.nodes.length) {
    throw new Error("Workflow graph must be fully connected.");
  }

  const reachableEnd = endNodes.some((node) => directedReachable.has(node.id));
  if (!reachableEnd) {
    throw new Error("Workflow graph must contain a path from the start event to an end event.");
  }
}

export function validateJiraPack(jiraPack: WorkflowJiraPack) {
  if (!hasAllowedPrefix(jiraPack.epic.titleEn)) {
    throw new Error("Epic title must start with a supported Jira prefix.");
  }

  const storyIds = new Set<string>();

  for (const story of jiraPack.stories) {
    if (!hasAllowedPrefix(story.titleEn)) {
      throw new Error("Story title must start with a supported Jira prefix.");
    }

    if (storyIds.has(story.id)) {
      throw new Error("Story IDs must be unique.");
    }

    storyIds.add(story.id);
  }

  const taskIds = new Set<string>();
  for (const task of jiraPack.tasks) {
    if (!hasAllowedPrefix(task.titleEn)) {
      throw new Error("Task title must start with a supported Jira prefix.");
    }

    if (!storyIds.has(task.storyId)) {
      throw new Error("Each task must reference an existing story.");
    }

    if (taskIds.has(task.id)) {
      throw new Error("Task IDs must be unique.");
    }

    taskIds.add(task.id);
  }
}

export function normalizeAiWorkflowOutput(raw: unknown): WorkflowAiOutput {
  const parsed = workflowAiOutputSchema.parse(raw);
  const flow = normalizeGraph(parsed.flow);
  validateJiraPack(parsed.jiraPack);

  return {
    title: parsed.title.trim(),
    summary: parsed.summary.trim(),
    flow,
    jiraPack: parsed.jiraPack,
  };
}
