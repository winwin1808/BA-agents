# BSS B2B Solution App Context

**Purpose:** Dedicated context for `BSS B2B Wholesale Solution` so PM skills stay anchored in the merchant wholesale operating system: registration, customer segmentation, pricing rules, order constraints, net terms, and integration/admin usability.

---

## 1) App identity

- **Official name:** BSS B2B Wholesale Solution
- **Common aliases:** B2B Solution, Solution app, Wholesale Solution
- **Core promise:** Provide an all-in-one wholesale module set for Shopify merchants to manage customer access, pricing, registration, order constraints, payment terms, and admin workflows in one coherent system.
- **Official documentation (GitBook):** <https://docs-shpf.bsscommerce.com/b2b-wholesale-solution>

## 2) Core ICP

### Best-fit merchants

- Shopify merchants expanding from D2C into B2B, or running wholesale across multiple segments.
- Merchants who need price lists / custom pricing / volume pricing / quantity rules with clear governance.
- Merchants who need registration forms, customer tagging, net terms, shipping rules, manual orders, and production-grade import/export.

### Representative use cases

1. Onboard B2B accounts via registration form + approval + tagging.
2. Configure price lists, custom pricing, volume pricing, quantity increments/order limits.
3. Operate net terms, tax-exempt rules, extra fees, shipping rates, and manual orders.
4. Import/export customer/pricing data with clear auditing and background processing.

## 4) App module scope

### In-scope

- Registration Form and approval-related configuration
- Customer tags/segments and customer import
- Price List, Custom Pricing, Volume Pricing
- Quantity Increments, Order Limits, Shipping Rates
- Tax Exempt, Tax Display, Extra Fee, discount interactions
- Net Terms, Manual Orders, Public API, import/export
- Dashboard/onboarding/admin configuration experience

### Not the primary scope

- Dedicated RFQ workflows and buyer-facing quote history
- Passcode, secret links, request access, theme hiding profiles
- Narrow lock-only checkout guardrails when not tied to the wholesale policy engine

## 5) Canonical terms

- **Registration Form:** Onboarding form for B2B accounts that collects data for merchant approval.
- **Customer segment/tag:** Signals used to apply pricing, catalog, payment, or policy rules.
- **Price List:** A dedicated price table for products/variants/customer groups.
- **Custom Pricing:** Pricing overrides for a specific scope.
- **Volume Pricing:** Quantity-based discount / quantity break logic.
- **Quantity Increment / Order Limit:** Quantity guardrails (multiples, min/max thresholds).
- **Net Terms:** Post-paid payment terms after an order/draft order.
- **Manual Order:** A flow to create B2B orders while respecting pricing/terms exclusions.

## 6) Key workflows to prioritize

### Workflow A: Registration -> segmentation -> pricing

1. Merchant publishes a registration form for B2B buyers.
2. Customer is approved and/or assigned the right tags/segments.
3. System applies price lists, custom pricing, and related policies.
4. Merchant tracks setup status and the activation funnel.

### Workflow B: Pricing rule setup/import

1. Merchant creates or imports Price List / Custom Pricing / Volume Pricing.
2. System validates files, runs background processing, and outputs clear error files.
3. Merchant reviews exclude settings, product/variant scope, and rule results.

### Workflow C: Customer import and tag governance

1. Merchant uploads a customer CSV.
2. Merchant selects a tagging strategy and previews final tags.
3. System syncs tags consistently between the app and Shopify.
4. Import logs capture strategy, errors, warnings, and operator.

### Workflow D: Payment and order operations

1. Merchant configures Net Terms, Shipping Rates, Order Limits, or Manual Order behavior.
2. Rule engine applies logic by segment, exclude settings, and order context.
3. Ops/Finance teams track risk and exception handling.

## 7) Suggested KPIs for specs/reviews

- Activation rate to the first completed wholesale setup flow
- Time to first B2B order
- Pricing rule publish/import success rate
- Ticket rate related to pricing mismatches or import errors
- Net terms adoption / policy error rate
- Cross-module attach rate within the app

## 8) Common confusion with other apps

- **Vs Lock app:** If the primary problem is visibility gating, passcodes, login locks, or hiding payment/shipping from an access-control lens, that is Lock.
- **Vs Quote app:** If the primary question is RFQ forms, quote pages, quote history, or buyer-facing quick order, that is Quote.
- Solution is the `wholesale operating system`; do not drag it into narrow quote UX or lock-only storefront gating.

## 9) Typical questions this context should route correctly

- "Write a spec for the new Price List rule editor in Solution."
- "Design the customer-tag import flow in B2B Solution."
- "UX for Registration Form onboarding setup."
- "Acceptance criteria for Net Terms with manual orders."
- "Exclude customer/product logic in Volume Pricing."
