import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeRequirementGaps,
  detectApp,
  detectTaskType,
} from "@/lib/requirements/clarification";
import { buildRequirementClarificationPrompt } from "@/lib/requirements/clarification-prompt";

test("detects Solution app from pricing and segment language", () => {
  assert.equal(detectApp("Tạo spec price list theo customer segment"), "solution");
});

test("detects PRD/spec task type", () => {
  assert.equal(detectTaskType("Viết spec và acceptance criteria"), "prd");
});

test("asks contextual pricing rule question for Solution price list gaps", () => {
  const result = analyzeRequirementGaps({
    raw_request: "Tạo spec cho tính năng price list theo customer segment",
    clarification_mode: "balanced",
  });

  assert.equal(result.status, "needs_clarification");
  assert.equal(result.detected_app, "solution");
  assert.equal(result.detected_task_type, "prd");
  assert.ok(result.questions.length <= 3);
  assert.ok(
    result.questions.some((question) =>
      question.question.includes("match nhiều price list"),
    ),
  );
});

test("minimal mode asks only one question", () => {
  const result = analyzeRequirementGaps({
    raw_request: "Viết PRD cho quick order CSV",
    clarification_mode: "minimal",
  });

  assert.equal(result.questions.length, 1);
});

test("can proceed with assumptions when explicitly allowed", () => {
  const result = analyzeRequirementGaps({
    raw_request: "Viết PRD cho quick order CSV",
    proceed_with_assumptions: true,
  });

  assert.equal(result.status, "ready");
  assert.ok(result.ready_summary);
});

test("builds an LLM prompt pair for external model-backed clarification", () => {
  const prompt = buildRequirementClarificationPrompt({
    raw_request: "Thiết kế workflow approval cho B2B quote",
    retrieved_context: [
      {
        uri: "bss://app/quote/context",
        title: "BSS B2B Quote App Context",
        summary: "RFQ, quote operations, quick order, and buyer ordering flows.",
      },
    ],
  });

  assert.ok(prompt.system.includes("senior BA requirement intake engine"));
  assert.ok(prompt.user.includes("bss://app/quote/context"));
});
