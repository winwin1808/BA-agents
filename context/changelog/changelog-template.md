# Customer-Facing Changelog Template

Use this template for changelog site updates when the audience is merchants.

## Writing rules

- Lead with customer value, not internal implementation details.
- Remove ticket IDs, merge request links, internal tool names, and research-only notes.
- Use plain English and action verbs.
- Keep each bullet short: what changed and why it matters.
- Group updates into `New`, `Improved`, and `Fixed`.
- If a release only has one category, keep only that category.
- If the source has duplicate version labels, keep both entries and use the date to separate them.
- If the source has no version number, use a date-based heading.
- If the source has no confirmed date, mark it as `Date to confirm` before publishing.

## Versioned release template

```md
# App name

Customer-facing changelog for the public update page.

## vX.Y.Z — Mon DD, YYYY

### New

- Added [feature] so merchants can [outcome].
- Added [feature] for [specific use case].

### Improved

- Improved [workflow] for a faster or clearer setup experience.
- Improved compatibility with [platform, theme, module, or market].

### Fixed

- Fixed [customer-facing issue].
- Fixed [customer-facing issue].
```

## Date-based release template

```md
# App name

Customer-facing changelog for the public update page.
The source material for this app does not include version numbers, so entries are organized by release date.

## Mon DD, YYYY

### New

- Added [feature] so merchants can [outcome].

### Improved

- Improved [workflow or compatibility].

### Fixed

- Fixed [customer-facing issue].
```

## Fast editing checklist

- Does each bullet describe something a merchant can see, use, or benefit from?
- Did you remove internal codes, internal links, and engineering-only tasks?
- Is the wording easy to scan in under 10 seconds?
- Did you avoid repeating the same benefit across multiple bullets?
- Did you keep naming consistent with the app's public branding?
