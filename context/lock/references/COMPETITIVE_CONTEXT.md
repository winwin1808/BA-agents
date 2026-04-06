# Lock App Competitive Context

**Purpose:** Working-model competitive context for `BSS B2B Lock, Login & Password`. This document prioritizes PM framing, positioning, and feature trade-offs. Do not use it as public-facing competitive intelligence without refreshing the latest marketplace data.

---

## 1) Scope

- Scope: Shopify apps or approaches that solve `catalog access`, `hide price`, `request access`, `passcode/login gating`, `theme hiding`, and `checkout option control`.
- Goal: help PMs ensure Lock wins on `policy breadth + merchant setup clarity + rule safety`, instead of drifting into RFQ positioning or a wholesale suite narrative.

## 2) Key competitive buckets

### Bucket A: Access-control specialists

- Their typical pitch is fast setup for login gating, passcodes, hide price, or private catalogs.
- The risk is merchants may see Lock as "just another hide price/login app" unless we make checkout guardrails and theme hiding depth obvious.

### Bucket B: RFQ + hide-price hybrids

- These apps solve "hide price to push buyers into quote."
- They win when merchants prioritize lead capture or RFQ-specialist workflows.
- Lock should only enter this bucket when the primary goal is visibility policy; if the primary goal is quote funnel performance, defer to the Quote app.

### Bucket C: Native/custom implementation

- Merchants/agencies can solve parts of the problem via theme edits, customer-account logic, or Shopify Functions/customizations.
- Competition here is not a feature checklist; it is about reducing maintenance effort, reducing theme regressions, and improving operability for non-technical teams.

## 3) Structural strengths of BSS Lock

1. Covers both storefront gating and checkout guardrails in a single app.
2. Includes Theme Hiding Profiles for both native targets and custom CSS selectors.
3. Supports more unlock methods and conditions than single-flow lock apps.
4. Fits B2B and hybrid needs without forcing merchants into a full wholesale stack.

## 4) Where we lose if positioning is unclear

1. Merchants only need a very narrow use case (for example basic hide price or a simple private page).
2. The buyer-journey goal is RFQ conversion, but product messaging stays in the lock/access framing.
3. Agencies prefer custom implementations because lock rules are perceived as complex or hard to predict.

## 5) Decision guidance by merchant type

### Merchants who need a private catalog or gated pricing quickly

- Position Lock as faster and safer than custom theme edits.

### Merchants who need a quote-heavy flow

- Lock is only the visibility layer; the primary positioning should shift to the Quote app.

### Merchants who need checkout policy control

- Emphasize shipping/payment method control, publish guardrails, auditability, and deterministic priority.

### Merchants who need a full wholesale operating system

- Lock is not the primary choice; shift framing to the Solution app.

## 6) Positioning questions the skill should answer well

- When Lock wins on `policy breadth` vs `simple hide price`.
- When to cross-sell into Quote or Solution instead of forcing scope into Lock.
- Which module to demo first when the merchant is stuck on access control vs checkout guardrails.

## 7) Caveats

- If the user requests comparisons against specific competitors or current listings, refresh sources before making release-facing conclusions.
- These opinions are internal framing to prevent confusing Lock with Quote or Solution.
