import { z } from "zod";

import {
  workflowAiOutputSchema,
  type WorkflowAiOutput,
} from "@/lib/workflows/types";

const JSON_CODE_BLOCK_PATTERN = /```(?:json)?\s*([\s\S]*?)```/gi;

function extractBalancedJsonObject(value: string) {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (start === -1) {
      if (char === "{") {
        start = index;
        depth = 1;
      }
      continue;
    }

    if (escaping) {
      escaping = false;
      continue;
    }

    if (char === "\\" && inString) {
      escaping = true;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return value.slice(start, index + 1);
      }
    }
  }

  return null;
}

function normalizeJsonQuotes(value: string) {
  return value
    .replace(/[“”„‟＂]/g, "\"")
    .replace(/[‘’‚‛＇]/g, "'");
}

function stripControlCharacters(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function removeTrailingCommas(value: string) {
  let result = "";
  let inString = false;
  let escaping = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (escaping) {
      result += char;
      escaping = false;
      continue;
    }

    if (char === "\\" && inString) {
      result += char;
      escaping = true;
      continue;
    }

    if (char === "\"") {
      result += char;
      inString = !inString;
      continue;
    }

    if (!inString && char === ",") {
      let cursor = index + 1;
      while (cursor < value.length && /\s/.test(value[cursor])) {
        cursor += 1;
      }

      if (value[cursor] === "}" || value[cursor] === "]") {
        continue;
      }
    }

    result += char;
  }

  return result;
}

export function sanitizeWorkflowJsonCandidate(value: string) {
  return removeTrailingCommas(
    stripControlCharacters(normalizeJsonQuotes(value.trim().replace(/^\uFEFF/, ""))),
  );
}

function collectJsonCandidates(rawText: string) {
  const candidates: string[] = [];

  function pushCandidate(value: string | null | undefined) {
    if (!value) {
      return;
    }

    const trimmed = value.trim();
    if (!trimmed || candidates.includes(trimmed)) {
      return;
    }

    candidates.push(trimmed);
  }

  const trimmed = rawText.trim();
  pushCandidate(trimmed);

  for (const match of trimmed.matchAll(JSON_CODE_BLOCK_PATTERN)) {
    pushCandidate(match[1]);
  }

  const initialCandidates = [...candidates];
  for (const candidate of initialCandidates) {
    pushCandidate(extractBalancedJsonObject(candidate));
  }

  return candidates;
}

export function parseWorkflowAiOutputText(rawText: string): WorkflowAiOutput {
  const candidates = collectJsonCandidates(rawText);
  const attempts: string[] = [];
  let lastError: Error | z.ZodError | null = null;

  for (const candidate of candidates) {
    for (const attempt of [candidate, sanitizeWorkflowJsonCandidate(candidate)]) {
      if (!attempt || attempts.includes(attempt)) {
        continue;
      }

      attempts.push(attempt);

      try {
        return workflowAiOutputSchema.parse(JSON.parse(attempt));
      } catch (error) {
        if (error instanceof Error || error instanceof z.ZodError) {
          lastError = error;
        }
      }
    }
  }

  if (lastError instanceof z.ZodError) {
    throw lastError;
  }

  const snippet = rawText.trim().slice(0, 240).replace(/\s+/g, " ");
  throw new Error(
    snippet
      ? `Model output was not valid JSON. Snippet: ${snippet}`
      : "Model output was not valid JSON.",
  );
}
