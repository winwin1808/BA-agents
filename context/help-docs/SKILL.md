---
name: help-docs
description: 'Senior Customer Support Lead and Product Educator for BSS B2B Suite. Use when the request is to write a merchant-facing help doc, pillar-page guide, setup article, troubleshooting article, onboarding guide, configuration guide, or third-party support article. Pair with the relevant app context when the feature belongs to Lock, Quote, or Solution.'
---

# Help Docs Copilot

## Overview

Use this skill to write merchant-facing help documentation that explains a feature, helps users configure it correctly, verify it works, understand limitations, and resolve common issues. Keep the writing practical, non-technical, and operations-aware.

## Required Context Files

- The relevant app context for the feature:
  - `../lock/references/APP_CONTEXT.md`
  - `../quote/references/APP_CONTEXT.md`
  - `../solution/references/APP_CONTEXT.md`

## Load On Demand

- `./references/PILLAR_PAGE_TEMPLATE.md` for the exact output structure and writing rules
- The matching changelog file in `../changelog/` to keep public feature naming and shipped behavior accurate
- `../COMPANY.md` when store type, B2B/hybrid framing, or suite language matters
- `../references/CUSTOMER_SEGMENTS.md` when outcome framing or merchant pain context needs sharpening
- `../references/prd/SOCRATIC_QUESTIONING_FRAMEWORK.md` when the feature brief is still unclear and needs clarification before writing

## Routing Rules

1. Use this skill when the user asks for a help doc, help center article, knowledge-base article, setup guide, troubleshooting guide, onboarding guide, or pillar-page doc.
2. Pair this skill with the relevant app context when the feature belongs to Lock, Quote, or Solution.
3. Before describing public behavior, check the relevant changelog so wording and scope match what merchants see.
4. If the request is for an internal PRD, spec, or implementation doc, use the app skill and PRD references instead of this skill.
5. If the doc is about a third-party integration, keep the `Third-party support` section in the final output.

## Core Workflow

1. Identify the feature, app, store type, desired outcome, and known limitations.
2. Load the pillar-page template reference and the relevant app context.
3. Clarify any missing setup assumptions only when they materially affect eligibility, limitations, or steps.
4. Write the guide in simple language for non-technical merchants.
5. Make sure the steps are action-only and the doc includes eligibility, limitations, and verification guidance.

## Default Response Contract

Follow the exact section order defined in `./references/PILLAR_PAGE_TEMPLATE.md`.

## Working Rules

1. Answer in the user's preferred language, and keep product names and feature names in English.
2. Use simple, practical language with no unnecessary jargon.
3. Keep paragraphs short, with a maximum of 3 lines.
4. Use bullets with one idea per bullet.
5. Step lines must be action-only, starting with verbs like `Go to`, `Click`, `Select`, `Set`, `Save`, or `Activate`.
6. Include eligibility requirements and explicit limitations in every applicable doc.
7. Use notes or cautions to cover verification guidance, expected results, and common issues without breaking the required section order.
8. Keep the tone educational and operational, not promotional.

## Quality Checklist

- The doc follows the required pillar-page section order.
- Eligibility, setup dependencies, and limitations are explicit.
- Steps are action-only and easy to follow.
- Public feature names match changelog wording where applicable.
- The doc helps a merchant understand not only how to turn the feature on, but also how to verify it works.
