---
name: use-ba-agents-mcp
description: 'Use when the task needs BA Agents MCP to retrieve trusted BSS B2B Suite context, open canonical documents, check changelog wording, recommend a minimal context bundle, or generate a very basic reference UI from a confirmed UX/UI task. Covers Lock, Quote/Quick, Solution, and cross-suite BA/PM work.'
---

# Use BA Agents MCP

## Overview

Use this skill when the answer should come from the BA Agents MCP instead of memory. The MCP is the trusted retrieval layer for BSS B2B Suite BA/PM context and the entry point for low-fidelity reference UI generation.

## Preconditions

- Assume the MCP server is already configured and authenticated in the client.
- If the BA Agents tools are unavailable, say the MCP is not connected instead of guessing.

## Start Here

1. Identify the app first: `lock`, `quote`, `solution`, or cross-suite.
2. Identify the task type: `prd`, `discovery`, `competitive`, `help-doc`, `release`, or `planning`.
3. Prefer MCP retrieval over memory whenever the task depends on canonical docs, templates, changelog wording, or current app context.

## Tool Routing

- `search_context`: Default starting point for fuzzy asks. Add `app`, `task_type`, and `feature_area` whenever you can.
- `suggest_context_bundle`: Use before drafting a PRD, discovery synthesis, help doc, release brief, or strategic recommendation. Treat this as the minimum trusted starter set.
- `get_document`: Use after search or bundle selection when you need the full canonical document, metadata, or related documents.
- `list_documents`: Use when the user wants browsing, filtered inventory, or discovery by metadata.
- `get_changelog`: Use before asserting shipped behavior, public feature names, or merchant-facing wording.
- `get_resource_catalog`: Use for health-checks, onboarding, or coverage checks across kinds, apps, and freshness.
- `generate_reference_ui`: Use only after the UX/UI task is confirmed. Pass the full confirmed task verbatim in `confirmed_task`. Keep expectations low-fidelity and non-production.

## Default Workflows

### PRD or Spec

1. Call `suggest_context_bundle` with `task_type="prd"` and the right `app`.
2. Call `search_context` for the specific problem, feature, or module.
3. Call `get_document` for the top app-context or template URIs.
4. Call `get_changelog` before finalizing naming or shipped behavior.
5. Draft the artifact from the retrieved sources.
6. For requirement outputs, keep requirement titles in English and requirement body content in Vietnamese.

### Discovery or Synthesis

1. Call `suggest_context_bundle` with `task_type="discovery"`.
2. Use `search_context` for the theme, segment, or problem area.
3. Open the most relevant docs with `get_document`.
4. Separate evidence from inference in the output.

### Help Doc or Merchant-Facing Content

1. Call `suggest_context_bundle` with `task_type="help-doc"`.
2. Use `get_changelog` to verify merchant-facing names and shipped scope.
3. Use `get_document` on the help-doc template or app context before writing.

### UX/UI Reference

1. Confirm the UX/UI task with the user first.
2. Call `generate_reference_ui` only after the task is confirmed.
3. Pass the full confirmed task in `confirmed_task`, not a short summary.
4. Treat the output as a reference only. Do not present it as production-ready design or implementation-ready frontend code.

## Search Heuristics

- If the first search is broad, narrow it with `app`, `task_type`, or `feature_area`.
- When the task is ambiguous, prefer app context and templates before changelog details.
- If the user already has a known `bss://` URI, skip search and use `get_document`.
- If results still look noisy, use `list_documents` to inspect available metadata combinations.

## Prompt Usage

If the client supports MCP prompts, prefer these after retrieval:

- `draft_prd`
- `synthesize_discovery`
- `write_help_doc`
- `analyze_strategy`

Use the prompts after you already know the correct app and have at least one relevant document or bundle in hand.

## Quality Rules

- Do not claim a feature is shipped or public without checking `get_changelog`.
- Do not invent canonical file names, app terminology, or feature labels when the MCP can verify them.
- Keep summaries concise and source-backed.
- When confidence is low, say what is missing and which document should be opened next.
