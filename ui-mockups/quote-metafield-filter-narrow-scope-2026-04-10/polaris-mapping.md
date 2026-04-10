# Polaris Mapping - Narrow Scope

| Area | Polaris primitive | Usage note |
| --- | --- | --- |
| Page shell | `Page` | Host the Quote Rule editor section |
| Filter card | `Card` or `LegacyCard` | Wrap one metafield filter block |
| Source switch | `ChoiceList` | `Product metafield` or `Variant metafield` |
| Metafield picker | `Select` | Show only eligible metafields |
| Type badge | `Badge` | Clarify the resolved metafield type |
| Choice list values | `ChoiceList` | Use for `single_choice_list_single_line_text` and `single_single_line_text` |
| Integer values | `InlineStack` + selectable `Button` or `ChoiceList` | Render compact size-like options |
| Scope note | `Banner` or helper `Text` | Explain limited support and hidden types |
| Validation | `InlineError` | Require at least one selected value |
| Empty state | `EmptyState` or bordered `Box` | When no eligible metafields are found |
| Actions | `Button` | `Cancel` and `Add filter` |

## Implementation Notes

- Keep one consistent selection pattern for both text-based supported types.
- Treat integer values as preloaded discrete options, not arbitrary typed input.
- Do not surface an operator dropdown unless product later expands the logic model.
