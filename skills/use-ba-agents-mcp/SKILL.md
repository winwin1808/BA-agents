---
name: use-ba-agents-mcp
description: 'Use BA Agents MCP to retrieve trusted BSS B2B Suite context, open canonical documents, recommend context bundles, analyze requirement gaps, generate workflow artifacts, or create basic reference UI. Covers Lock, Quote/Quick, Solution, and cross-suite BA/PM work.'
---

# Use BA Agents MCP

## Purpose

Use BA Agents MCP instead of memory for canonical BA/PM context, templates, gap analysis, workflow artifacts, and low-fidelity reference UI. Pair with `../use-b2b-knowledge-mcp/SKILL.md` when current behavior, setup steps, limitations, API details, or integration behavior must be verified.

## Start

1. Identify app: `lock`, `quote`, `solution`, or `cross_suite`.
2. Identify task: `prd`, `discovery`, `competitive`, `help_doc`, `release`, or `planning`.
3. Prefer MCP retrieval over memory for canonical context/templates.
4. Use B2B Knowledge Wiki MCP for public-facing or implementation-sensitive behavior verification.

## Tool Routing

- `suggest_context_bundle`: starter bundle for PRD, discovery, help doc, release brief, strategy.
- `search_context`: fuzzy lookup; add `app`, `task_type`, `feature_area` when possible.
- `get_document`: open full canonical docs after search/bundle or known `bss://` URI.
- `list_documents`: browse by metadata.
- `get_resource_catalog`: health/coverage check.
- `analyze_requirement_gaps`: before drafting PRD/spec/UX/workflow/help doc/AC when request may be incomplete.
- `generate_workflow_artifact`: BPMN/process/approval/handoff diagrams.
- `generate_reference_ui`: only after UX/UI task is confirmed; output is reference only.

## Workflows

PRD/spec:
1. `suggest_context_bundle(task_type="prd")`
2. `search_context` for problem/feature/module
3. `get_document` for top context/template
4. `analyze_requirement_gaps`
5. Ask only high-priority questions unless user accepts assumptions
6. Verify behavior/API/limits/public wording via B2B Knowledge Wiki MCP when material
7. Draft from retrieved context + assumptions

Discovery:
1. `suggest_context_bundle(task_type="discovery")`
2. `search_context`
3. `get_document`
4. Separate evidence from inference

Help doc:
1. `suggest_context_bundle(task_type="help-doc")`
2. `get_document` for help template/app context
3. Verify behavior/setup/limitations/API/integration via B2B Knowledge Wiki MCP

UI reference:
1. Confirm full UX/UI task
2. Call `generate_reference_ui` with the confirmed task verbatim

Workflow diagram:
1. Use one process per artifact
2. Include trigger, actors, main flow, decisions, exceptions, end states
3. Choose `context_scope`: `lock`, `quote`, `solution`, or `cross_suite`

## Rules

- Do not invent canonical file names, app terminology, or feature labels when MCP can verify them.
- Do not present behavior/setup/API/limits/integration details as confirmed unless verified through BA Agents context or B2B Knowledge Wiki MCP.
- Do not draft implementation-ready requirements while `analyze_requirement_gaps` returns `needs_clarification`, unless user accepts assumptions.
- Keep summaries concise and source-backed; state missing docs when confidence is low.
