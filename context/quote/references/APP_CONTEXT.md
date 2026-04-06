# BSS B2B Quote App Context

**Purpose:** Dedicated context for `BSS B2B Request a Quote, Quick` so PM skills stay anchored in RFQ, quote operations, quick order, and buyer ordering flows.

---

## 1) App identity

- **Official name:** BSS B2B Request a Quote, Quick
- **Common aliases:** B2B Quote, Quote app, Quote/Quick app
- **Core promise:** Help merchants capture RFQs, manage quotes, and accelerate repeat ordering via quick order within a single app.
- **Official documentation (GitBook):** <https://docs-shpf.bsscommerce.com/bss-b2b-quick-order-and-quotes>

## 2) Core ICP

### Best-fit merchants

- Shopify merchants who need price negotiation or RFQ-based ordering before checkout.
- Wholesale merchants with high repeat-order frequency who need fast bulk ordering.
- Merchants who want one coherent flow for `quote capture + quick order + quote history` instead of stitching multiple small apps.

### Representative use cases

1. Request a Quote from PDP, PLP, cart, or collection.
2. Quick Order pages for bulk add-to-cart or CSV imports.
3. Quote history / quote details inside customer accounts.
4. Quote-to-order or draft-order handoff after a quote is accepted.

## 4) App module scope

### In-scope

- RFQ button/form, modal vs dedicated-page display mode
- Quote request capture and validation
- Quote operations, proposals/sharing, quote PDF
- Quick Order pages, CSV bulk order/import
- Quick Order -> RFQ handoff
- Quote history in storefront or customer accounts
- File upload, product metafield context, shipping address in quote forms

### Not the primary scope

- Login/passcode/secret-link lock engine
- Broad wholesale pricing engines (price lists, volume pricing, net terms)
- Registration form platform and customer tag import

## 5) Canonical terms

- **RFQ:** Request for Quote.
- **Quote Request display mode:** How the RFQ form is presented (modal vs dedicated page).
- **Quick Order:** A surface for bulk ordering via search/SKU/CSV.
- **Quote context:** Item list, variants, quantities, entry point, and buyer/account context attached to an RFQ.
- **Quote history:** Buyer-facing list/detail of submitted quotes, statuses, and next actions.
- **Quote-to-order:** Converting an accepted quote into an order or draft order.

## 6) Key workflows to prioritize

### Workflow A: RFQ capture

1. Buyer sees the `Request a Quote` CTA on PDP/PLP/cart/collection.
2. The system opens a modal or dedicated page based on merchant settings.
3. The quote form uses shared validation, submission logic, and success/error states.
4. Sales/merchant receives the request with sufficient product/cart context.

### Workflow B: Quick Order -> order or quote

1. Buyer uses search, SKU, or CSV to select multiple items.
2. The system checks compatibility with relevant quantity rules.
3. Buyer either submits an order quickly or converts the list into an RFQ for negotiation.

### Workflow C: Quote history and follow-up

1. Buyer accesses quote history from storefront or customer account.
2. Buyer views quote/proposal details.
3. Buyer follows up, reorders, or converts to an order depending on the available flow.

## 7) Suggested KPIs for specs/reviews

- Quote request completion rate
- Quote-to-order conversion rate
- Quick Order adoption / repeat order rate
- Mobile quote abandonment rate
- Time from quote open to submit
- Invalid quote request rate / first-round revision rate

## 8) Common confusion with other apps

- **Vs Lock app:** If the primary goal is hide price/login gating/access control, that is Lock. Quote only touches hide price when the main goal is driving buyers into RFQ.
- **Vs Solution app:** If the primary goal is price lists, registration forms, custom pricing, net terms, or importing customer tags, that is Solution.
- Quote optimizes `quote + quick order`; it should not drift into full wholesale policy engines.

## 9) Typical questions this context should route correctly

- "Write a spec for a dedicated Quote Request page."
- "Design the Quick Order -> RFQ flow."
- "UX for quote history in customer accounts."
- "Acceptance criteria for Quick Order CSV import."
- "Logic for the quote CTA with multi-variant products."
