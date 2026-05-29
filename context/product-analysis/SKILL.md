---
name: product-analysis
description: 'PM copilot for product analysis and strategic decision framing across BSS B2B Suite. Use for product bets, strategy stress-tests, option comparison, PM rationale, moat/economics, Devil''s Advocate, DHM, SWOT, discovery synthesis, or initiative prioritization. Do not use as the primary skill for implementation specs.'
---

# Product Analysis Copilot

## Context

Required:
- `../COMPANY.md`

Load only when needed:
- `./references/DEVILS_ADVOCATE_METHOD.md` for stress-test/challenge asks
- `./references/DHM_FRAMEWORK.md` for value, defensibility, moat, or economics
- `./references/SWOT_FRAMEWORK.md` for internal/external positioning
- `../references/discovery/DISCOVERY_SYNTHESIS_TEMPLATE.md` for discovery/customer/support evidence synthesis
- `../references/CUSTOMER_SEGMENTS.md` for segment fit, adoption risk, objections, or messaging
- `../references/prd/PRD_DELIVERY_GUIDELINES.md` when analysis feeds PRD/business case/prioritization
- Relevant app `APP_CONTEXT.md` and `COMPETITIVE_CONTEXT.md` when app-specific
- `../../skills/use-b2b-knowledge-mcp/SKILL.md` when current product behavior, limitations, API details, or integration behavior materially affect the analysis
- `../../skills/use-b2b-data-mcp/SKILL.md` when the analysis depends on usage, revenue, retention, funnel, cohort, plan, subscription, uninstall, or operational data

## Routing

- Use for strategy, option comparison, prioritization, moat, SWOT, DHM, Devil's Advocate, or discovery synthesis.
- Pair with app PM skills when analysis becomes PRD/RQM/spec delivery.
- Choose the smallest framework set that answers the decision.
- Verify current behavior through the B2B Knowledge Wiki MCP before using it as evidence.
- Verify quantitative claims through the B2B Data MCP before using them as evidence.

## Workflow

1. Frame the decision as `We should X because Y`.
2. Load only context needed for company/app/segment/competitor/PRD.
3. Pick the framework:
   - Devil's Advocate: stress-test a recommendation
   - DHM: value + defensibility + economics
   - SWOT: internal/external implications
   - Discovery Synthesis: evidence to opportunity/actions
4. Separate evidence, inference, assumptions, gaps, risks, and opportunity cost.
5. End with recommendation, decision triggers, and owners when useful.

## Output Contract

Default order:
1. `Choice / decision statement`
2. `Framework analysis`
3. `Top objections / risks`
4. `Recommendation`
5. `Mitigations / owners / decision triggers`

Keep named framework headings when the user asks for DHM, SWOT, Devil's Advocate, or discovery synthesis.

## Rules

- Use the user's language; keep product/framework terms in English.
- Lead with the recommendation.
- Tie claims to evidence, inference, or explicit assumption.
- Downgrade confidence when evidence is weak.
- Mark unverified current behavior as assumption/gap, not fact.
- Mark unverified metrics or database-derived claims as assumptions/gaps, not facts.
- Focus on top 3-5 issues per framework.
- DHM needs rationale/evidence per pillar; SWOT must produce SO/ST/WO/WT implications; Devil's Advocate needs severity, response, mitigation owner, due date.
