# Quote Rule Metafield Filter UI Brief - Narrow Scope

## Context

This reference UI is for the **BSS B2B Request a Quote, Quick** admin flow where a merchant adds a metafield-based filter inside a Quote Rule.

This version narrows the setup scope to only **three supported metafield types**.

## Supported Types In This Version

1. `single_choice_list_single_line_text`
2. `single_single_line_text`
3. `single_integer`

## UI Mapping

- `single_choice_list_single_line_text` -> `Checkbox list`
- `single_single_line_text` -> `Checkbox list`
- `single_integer` -> `Size-like option picker`

## Scope Rules

- Keep `Product metafield` and `Variant metafield` as source choices.
- Only show metafield definitions whose type belongs to the three supported types above.
- Hide all other metafield types from the picker.
- Use simple equals-style matching.
- If the metafield is missing, `null`, or empty at quote submission time, the rule does not match.

## Assumption

The user's second mapping line was interpreted as:

`single_single_line_text -> Checkbox list`

If a different field type was intended, this reference can be adjusted in the next iteration.

## MCP Output

- Demo: [v0 preview](https://demo-kzmr0emisvhtckn4165p.vusercontent.net?__v0_token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..nTIh3SCuhghQTntA.2Hk--NGOsYGBVS4KE20NKykxVE1fJoCJrhgHZCzmy7xENj3WPR80UzY8X4pnAL91KBc97jv7UnbESG0HukBZQk9gDQrwbYg3ow6iurE8FACZ9cYDCgKSl96RusdTGUBSGi7w5l9GUwKKMz5j1DN-7dYP7n7Po_Zx62_AKGE0h3yX8F3FVfABhLsJCbmqjBlmhASeKB214p7dJ8IvFy3yMFFR3Euw0zlvBsAF0PgLHO1SQ_jmGC88q_Sirej-2G80BqCP5Xg7q2AWBA.mOn4fIhVi-on6GHLhikXQg)
- Editable prompt/chat: [v0 chat](https://v0.app/chat/uXPXISAMygq)
