# Wireframe Spec

## Screen Summary

- Audience: Merchant configuring Quote Rules
- Goal: Add a metafield-based filter without exposing unsupported or confusing data types
- Surface: One compact admin setup card inside the Quote Rule editor

## Information Architecture

1. Filter source and metafield selection
2. Type-aware condition/value area
3. Support note, validation, and match summary

## Default Layout

```text
Page: Create Quote Rule

+--------------------------------------------------------------+
| Filter: Metafield                                            |
| Add conditions that match supported Shopify metafields only. |
+--------------------------------------------------------------+
| Source                                                       |
| (•) Product metafield   ( ) Variant metafield               |
|                                                              |
| Metafield                                                    |
| [ Select eligible metafield                          v ]     |
| Only supported metafields are shown.                         |
|                                                              |
| Condition                                                    |
| Waiting for metafield selection                              |
|                                                              |
| [Cancel]                                      [Add filter]   |
+--------------------------------------------------------------+
```

## State 1: Product Metafield + Number

```text
+--------------------------------------------------------------+
| Source: Product metafield                                    |
| Metafield: Product.spec.min_order_qty                        |
| Type badge: Number                                           |
|                                                              |
| Condition                                                    |
| Equals                                                       |
|                                                              |
| Value                                                        |
| [ 100                                                ]      |
| Matches when the quote item has this metafield value.        |
|                                                              |
| Note: Missing or empty metafield values do not match.        |
+--------------------------------------------------------------+
```

## State 2: Variant Metafield + Boolean

```text
+--------------------------------------------------------------+
| Source: Variant metafield                                    |
| Metafield: Variant.custom.is_preorder                        |
| Type badge: Boolean                                          |
|                                                              |
| Value                                                        |
| (•) True      ( ) False                                      |
|                                                              |
| Note: Variants without this metafield do not match.          |
+--------------------------------------------------------------+
```

## State 3: Product Metafield + Single Select

```text
+--------------------------------------------------------------+
| Source: Product metafield                                    |
| Metafield: Product.custom.material_grade                     |
| Type badge: Single select                                    |
|                                                              |
| Condition                                                    |
| Equals                                                       |
|                                                              |
| Value                                                        |
| [ Gold Tier                                          v ]     |
| Options come from the metafield definition values.           |
+--------------------------------------------------------------+
```

## State 4: Empty State

```text
+--------------------------------------------------------------+
| No eligible metafields found                                 |
|                                                              |
| We only show Number, Boolean, and Single select metafields   |
| that can be used safely in Quote Rule filtering.             |
|                                                              |
| [Refresh metafields]                                         |
+--------------------------------------------------------------+
```

## State 5: Validation/Error

```text
+--------------------------------------------------------------+
| Metafield: Product.spec.min_order_qty                        |
| Value                                                        |
| [                                                    ]       |
| Enter a value before adding this filter.                     |
+--------------------------------------------------------------+
```

## UX Notes

- Hide unsupported metafields instead of showing them disabled in the main dropdown.
- Keep one small info note under the metafield picker so merchants understand why the list is shorter than Shopify's full metafield inventory.
- Do not ask the merchant to choose an operator when only one operator is valid.
- Show the selected data type as a small badge to explain why the value control changed.
- Use a short rule summary after selection, for example:
  - `Product metafield Product.spec.min_order_qty equals 100`
