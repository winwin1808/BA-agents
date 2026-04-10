# Polaris Mapping

| Area | Polaris primitive | Usage note |
| --- | --- | --- |
| Page shell | `Page` | Host the Quote Rule setup screen inside the embedded admin app |
| Filter container | `Card` or `LegacyCard` | Group one metafield filter block cleanly |
| Section spacing | `BlockStack` / `InlineStack` | Keep source, metafield, and value rows readable |
| Source selector | `ChoiceList` | Two options only: `Product metafield`, `Variant metafield` |
| Metafield picker | `Select` | Default compact control because only eligible metafields are shown |
| Type indicator | `Badge` | Show `Number`, `Boolean`, or `Single select` after selection |
| Number value input | `TextField` with `type=number` | Used for integer and decimal values |
| Boolean value input | `ChoiceList` or segmented buttons | Use two explicit values: `True`, `False` |
| Single select value input | `Select` | Keeps enum-like values compact in the filter card |
| Info note | `Banner` with low-emphasis info tone or `Text` helper | Explain hidden unsupported metafields |
| Validation | `InlineError` | Show required-field or invalid-value errors inline |
| Empty state | `EmptyState` or bordered `Box` + `Text` + `Button` | Shown when the selected source has no eligible metafields |
| Footer actions | `Button` + `Button` primary | `Cancel` and `Add filter` |

## Component-Level Guidance

- Prefer `ChoiceList` for the source switch because the labels are longer and need explanation.
- Prefer `Select` over `Autocomplete` for the first version unless stores are expected to have a very large number of eligible metafields.
- Keep the operator as read-only text when the type only supports one condition, instead of exposing a dropdown with one option.
- Reserve `Banner` for global support notes and use `InlineError` for field-specific issues.
