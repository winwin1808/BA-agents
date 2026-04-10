# Handoff Notes - Narrow Scope

## Product Direction

This version intentionally limits metafield filtering to a small set of predictable field types:

- `single_choice_list_single_line_text`
- `single_single_line_text`
- `single_integer`

This keeps the first release easier to explain, easier to test, and safer for merchant setup.

## Interaction Rules

- Merchant chooses source:
  - `Product metafield`
  - `Variant metafield`
- System loads only eligible metafield definitions for that source.
- After metafield selection, the UI renders one of three value selectors:
  - Checkbox list
  - Checkbox list
  - Size-like integer picker

## Matching Logic

- Matching uses simple equals-style comparison.
- If the metafield is not present at quote submission time, the rule does not match.
- If the metafield value is empty, the rule does not match.

## Validation Rules

- At least one value must be selected before the filter can be added.
- The selected value set must come from available metafield values only.

## UX Copy Suggestions

- `Only selected metafield types are available in this version.`
- `Unsupported metafields are hidden to keep setup clear and stable.`
- `Quotes without this metafield value will not match this filter.`

## Risks To Confirm

- Whether `single_single_line_text` should truly be supported via discrete selectable values
- How integer values are sourced for the size-like selector
- Whether multi-select matching should mean `matches any selected value` or `must equal one selected value`
