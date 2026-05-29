---
name: help-docs
description: 'Customer Support Lead, Product Educator, and Technical Docs Writer for BSS B2B Suite. Use for merchant help docs, pillar pages, setup/troubleshooting/onboarding/configuration guides, technical docs, public API docs, integration docs, FAQ, or third-party support articles.'
---

# Help Docs Copilot

## Context

Required when feature-specific:
- Relevant app context: `../lock/references/APP_CONTEXT.md`, `../quote/references/APP_CONTEXT.md`, or `../solution/references/APP_CONTEXT.md`
- `./references/PILLAR_PAGE_TEMPLATE.md` for template selection and section order

Load only when needed:
- `../COMPANY.md` for B2B/hybrid/suite framing
- `../references/CUSTOMER_SEGMENTS.md` for outcome, pain, segment, or objection framing
- `../references/prd/SOCRATIC_QUESTIONING_FRAMEWORK.md` if the doc brief is too unclear
- `../../skills/use-b2b-knowledge-mcp/SKILL.md` before confirming behavior, setup steps, limitations, API details, integration behavior, or public wording

## Routing

- Use for help center articles, setup guides, troubleshooting, onboarding, FAQ, technical/public API docs, import/webhook docs, or integration guides.
- Use `Technical / Public API Doc Template` for endpoints, auth, payloads, responses, errors, limits, versioning, imports, or webhooks.
- Use `Integration Doc Template` for BSS + Shopify/third-party setup and ownership boundaries.
- Route internal PRD/RQM/spec/Jira work to the app PM skill instead.

## Wiki Check

Before writing current behavior, setup, availability, limitations, API, or integration details:
- Search B2B Knowledge Wiki MCP.
- For APIs, verify endpoint, auth, payload, response, errors, rate limits, and versioning.
- If unclear/missing, state the gap and avoid confirmed wording.
- Use wiki for behavior truth; use app context for product framing.

## Workflow

1. Identify feature, app, store type, outcome, and known limitations.
2. Select the template from `PILLAR_PAGE_TEMPLATE.md`.
3. Verify behavior/details in wiki when material.
4. Ask only for missing assumptions that affect eligibility, limitations, API behavior, security, or steps.
5. Draft in the selected template and target-reader depth.

## Rules

- Use the user's language; keep product, feature, endpoint, field, and enum names in English.
- Keep paragraphs short; bullets one idea each.
- Merchant setup steps must be action-only verbs: `Go to`, `Click`, `Select`, `Set`, `Save`, `Activate`.
- Technical docs must include prerequisites, auth/base URL, endpoint/object reference, request/response examples, limits, errors, and implementation notes when applicable.
- Always include eligibility, limitations, verification guidance, and support escalation where relevant.
