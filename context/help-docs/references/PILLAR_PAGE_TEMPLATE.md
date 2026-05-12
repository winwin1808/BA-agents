# BSS B2B Docs Template Library

Use this reference to choose the right documentation template for BSS B2B apps.

The default is the `Pillar-Page Help Doc Template`, but not every doc should use that structure. Technical docs, public API docs, troubleshooting docs, integration guides, FAQ docs, and release notes need different section orders.

## Role

You are a Senior Customer Support Lead, Product Educator, and Technical Docs Writer.

## Goal

Write docs that help the target reader understand a feature, configure or implement it correctly, verify it works, understand limitations, and resolve common issues.

## Audience Options

- Non-technical merchants who care about conversion, revenue, and smooth operations
- Merchant operations teams who configure workflows and validate outcomes
- Technical implementers who build against public APIs, imports, webhooks, or integrations
- Support and CS teams who need reliable troubleshooting and escalation guidance

## Writing Rules

- Use simple, practical language
- Use technical precision when the doc is for developers or integrators
- Keep paragraphs short, maximum 3 lines
- Use bullets with one idea per bullet
- For merchant setup docs, step lines must be action-only
- Prefer setup step verbs such as `Go to`, `Click`, `Select`, `Set`, `Save`, `Activate`
- For technical docs, keep endpoint names, field names, code values, and payload keys in English
- For technical docs, include examples that are copyable and clearly labeled as examples
- Include eligibility requirements
- Include limitations

## Template Selector

Choose one primary template before writing:

| User intent | Use template | Notes |
|---|---|---|
| Explain a feature end to end | `Pillar-Page Help Doc Template` | Best default for feature education and broad setup guidance |
| Show how to set up one workflow | `Setup / Configuration Guide Template` | Use when the ask is mostly step-by-step configuration |
| Diagnose a problem | `Troubleshooting Doc Template` | Use when the ask includes errors, symptoms, missing output, or "not working" cases |
| Document public APIs, imports, webhooks, payloads, or developer usage | `Technical / Public API Doc Template` | Use for product public API docs and implementation references |
| Explain Shopify or third-party integration setup | `Integration Doc Template` | Use when responsibility boundaries matter |
| Answer common merchant questions | `FAQ Template` | Use for short support articles or repeated objections |
| Announce shipped changes to merchants | `Release Note / Changelog Doc Template` | Use when the doc explains what changed and who is affected |

If a doc combines multiple intents, choose the primary template and add only the supporting sections needed. Do not merge every template into one long article.

## Input Checklist

Collect or infer the minimum context before writing:

- Feature name
- Relevant app: Lock, Quote, or Solution
- Store type: B2B-only or hybrid
- Buyer groups or tags involved
- Desired merchant outcome
- Known limitations such as plan, region, checkout type, or setup dependencies
- Whether the feature includes a third-party integration
- For technical docs: base URL, authentication method, endpoint list, request fields, response fields, rate limits, examples, error behavior, versioning, and support contact
- Support email: `support-sbc@bsscommerce.com`

---

# Pillar-Page Help Doc Template

Use this template when writing a broad merchant-facing help doc that explains a feature end to end.

## Required Output Structure

Follow this exact order:

1. `Title (Verb + Outcome + Context)`
2. `Intro`
3. `Callout block`
4. `On this page`
5. `Eligibility requirements`
6. `Understanding [feature]`
7. `Availability & limitations`
8. `Adding/configuring`
9. `Third-party support` if writing a third-party integration doc

## Section Guidance

### 1. Title

- Use the format `Verb + Outcome + Context`
- Keep it clear and action-oriented

### 2. Intro

- Write 1-2 short paragraphs
- Explain what the feature helps merchants achieve
- Include `availability may vary by plan/setup` if relevant

### 3. Callout Block

Use one short block such as:

- Quick recommendation
- Tip
- Best practice

### 4. On This Page

- Add a short TOC as bullets
- Use the exact section names or close equivalents

### 5. Eligibility Requirements

- List the exact conditions required before setup
- Include plan, store type, checkout type, app dependencies, tags, or permissions where relevant

### 6. Understanding [feature]

Cover these three ideas:

- What it is
- What merchants can do with it
- Where it applies

### 7. Availability & Limitations

- Make limitations explicit
- Use a table if the availability differs by plan, region, checkout type, or setup
- Be clear about anything unsupported or partially supported

### 8. Adding/Configuring

- Split into `Step 1`, `Step 2`, and more if needed
- Keep each step action-only
- Add `Note` or `Caution` blocks where needed
- Use notes/cautions to explain verification checks, expected outcomes, and common issues while keeping the required section order intact

### 9. Third-party Support

- Only include this section if the feature depends on or connects to a third-party service
- Explain what the third party controls vs what BSS controls
- Include the support contact `support-sbc@bsscommerce.com` when merchants may need help

## Output Expectations

The final doc should help a merchant:

- Understand what the feature does
- Know whether they are eligible to use it
- Configure it correctly
- Verify it works
- Understand known limitations
- Know where to get help if needed

---

# Setup / Configuration Guide Template

Use this template when the doc's main purpose is to help merchants configure one workflow correctly.

## Required Output Structure

Follow this exact order:

1. `Title (Configure + Feature + Outcome)`
2. `Intro`
3. `Before you start`
4. `Setup steps`
5. `Verify the setup`
6. `Common setup mistakes`
7. `Availability & limitations`
8. `Need help?`

## Section Guidance

### 1. Title

- Use a direct setup title, such as `Configure [feature] for [outcome]`
- Keep it specific to the workflow

### 2. Intro

- Explain what the setup achieves
- Mention the store type or buyer group if relevant

### 3. Before You Start

- List required plan, permissions, Shopify setup, buyer groups, tags, theme setup, or app dependencies
- Include any data or file preparation needed before setup

### 4. Setup Steps

- Split into `Step 1`, `Step 2`, and more if needed
- Keep each step action-only
- Add short notes only after the action lines

### 5. Verify The Setup

- Explain how to test the setup as a merchant or buyer
- Include expected results
- Include at least one negative test when relevant

### 6. Common Setup Mistakes

- List likely causes of incorrect behavior
- Use simple merchant-facing language

### 7. Availability & Limitations

- Explain unsupported plans, checkout types, Shopify constraints, theme constraints, or app conflicts

### 8. Need Help?

- Include `support-sbc@bsscommerce.com`
- Tell merchants what screenshots, store URL, buyer account, or rule name to provide

---

# Troubleshooting Doc Template

Use this template when the doc starts from a symptom, error, missing result, or broken behavior.

## Required Output Structure

Follow this exact order:

1. `Title (Fix/Troubleshoot + Symptom)`
2. `What you may see`
3. `Most common causes`
4. `Quick checks`
5. `How to fix it`
6. `How to verify the fix`
7. `When to contact support`

## Section Guidance

### 1. Title

- Use a symptom-based title, such as `Troubleshoot [symptom]`

### 2. What You May See

- List visible symptoms, warning messages, missing UI, incorrect price, or failed sync behavior

### 3. Most Common Causes

- List causes in likely order
- Keep each cause tied to a merchant-checkable condition

### 4. Quick Checks

- Provide fast checks before detailed fixes
- Keep checks short and action-oriented

### 5. How To Fix It

- Split fixes by cause
- Use action-only steps for merchant actions

### 6. How To Verify The Fix

- Explain the expected correct behavior
- Include storefront/admin/account checks where relevant

### 7. When To Contact Support

- Include `support-sbc@bsscommerce.com`
- Tell merchants what evidence to send

---

# Technical / Public API Doc Template

Use this template when documenting product public APIs, endpoint references, import APIs, webhooks, payloads, authentication, or developer implementation.

## Required Output Structure

Follow this exact order:

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

## Section Guidance

### 1. Title

- Use a clear technical title, such as `BSS B2B Solution Public APIs`
- Include the product name when the API belongs to one app

### 2. Overview

- Explain what the API lets implementers do
- Mention the main supported use cases
- State whether the API is intended for production automation, migration, import, sync, or reporting

### 3. Who Should Use This

- Identify the expected reader: developer, integration partner, merchant technical team, or CS/implementation team
- Avoid writing this section like a marketing intro

### 4. Prerequisites

- List app installation, plan, permission, enabled module, Shopify setup, API credential, or store configuration requirements
- Include any data preparation requirements

### 5. Base URL And Authentication

- Provide the base URL if known
- Explain the authentication method
- Show required headers or token placement when known
- Do not invent secrets, endpoint hosts, or auth schemes

### 6. API Conventions

Include only the conventions that apply:

- Content type
- HTTP methods
- Pagination
- Idempotency
- Date and time format
- Currency format
- Market, customer, company, product, variant, or rule identifiers
- Async processing behavior

### 7. Endpoint Reference

Use a table when multiple endpoints exist:

| Method | Endpoint | Purpose | Required scope/module | Notes |
|---|---|---|---|---|
| `POST` | `/example` | Example purpose | Example module | Example note |

For each endpoint, include:

- Purpose
- Required parameters
- Optional parameters
- Request body fields
- Response fields
- Side effects
- Known constraints

### 8. Request Examples

- Use fenced code blocks with `http`, `bash`, or `json`
- Label every example
- Keep example payloads realistic but not sensitive
- Add comments outside the code block, not inside JSON

### 9. Response Examples

- Include success and failure examples when known
- Explain important fields after the example
- Avoid promising fields that are not confirmed

### 10. Errors And Troubleshooting

Use a table when possible:

| Error / Symptom | Meaning | How to fix |
|---|---|---|
| `401 Unauthorized` | Missing or invalid credential | Check the API credential and auth header |

Include validation errors, rate-limit errors, payload-size errors, sync failures, and partial success behavior when applicable.

### 11. Rate Limits And Operational Limits

- State request limits, file-size limits, payload-size limits, processing windows, retry guidance, and batching guidance
- Include Shopify or third-party limits if they affect implementation
- If limits are unknown, say they are not confirmed instead of guessing

### 12. Versioning And Compatibility

- State supported API version or app version if known
- Explain backwards compatibility expectations
- Mention breaking-change risks or deprecated fields when relevant

### 13. Security And Data Handling

- Explain credential handling
- Mention PII, customer data, price data, and order data considerations where relevant
- Tell implementers not to expose credentials in frontend code

### 14. Implementation Checklist

- Provide a short checklist for developers before go-live
- Include auth, sandbox/test store, payload validation, retry behavior, monitoring, and rollback where relevant

### 15. Support

- Include `support-sbc@bsscommerce.com`
- Ask for store URL, endpoint, request timestamp, sanitized request body, sanitized response body, and correlation/request ID if available

## Technical Writing Rules

- Do not invent endpoints, fields, auth methods, rate limits, or response codes
- Mark unknown values as `Not confirmed` or ask for source data
- Keep examples syntactically valid
- Use English for endpoint names, field names, enum values, and code examples
- Use Vietnamese or the user's preferred language for explanations when requested

---

# Integration Doc Template

Use this template when the doc explains setup or behavior across BSS, Shopify, and a third-party system.

## Required Output Structure

Follow this exact order:

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

## Section Guidance

- Explain what data or behavior moves between systems
- Include a data mapping table when fields are involved
- Separate what BSS controls from what Shopify or the third party controls
- Include fallback behavior when sync, checkout, API, or theme behavior fails
- Include `support-sbc@bsscommerce.com`

---

# FAQ Template

Use this template for short support content that answers repeated merchant questions.

## Required Output Structure

Follow this exact order:

1. `Title`
2. `Short answer`
3. `Details`
4. `Related setup or limitations`
5. `Need help?`

## Section Guidance

- Start with the direct answer
- Keep each question focused on one topic
- Link or reference the setup guide, pillar page, or technical doc when relevant
- Include `support-sbc@bsscommerce.com` only when escalation is likely

---

# Release Note / Changelog Doc Template

Use this template when writing merchant-facing documentation for shipped changes.

## Required Output Structure

Follow this exact order:

1. `Title (What changed)`
2. `Summary`
3. `Who is affected`
4. `What changed`
5. `What merchants need to do`
6. `Availability & limitations`
7. `Support`

## Section Guidance

- Keep the summary short and factual
- Use the exact public feature names from the changelog
- Make required merchant action explicit
- Explain whether existing settings continue to work
- Include `support-sbc@bsscommerce.com` when merchants may need help
