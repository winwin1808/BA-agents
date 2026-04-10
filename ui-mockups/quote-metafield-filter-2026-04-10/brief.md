# Quote Rule Metafield Filter UI Brief

## Context

This reference UI is for the **BSS B2B Request a Quote, Quick** admin flow where a merchant adds a new filter inside a Quote Rule.

The filter goal is to let merchants target quote rules by supported Shopify metafields while keeping setup predictable and low-risk.

## Scope

- Surface: Embedded Shopify admin screen
- Flow: Add one filter block inside the Quote Rule editor
- Supported filter sources:
  - Product metafield
  - Variant metafield
- Supported metafield data types:
  - Number (`integer`, `decimal`)
  - Boolean
  - Single select (`enum-like`)

## Design Decisions

1. Only show eligible metafields in the dropdown.
2. Adapt the value input UI after a metafield is selected.
3. Keep the operator model simple because each supported type only maps to one practical condition:
   - Number: `equals`
   - Boolean: `true` / `false` with equals semantics
   - Single select: `equals`
4. Show a lightweight note that unsupported metafields are hidden for performance and stability.
5. Treat `missing`, `null`, or `empty` metafield values as `no match`.

## Assumption

The acceptance-criteria line `Filter theo metafield của Customer` is treated as a typo.

This UI follows the rest of the research and implementation notes, which consistently scope the feature to **product metafield** and **variant metafield**.

## Reference Preview

- Demo: [v0 preview](https://demo-kzmjkx2g3vn8x2nd7a6s.vusercontent.net?__v0_token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..6Ocy8Ur8XkTHC4I9.94ZdcrL7p2b82_SKFNNmt7y4p6LRbXijTLTLQY3coK-9-E9S8fjA0hTJJu612P6HIRx5X3rt2FsHOxos0p_oBdSM0zGs3ynyLOGtE2jeGfi1bIWZidK4l368qtaWk72Tt7UPHGtzU1dvm2UI08NNxzlWWjGXkz1QfBi0w0iA8fIgiS0lnUCVT6n2SyHwkXIJVfUrosUaZESjtl8OPrva7u5GIyyKX33hD56Qgj1-Rkkh9v6xq0GgYiE5K_BIb658rp7lyMVsT1tPAQ.TWj3E7On4bhFI0D61MWDhA)
- Editable prompt/chat: [v0 chat](https://v0.app/chat/eoQePGFEowb)

## Screen States Covered

1. Default add-filter state before choosing a metafield
2. Product metafield with Number value input
3. Variant metafield with Boolean value input
4. Product metafield with Single select value input
5. Empty state when no eligible metafields exist
6. Inline validation/error state
