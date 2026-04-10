import test from "node:test";
import assert from "node:assert/strict";

import {
  parseWorkflowAiOutputText,
  sanitizeWorkflowJsonCandidate,
} from "@/lib/workflows/output";

const validPayload = `{
  "title": "Quote approval workflow",
  "summary": "Generate a simple quote approval path.",
  "flow": {
    "nodes": [
      { "id": "start", "kind": "start_event", "label": "Start" },
      { "id": "draft", "kind": "task", "label": "Draft quote" },
      { "id": "approve", "kind": "exclusive_gateway", "label": "Approved?" },
      { "id": "end", "kind": "end_event", "label": "Done" }
    ],
    "edges": [
      { "id": "f1", "source": "start", "target": "draft" },
      { "id": "f2", "source": "draft", "target": "approve" },
      { "id": "f3", "source": "approve", "target": "end", "label": "Yes" }
    ]
  },
  "jiraPack": {
    "epic": {
      "titleEn": "New: Generate workflow artifact for quote approval",
      "descriptionVi": "Sinh workflow artifact cho luong phe duyet bao gia."
    },
    "stories": [
      {
        "id": "story_1",
        "titleEn": "New: Create workflow generation API",
        "descriptionVi": "Tao API sinh workflow.",
        "acceptanceCriteriaVi": ["API tra ve workflow hop le."]
      }
    ],
    "tasks": [
      {
        "id": "task_1",
        "titleEn": "Tech: Build BPMN XML serializer",
        "descriptionVi": "Xay dung serializer cho BPMN XML.",
        "storyId": "story_1",
        "dependsOn": []
      }
    ]
  }
}`;

test("parseWorkflowAiOutputText extracts JSON from fenced output", () => {
  const parsed = parseWorkflowAiOutputText(`Here is the result:\n\n\`\`\`json\n${validPayload}\n\`\`\``);

  assert.equal(parsed.title, "Quote approval workflow");
  assert.equal(parsed.flow.nodes.length, 4);
});

test("sanitizeWorkflowJsonCandidate removes trailing commas and smart quotes", () => {
  const sanitized = sanitizeWorkflowJsonCandidate(`{
    “title”: “Quote approval workflow”,
    “summary”: “Generate a simple quote approval path.”,
    “flow”: {
      “nodes”: [
        { “id”: “start”, “kind”: “start_event”, “label”: “Start” },
        { “id”: “draft”, “kind”: “task”, “label”: “Draft quote” },
        { “id”: “approve”, “kind”: “exclusive_gateway”, “label”: “Approved?” },
        { “id”: “end”, “kind”: “end_event”, “label”: “Done” },
      ],
      “edges”: [
        { “id”: “f1”, “source”: “start”, “target”: “draft” },
        { “id”: “f2”, “source”: “draft”, “target”: “approve” },
        { “id”: “f3”, “source”: “approve”, “target”: “end”, “label”: “Yes” },
      ],
    },
    “jiraPack”: {
      “epic”: {
        “titleEn”: “New: Generate workflow artifact for quote approval”,
        “descriptionVi”: “Sinh workflow artifact cho luong phe duyet bao gia.”
      },
      “stories”: [
        {
          “id”: “story_1”,
          “titleEn”: “New: Create workflow generation API”,
          “descriptionVi”: “Tao API sinh workflow.”,
          “acceptanceCriteriaVi”: [“API tra ve workflow hop le.”],
        },
      ],
      “tasks”: [
        {
          “id”: “task_1”,
          “titleEn”: “Tech: Build BPMN XML serializer”,
          “descriptionVi”: “Xay dung serializer cho BPMN XML.”,
          “storyId”: “story_1”,
          “dependsOn”: [],
        },
      ],
    },
  }`);

  const parsed = parseWorkflowAiOutputText(sanitized);
  assert.equal(parsed.jiraPack.tasks[0].storyId, "story_1");
});

test("parseWorkflowAiOutputText throws for non-json output", () => {
  assert.throws(
    () => parseWorkflowAiOutputText("This model refused to return a JSON object."),
    /not valid JSON/,
  );
});
