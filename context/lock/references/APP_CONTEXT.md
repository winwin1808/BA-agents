# BSS B2B Lock App Context

**Purpose:** Dedicated context for `BSS B2B Lock, Login & Password` so PM skills answer with the right app whenever the request is about lock rules, hide price, access control, theme hiding, and checkout guardrails.

---

## 1) App identity

- **Official name:** BSS B2B Lock, Login & Password
- **Common aliases:** B2B Lock, Lock app, Lock/Login app
- **Core promise:** Help merchants control who can see catalog/price/buy actions/checkout options/storefront content without requiring manual theme edits for most common use cases.
- **Official documentation (GitBook):** <https://docs-shpf.bsscommerce.com/bss-b2b-lock-login-password-hide-price>

## 2) Core ICP

### Best-fit merchants

- Shopify merchants who need catalog or pricing gating based on login state, customer tags, passcode, secret link, email domain, IP, locale, or time windows.
- B2B/hybrid merchants who need to hide price or hide Add to Cart until a buyer is approved.
- Merchants who need checkout-level guardrails such as hiding payment methods or shipping methods based on policy.
- Merchants who need theme hiding for widgets, sections, blocks, or third-party components.

### Representative use cases

1. Hide price or hide products for guests/unapproved segments.
2. Gate catalog via login, passcode, request access, or age verification.
3. Adjust shipping/payment methods based on customer/cart conditions.
4. Hide theme elements via native targets or custom CSS selectors.

## 4) App module scope

### In-scope

- Login lock / customer account gating
- Hide price / hide Add to Cart / hide product or collection
- Passcode, secret link, email registration, request access
- Age verification
- Theme hiding profile
- Checkout lock
- Payment method hiding
- Shipping method hide/show/rename/reorder
- Lock analytics, passcode requests, countdown/date conditions

### Not the primary scope

- RFQ workflow, quote history, quote-to-order conversion
- Price list, custom pricing, volume pricing, registration form data model
- Net terms, tax exempt, manual orders, wholesale pricing engine

## 5) Canonical terms

- **Lock rule:** A rule that defines conditions + target + unlock/action.
- **Lock target:** What is affected (for example product price, Add to Cart, collection, payment method, shipping method, theme element).
- **Unlock method:** How a buyer passes the lock (for example login, passcode, request access, secret link).
- **Theme Hiding Profile:** Configuration for hiding theme elements via native targets or CSS selectors.
- **Checkout guardrail:** Rules applied to checkout options such as payment/shipping methods.
- **Visibility state:** Whether content is visible, hidden, or gated.

## 6) Key workflows to prioritize

### Workflow A: Hide price for unqualified buyers

1. Merchant creates a lock rule based on login state, tags, company/location, or customer conditions.
2. Merchant selects targets such as price or Add to Cart.
3. Merchant chooses an unlock method and replacement message/CTA.
4. Buyer sees the hidden state and performs login/request access to continue.

### Workflow B: Theme hiding profile

1. Merchant selects a specific theme.
2. Merchant creates definitions via `Native Section/Block` or `Custom CSS Selector`.
3. Merchant previews install status and resolves errors based on definitions.
4. Merchant publishes/installs so the storefront applies the intended targets.

### Workflow C: Shipping/payment guardrails

1. Merchant creates rules with customer/cart/address/time conditions.
2. Merchant chooses actions such as `Hide`, `Show`, `Rename`, or `Reorder`.
3. The system blocks publishing if no valid method remains.
4. Rules publish with deterministic priority and clear audit logs.

## 7) Suggested KPIs for specs/reviews

- Activation: merchant successfully creates and publishes the first rule
- Time to first protected experience
- Request access / passcode submit rate
- Hidden-price-to-qualified-action rate
- Publish success rate for shipping/payment rules
- Support ticket rate related to lock conflicts or theme compatibility

## 8) Common confusion with other apps

- **Vs Quote app:** Lock controls `visibility/access`; Quote handles `RFQ/quote/quick order`. If the main question is quote forms, quote history, or quote conversion, that is Quote.
- **Vs Solution app:** Lock is not a pricing engine or customer registration suite. If the main question is price lists, registration forms, net terms, tag import, or volume pricing, that is Solution.
- **Hide price in Lock** is visibility gating; **hide price in Quote context** should only be discussed when the primary goal is driving buyers into RFQ.

## 9) Typical questions this context should route correctly

- "Write a spec for the Lock module to hide payment methods."
- "Design the Theme Hiding Profile flow in B2B Lock."
- "UX for passcode/request-access setup in the Lock app."
- "Rule priority logic for shipping rules in Lock."
- "Acceptance criteria for hide price by company location."
