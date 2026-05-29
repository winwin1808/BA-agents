# BSS B2B Docs Template Library

Choose one primary template. Do not merge every template into one long article. Use simple language for merchants and precise technical language for developers.

## Global Rules

- Keep paragraphs short and bullets single-idea.
- Merchant setup steps must be action-only verbs: `Go to`, `Click`, `Select`, `Set`, `Save`, `Activate`.
- Technical docs keep endpoint, field, enum, and payload keys in English.
- Include eligibility and limitations when applicable.
- Support email: `support-sbc@bsscommerce.com`.

## Template Selector

| Intent | Template |
|---|---|
| Explain a feature end to end | `Pillar-Page Help Doc` |
| Configure one workflow | `Setup / Configuration Guide` |
| Diagnose a problem | `Troubleshooting Doc` |
| Public API, import, webhook, payload, developer usage | `Technical / Public API Doc` |
| Shopify or third-party integration | `Integration Doc` |
| Repeated merchant question | `FAQ` |

## Input Checklist

- Feature name, app, store type, buyer group/tag, merchant outcome
- Known plan/region/checkout/setup limitations
- Third-party dependency, if any
- Technical docs only: base URL, auth, endpoint list, request/response fields, rate limits, examples, errors, versioning

---

# Pillar-Page Help Doc

Use for broad merchant-facing feature education.

## Required Structure

1. `Title (Verb + Outcome + Context)`
2. `Intro`
3. `Callout block`
4. `On this page`
5. `Eligibility requirements`
6. `Understanding [feature]`
7. `Availability & limitations`
8. `Adding/configuring`
9. `Third-party support` only for third-party integrations

## Notes

- Intro: 1-2 short paragraphs about merchant outcome.
- Callout: recommendation, tip, or best practice.
- Understanding: what it is, what merchants can do, where it applies.
- Adding/configuring: split into steps; use notes/cautions for verification and common issues.

---

# Setup / Configuration Guide

Use when the main goal is setup.

## Required Structure

1. `Title (Configure + Feature + Outcome)`
2. `Intro`
3. `Before you start`
4. `Setup steps`
5. `Verify the setup`
6. `Common setup mistakes`
7. `Availability & limitations`
8. `Need help?`

## Notes

- `Before you start`: plan, permissions, Shopify setup, buyer groups/tags, theme/app dependencies, data prep.
- `Verify`: expected result plus one negative test when relevant.
- `Need help`: ask for store URL, screenshots, buyer account, rule name, or file evidence as relevant.

---

# Troubleshooting Doc

Use for symptoms, errors, missing output, or broken behavior.

## Required Structure

1. `Title (Fix/Troubleshoot + Symptom)`
2. `What you may see`
3. `Most common causes`
4. `Quick checks`
5. `How to fix it`
6. `How to verify the fix`
7. `When to contact support`

## Notes

- Order causes by likelihood.
- Keep checks merchant-actionable.
- Split fixes by cause.
- Tell support what evidence to send.

---

# Technical / Public API Doc

Use for public APIs, imports, webhooks, payloads, auth, and developer implementation.

## Required Structure

1. `Title (Product + Public API / Technical Topic)`
2. `Overview`
3. `Who should use this`
4. `Prerequisites`
5. `Base URL and authentication`
6. `API conventions`
7. `Endpoint reference`
8. `Request examples`
9. `Response examples`
10. `Errors and troubleshooting`
11. `Rate limits and operational limits`
12. `Versioning and compatibility`
13. `Security and data handling`
14. `Implementation checklist`
15. `Support`

## Notes

- Do not invent endpoints, auth, fields, limits, response codes, or versions.
- Mark unknown values as `Not confirmed`.
- Endpoint table: `Method`, `Endpoint`, `Purpose`, `Required scope/module`, `Notes`.
- Each endpoint should cover purpose, required/optional params, request/response fields, side effects, constraints.
- Examples use fenced `http`, `bash`, or `json`; keep JSON valid and comments outside code.
- Error table: `Error / Symptom`, `Meaning`, `How to fix`.
- Security: mention credential handling and PII/price/order/customer data when relevant.
- Support: ask for store URL, endpoint, request timestamp, sanitized request/response, request ID if available.

---

# Integration Doc

Use for BSS + Shopify or third-party setup.

## Required Structure

1. `Title (Connect/Use + Systems + Outcome)`
2. `Overview`
3. `How the integration works`
4. `Before you start`
5. `Setup steps`
6. `Data mapping`
7. `Testing the integration`
8. `Ownership boundaries`
9. `Limitations`
10. `Troubleshooting`
11. `Support`

## Notes

- Explain data/behavior movement across systems.
- Include mapping table when fields are involved.
- Separate what BSS controls from Shopify/third party.
- Include fallback behavior for sync, checkout, API, or theme failures.

---

# FAQ

Use for short repeated support questions.

## Required Structure

1. `Title`
2. `Short answer`
3. `Details`
4. `Related setup or limitations`
5. `Need help?`

## Notes

- Start with the direct answer.
- Keep one topic per FAQ.
- Link/reference related setup, pillar, or technical doc when relevant.
