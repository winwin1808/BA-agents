# Handoff Notes

## Recommended UX Direction

Use one compact filter card inside the Quote Rule editor instead of a separate wizard.

This keeps the merchant focused on three choices only:

1. Choose source
2. Choose eligible metafield
3. Enter a type-specific value

## Interaction Rules

- The `Metafield` dropdown is disabled until the merchant chooses `Product metafield` or `Variant metafield`.
- After source selection, load only metafield definitions supported by this feature.
- After metafield selection:
  - Detect the resolved data type
  - Render the matching value input
  - Show the condition as fixed `Equals` when applicable
- `Add filter` remains disabled until the value is valid.

## Support Logic

- Supported types:
  - Number: `integer`, `decimal`
  - Boolean
  - Single select / enum-like
- Unsupported types are not shown in the picker.
- If no supported metafields exist for the selected source, show the empty state.

## Rule Evaluation Notes

- Evaluate against the metafield value available when the customer submits the quote.
- If the metafield does not exist, the rule does not match.
- If the metafield value is `null` or empty, the rule does not match.

## Validation Rules

- Number:
  - Value is required
  - Only valid numeric input is accepted
- Boolean:
  - One value must be selected
- Single select:
  - Merchant must choose one option from the definition values

## Suggested Helper Copy

- Under metafield picker:
  - `Only supported metafields are shown to keep filtering stable and fast.`
- Under value area:
  - `Quotes without this metafield value will not match this filter.`

## Edge Cases

- Store has many metafields but very few eligible ones
- Merchant changes source after selecting a metafield
- A previously eligible metafield becomes invalid because its definition changes in Shopify
- Definition exists but stored product or variant values are blank

## Analytics Suggestions

- `quote_rule_metafield_source_selected`
- `quote_rule_metafield_selected`
- `quote_rule_metafield_filter_added`
- `quote_rule_metafield_empty_state_viewed`
- `quote_rule_metafield_validation_failed`

## Open Question

Please confirm whether the acceptance-criteria line `Filter theo metafield của Customer` is a typo.

If that line is intentional, the source model and eligible-definition logic need to be redesigned before implementation.
