import test from "node:test";
import assert from "node:assert/strict";

import { buildSemanticBpmnXml } from "@/lib/workflows/bpmn";
import { normalizeAiWorkflowOutput } from "@/lib/workflows/graph";

test("normalizeAiWorkflowOutput accepts a valid simple workflow", () => {
  const output = normalizeAiWorkflowOutput({
    title: "Quote approval workflow",
    flow: {
      nodes: [
        { id: "start", kind: "start_event", label: "Start" },
        { id: "draft", kind: "task", label: "Draft quote" },
        { id: "approve", kind: "exclusive_gateway", label: "Approved?" },
        { id: "end", kind: "end_event", label: "Done" },
      ],
      edges: [
        { id: "f1", source: "start", target: "draft" },
        { id: "f2", source: "draft", target: "approve" },
        { id: "f3", source: "approve", target: "end", label: "Yes" },
      ],
    },
  });

  assert.equal(output.flow.nodes.length, 4);
  assert.equal(output.title, "Quote approval workflow");
});

test("normalizeAiWorkflowOutput rejects workflows with multiple start events", () => {
  assert.throws(
    () =>
      normalizeAiWorkflowOutput({
        title: "Invalid workflow",
        flow: {
          nodes: [
            { id: "start_1", kind: "start_event", label: "Start A" },
            { id: "start_2", kind: "start_event", label: "Start B" },
            { id: "end", kind: "end_event", label: "Done" },
          ],
          edges: [{ id: "f1", source: "start_1", target: "end" }],
        },
      }),
    /exactly one start event/,
  );
});

test("buildSemanticBpmnXml emits BPMN sequence flows", () => {
  const xml = buildSemanticBpmnXml(
    {
      nodes: [
        { id: "start_1", kind: "start_event", label: "Start" },
        { id: "task_1", kind: "task", label: "Review request" },
        { id: "end_1", kind: "end_event", label: "Done" },
      ],
      edges: [
        { id: "flow_1", source: "start_1", target: "task_1", label: null },
        { id: "flow_2", source: "task_1", target: "end_1", label: null },
      ],
    },
    "Sample workflow",
  );

  assert.match(xml, /<bpmn:startEvent/);
  assert.match(xml, /<bpmn:task/);
  assert.match(xml, /<bpmn:endEvent/);
  assert.match(xml, /<bpmn:sequenceFlow id="flow_1"/);
});
