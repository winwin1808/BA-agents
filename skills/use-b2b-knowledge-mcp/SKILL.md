---
name: use-b2b-knowledge-mcp
description: 'Use B2B Knowledge Wiki MCP to verify current BSS B2B Suite behavior, public setup steps, limitations, API details, integration behavior, wiki pages, or documentation gaps before finalizing public-facing or implementation-sensitive content.'
---

# Use B2B Knowledge Wiki MCP

## Purpose

Use this as the verification layer for current product knowledge. App context gives framing; wiki evidence confirms behavior, setup, limitations, API details, compatibility, and docs wording.

## Use Before Finalizing

- Feature behavior, setup steps, eligibility, limitations
- Help docs, setup guides, troubleshooting docs, FAQs
- Technical/public API, webhook, import, payload, rate-limit docs
- Shopify/third-party integration behavior
- Compatibility notes, edge cases, support guidance
- Claims that a feature/API/behavior is currently supported

## Workflow

1. Search with app + module + feature + key terms.
2. Open the most relevant page.
3. Expand to neighbors only when needed for related modules, compatibility, setup dependencies, or API details.
4. If evidence is missing, mark assumption/gap instead of inventing behavior.
5. Log the question outcome after answering.

## Query Hints

- `Lock hide price customer tag setup`
- `Lock checkout lock payment method limitation`
- `Quote quick order CSV import file limit`
- `Quote request form metafields customer account`
- `Solution public API price list authentication`
- `Solution volume pricing import rate limit`
- `Solution registration form company onboarding`

For API docs include: product, module, endpoint/object, `public API`, `authentication`, `payload`, `rate limit`, `error`.

## Evidence Rules

- Explicit wiki page = confirmed.
- Related-page inference = partial; say what is inferred.
- Missing page/field = gap.
- Never invent endpoint URLs, auth schemes, payload/response fields, rate limits, or compatibility claims.
- For unverified technical details, use `Not confirmed`.

## Output Rules

- Name the wiki page path when summarizing verified facts.
- Separate confirmed behavior, assumptions, and gaps.
- Keep concise unless user asks for a full artifact.
- In Vietnamese outputs, keep product, endpoint, field, enum, and code names in English.
