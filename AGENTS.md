# BA-agents - Instructions for AI

This repo contains **PM/BA context** for the B2B Suite (BSS Commerce on Shopify). It is not an application codebase.

## Canonical Paths

All context files live under **`context/`** using a folder-based structure by app. Do not use `company-context/` or older flat paths such as `context/LOCK_SKILL.md`.

| Purpose | File |
|---------|------|
| Company and suite context | `context/COMPANY.md` |
| Segment / ICP / messaging | `context/references/CUSTOMER_SEGMENTS.md` |
| Discovery synthesis | `context/references/discovery/DISCOVERY_SYNTHESIS_TEMPLATE.md` |
| PRD / Jira / review / estimation | `context/references/prd/PRD_DELIVERY_GUIDELINES.md` |
| PRD discovery questions | `context/references/prd/SOCRATIC_QUESTIONING_FRAMEWORK.md` |
| Product analysis / strategy / prioritization | `context/product-analysis/SKILL.md` + `context/product-analysis/references/*.md` |
| Merchant help docs / setup guides / troubleshooting | `context/help-docs/SKILL.md` + `context/help-docs/references/PILLAR_PAGE_TEMPLATE.md` |
| App Lock | `context/lock/SKILL.md` + `context/lock/references/APP_CONTEXT.md` |
| App Quote / Quick | `context/quote/SKILL.md` + `context/quote/references/APP_CONTEXT.md` |
| App Solution | `context/solution/SKILL.md` + `context/solution/references/APP_CONTEXT.md` |
| Competitor / positioning by app | `context/lock/references/COMPETITIVE_CONTEXT.md`, `context/quote/references/COMPETITIVE_CONTEXT.md`, `context/solution/references/COMPETITIVE_CONTEXT.md` |
| Merchant-facing changelog | `context/changelog/*.md` |

## Working Approach

1. **Identify the app** first (Lock vs Quote vs Solution vs cross-suite), then read `context/<app>/SKILL.md` and `context/<app>/references/APP_CONTEXT.md`. Read `context/COMPANY.md` when suite framing is needed.
2. Load `context/references/CUSTOMER_SEGMENTS.md` when the ask involves ICP, segmentation, objections, messaging, or GTM fit.
3. Load `context/references/discovery/DISCOVERY_SYNTHESIS_TEMPLATE.md` when the ask is to synthesize discovery inputs, research findings, support signals, or opportunity patterns.
4. Load `context/references/prd/PRD_DELIVERY_GUIDELINES.md` when the ask is about a PRD, RQM, review, Jira breakdown, user story, estimation, or sprint planning.
5. Load `context/references/prd/SOCRATIC_QUESTIONING_FRAMEWORK.md` when the PRD still has weak problem framing, weak evidence, fuzzy scope, solution rationale, or unclear success criteria.
6. Load `context/product-analysis/SKILL.md` and the relevant app context when the ask is about strategic analysis, option comparison, DHM, SWOT, Devil's Advocate, initiative prioritization, or discovery synthesis.
7. Load `context/help-docs/SKILL.md` and the relevant app context when the ask is for a help doc, setup guide, troubleshooting article, or merchant-facing support content.
8. Write specs / RQMs / PRDs using the structure in the relevant `context/<app>/SKILL.md` plus the shared PRD references when applicable.
9. For requirement outputs, keep **requirement titles in English** and **requirement body content in Vietnamese**.
10. Before describing shipped behavior or public feature names, check `context/changelog/` to keep wording accurate.
11. For competitor, positioning, or win-loss questions, load the matching `context/<app>/references/COMPETITIVE_CONTEXT.md`.

For routing details and changelog usage, see **`.cursor/rules/bss-b2b-suite-context.mdc`**.
