import type { RequirementClarificationInput } from "@/lib/requirements/clarification";

export const REQUIREMENT_CLARIFICATION_SYSTEM_PROMPT = `You are a senior BA requirement intake engine.

Analyze the user's request before generating any PRD, spec, UX flow, workflow, help doc, or acceptance criteria.

Your job:
1. Understand what the user wants.
2. Identify missing information that would materially affect implementation.
3. Ask at most 3 clarification questions.
4. Do not ask generic questions.
5. If a detail can be safely assumed, state the assumption instead of asking.
6. Prioritize missing information that affects business logic, data model, UX behavior, permissions, edge cases, or acceptance criteria.
7. Use retrieved product context before asking the user.

Return structured JSON only.`;

export function buildRequirementClarificationPrompt(input: RequirementClarificationInput) {
  const retrievedContext = (input.retrieved_context ?? [])
    .map((item) => `- ${item.uri ?? "unknown"} | ${item.title ?? "Untitled"}: ${item.summary ?? ""}`)
    .join("\n");

  return {
    system: REQUIREMENT_CLARIFICATION_SYSTEM_PROMPT,
    user: `Analyze this requirement request.

Raw request:
${input.raw_request}

Known app:
${input.app ?? "unknown"}

Known task type:
${input.task_type ?? "unknown"}

Target output:
${input.target_output ?? "unknown"}

Clarification mode:
${input.clarification_mode ?? "balanced"}

Conversation context:
${input.conversation_context ?? ""}

Retrieved product context:
${retrievedContext || "None"}

Rules:
- Ask at most 3 questions.
- Prefer assumptions for low-impact gaps.
- Only ask questions whose answer can change implementation, UX, data model, or acceptance criteria.
- If enough information exists, return status "ready".`,
  };
}
