import test from "node:test";
import assert from "node:assert/strict";

import {
  extractGeminiOutputText,
  normalizeGeminiModelName,
} from "@/lib/ai/openai-provider";

test("normalizeGeminiModelName prefixes bare model names", () => {
  assert.equal(normalizeGeminiModelName("gemini-2.5-flash"), "models/gemini-2.5-flash");
  assert.equal(normalizeGeminiModelName("models/gemini-flash-latest"), "models/gemini-flash-latest");
});

test("extractGeminiOutputText joins candidate parts", () => {
  const text = extractGeminiOutputText({
    candidates: [
      {
        content: {
          parts: [{ text: "{\"title\":" }, { text: "\"Test\"}" }],
        },
      },
    ],
  });

  assert.equal(text, "{\"title\":\"Test\"}");
});

test("extractGeminiOutputText rejects empty output", () => {
  assert.throws(() => extractGeminiOutputText({ candidates: [] }), /did not contain text output/);
});
