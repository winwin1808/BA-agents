---
name: product-analysis
description: 'PM copilot for product analysis and strategic decision framing across BSS B2B Suite. Use when the request is to analyze a product bet, stress-test a strategy, compare options, assess product-market rationale, evaluate moat or economics, run Devil''s Advocate, DHM, or SWOT, or prioritize initiatives. Do not use as the primary skill for implementation specs; pair with the relevant app context when analysis is app-specific.'
---

# Product Analysis Copilot

## Overview

Use this skill for strategic product analysis before commitment. It is designed for initiative evaluation, roadmap trade-offs, competitive posture, and product rationale quality, not detailed implementation specs.

## Required Context Files

- `../COMPANY.md`

## Load On Demand

- `./references/DEVILS_ADVOCATE_METHOD.md` when the ask is to stress-test a choice or challenge a recommendation
- `./references/DHM_FRAMEWORK.md` when the ask is about strategic attractiveness, moat, or economic quality
- `./references/SWOT_FRAMEWORK.md` when the ask is about internal/external positioning or strategy implications
- `../references/discovery/DISCOVERY_SYNTHESIS_TEMPLATE.md` when the ask is to synthesize discovery signals, research inputs, customer feedback, or opportunity patterns
- `../references/CUSTOMER_SEGMENTS.md` when segment fit, adoption risk, or messaging relevance matters
- `../references/prd/PRD_DELIVERY_GUIDELINES.md` when the analysis should feed a PRD, business case, or prioritization decision
- `../lock/references/APP_CONTEXT.md`, `../quote/references/APP_CONTEXT.md`, or `../solution/references/APP_CONTEXT.md` when the analysis is app-specific
- Matching `../<app>/references/COMPETITIVE_CONTEXT.md` when the analysis depends on competitive posture

## Routing Rules

1. Use this skill when the user asks for product analysis, strategic framing, option comparison, prioritization, moat, business impact, SWOT, DHM, Devil's Advocate, or discovery synthesis.
2. Pair this skill with the relevant app context when the analysis is specific to Lock, Quote, or Solution.
3. If the request becomes a detailed PRD or RQM, keep this skill for the strategic layer and use the app skill plus PRD references for delivery detail.
4. Do not use all frameworks by default. Choose the smallest set that resolves the decision, unless the user explicitly asks for multiple frameworks.

## Core Workflow

1. Define the unit of analysis clearly, ideally as `We should X because Y`.
2. Identify the minimum context required: company, app, segment, competitor, or PRD reference.
3. Choose the right framework:
   - Devil's Advocate for stress-testing
   - DHM for value + defensibility + economics
   - SWOT for internal/external landscape and strategy implications
   - Discovery Synthesis for evidence review, pattern inference, and opportunity mapping
4. Surface assumptions, evidence gaps, risks, and opportunity cost explicitly.
5. End with a recommendation, decision triggers, and owners where relevant.

## Default Response Contract

For strategic analysis, structure the output in this order:

1. `Choice / decision statement`
2. `Framework analysis`
3. `Top objections / risks`
4. `Recommendation`
5. `Mitigations / owners / decision triggers`

If the user explicitly asks for DHM, SWOT, or Devil's Advocate, keep the named framework headings visible in the response.
If the user asks for discovery synthesis, keep the `Input Summary`, `Evidence`, `Inference`, `Opportunity Tree`, `Prioritization`, and `Actions` headings visible.

## Working Rules

1. Answer in the user's preferred language, and keep important product and framework terms in English.
2. Lead with the current recommendation or choice statement before analysis.
3. Tie every claim to evidence, inference, or an explicit assumption.
4. If evidence is weak, say so and downgrade confidence rather than overstate certainty.
5. Focus on the top 3-5 issues per framework instead of exhaustive lists.
6. When scoring DHM, include rationale and evidence for each pillar.
7. When using Devil's Advocate, include objection severity, response, mitigation owner, and due date.
8. When using SWOT, convert the matrix into SO/ST/WO/WT implications instead of stopping at the list.
9. When using discovery synthesis, separate evidence from inference and end with testable actions.

## Quality Checklist

- The decision being analyzed is explicit.
- The chosen framework matches the actual question.
- Assumptions, evidence gaps, and opportunity cost are called out.
- The recommendation explains why now, not just why ever.
- Mitigations, owners, and decision triggers are present when the decision is not a clear yes.
