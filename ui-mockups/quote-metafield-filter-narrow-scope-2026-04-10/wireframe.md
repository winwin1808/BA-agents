# Wireframe Spec - Narrow Scope

## Screen Summary

- Audience: Merchant configuring Quote Rules
- Goal: Add a metafield filter using only a tightly controlled set of supported metafield types
- Surface: One compact admin card inside the Quote Rule editor

## Information Architecture

1. Source and eligible metafield selection
2. Type-specific value selection
3. Scope note and validation

## Default State

```text
Page: Create Quote Rule

+--------------------------------------------------------------+
| Filter: Metafield                                            |
| Use supported metafields only.                               |
+--------------------------------------------------------------+
| Source                                                       |
| (•) Product metafield   ( ) Variant metafield               |
|                                                              |
| Metafield                                                    |
| [ Select eligible metafield                          v ]     |
| Only selected metafield types are available in this setup.   |
|                                                              |
| Value                                                        |
| Select a metafield to continue                               |
|                                                              |
| [Cancel]                                      [Add filter]   |
+--------------------------------------------------------------+
```

## State 1: single_choice_list_single_line_text

```text
+--------------------------------------------------------------+
| Source: Product metafield                                    |
| Metafield: Product.custom.finish_type                        |
| Type badge: Choice list text                                 |
|                                                              |
| Value                                                        |
| [x] Matte                                                    |
| [ ] Glossy                                                   |
| [x] Satin                                                    |
|                                                              |
| Matches quote items that contain any selected value.         |
+--------------------------------------------------------------+
```

## State 2: single_single_line_text

```text
+--------------------------------------------------------------+
| Source: Variant metafield                                    |
| Metafield: Variant.custom.material_label                     |
| Type badge: Single line text                                 |
|                                                              |
| Value                                                        |
| [ ] Cotton                                                   |
| [x] Linen                                                    |
| [ ] Wool                                                     |
|                                                              |
| Values are shown as selectable labels, not free text input.  |
+--------------------------------------------------------------+
```

## State 3: single_integer

```text
+--------------------------------------------------------------+
| Source: Variant metafield                                    |
| Metafield: Variant.custom.pack_size                          |
| Type badge: Integer                                          |
|                                                              |
| Value                                                        |
| [ 10 ]  [ 20 ]  [ 50 ]  [ 100 ]                              |
|                                                              |
| Integer values are picked like size options.                 |
+--------------------------------------------------------------+
```

## State 4: Empty State

```text
+--------------------------------------------------------------+
| No eligible metafields found                                 |
|                                                              |
| This version only supports three metafield types.            |
| Try another source or update the store definitions.          |
|                                                              |
| [Refresh metafields]                                         |
+--------------------------------------------------------------+
```

## State 5: Validation

```text
+--------------------------------------------------------------+
| Metafield: Product.custom.finish_type                        |
| Value                                                        |
| [ ] Matte  [ ] Glossy  [ ] Satin                             |
| Select at least one value before adding this filter.         |
+--------------------------------------------------------------+
```

## UX Notes

- Keep the scope note close to the metafield dropdown so merchants understand why many Shopify metafields are absent.
- Use checkbox list for both supported text-based types to keep behavior consistent.
- Use chip-style options for `single_integer` to make the interaction feel like size selection.
- Avoid exposing a free text field in this version.
