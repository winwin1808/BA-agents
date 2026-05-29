# BSS B2B Lock, Login & Password

Customer-facing changelog for the public update page.
This version history keeps merchant-visible changes and removes internal ticket IDs, merge requests, research items, and demo links.

## v1.19.0 — May 21, 2026

### Improved

- Refreshed the Analytics page layout for a cleaner and more modern Lock analytics experience.
- Improved usability and navigation across Passcode Management and Analytics pages.

### Fixed

- Optimized Analytics API performance for a faster reporting experience.
- Added protection to help prevent passcode request spam.

## v1.18.0 — May 8, 2026

### New

- Added a URL Parameter lock condition so merchants can control access based on UTM parameters, affiliate links, or promotional campaigns.

### Improved

- Added passcode modal branding options, including a brand image and customizable call-to-action text.
- Added preview support for hidden shipping methods so merchants can verify shipping rules before publishing.

## v1.17.0 — Apr 23, 2026

### New

- Added passcode entry on collection pages so buyers can unlock locked product cards directly from the collection view.
- Added passcode modal support for product cards, including customizable message text and colors.

### Improved

- Added more conditions for hiding payment methods and controlling checkout access, including subtotal amount, customer email, customer phone, customer login status, and always-on rules.
- Added live preview for Hide Payment Methods and Hide Accelerated Checkout Buttons rules in the app admin.
- Added product and cart quantity conditions for payment and checkout rules.

## v1.16.0 — Apr 8, 2026

### New

- Added theme-based install settings so merchants can install app code on a selected theme target, including draft themes.

### Improved

- Added custom replacement messages when hiding a section, block, or snippet.
- Added a custom redirect URL option for Hide Price rules.

## v1.15.0 — Mar 25, 2026

### New

- Added Hide Shipping Method rules so merchants can hide one or more checkout shipping methods based on customer, login, or product conditions.
- Added Hide Section, Block, and Snippet rules so merchants can hide theme sections, blocks, snippets, or custom CSS selectors.

## v1.14.0 — Mar 11, 2026

### New

- Hide products or collections from the storefront navigation based on your lock rules.
- Hide accelerated checkout buttons on product pages, cart pages, and cart drawers for selected customers or products.

### Improved

- Better support for hiding locked products and collections in featured sections.
- More flexible date and time conditions for Checkout Lock countdown displays.

### Fixed

- Fixed issues when deleting all rules.
- Fixed an editor issue that could automatically change lock messages.
- Removed outdated legacy-account support banners in supported themes.
- Removed an outdated "Claim cash back" button in the Maximize theme card.

## v1.13.0 — Feb 13, 2026

### New

- Hide payment methods based on products in the cart, customer conditions, or cart total amount.
- Customize the subject line and content of Request Access emails.

### Improved

- Added dashboard announcement banners for important product updates.

## v1.12.0 — Feb 2, 2026

### New

- Added storefront translations for the passcode request modal.

### Improved

- Redesigned the Age Verification setup for a clearer and more flexible configuration experience.
- Redesigned the Email Registration setup with faster configuration and ready-made templates.
- Improved the automatic setup for hiding prices on Google Search results.
- Improved compatibility with Shopify Functions on API version 2025-04.

### Fixed

- Fixed a pt-PT translation issue.
- Fixed a navigation issue in the app admin.

## v1.11.0 — Jan 19, 2026

### New

- Introduced a redesigned dashboard with a cleaner setup experience.
- Added in-app translation support for 20 languages.

### Improved

- Improved platform compliance and overall stability for Shopify standards.

## v1.10.0 — Nov 26, 2025

### Improved

- Redesigned the Checkout Lock module and made it available on all paid plans.
- Added an after-date-and-time condition for showing countdown lock messages.

## v1.9.0 — Oct 15, 2025

### New

- Added Shopify Plus lock conditions for company name and company location.
- Added a new lock target to hide the Add to cart button.

## v1.8.0 — Sep 19, 2025

### New

- Store owners can now receive email notifications when shoppers request a passcode.
- Redirect customers after they log in with a customer account.
- Edit lock price messages with HTML for more flexible formatting.
- Added an upcoming features page where merchants can subscribe to product updates.

### Improved

- Reduced app installation time.

## v1.7.0 — Aug 8, 2025

### New

- Added preset designs for Price Lock and Passcode forms.
- Added card designs for hidden products and collections.

## v1.6.0 — Jul 7, 2025

### Improved

- Upgraded analytics with session-based tracking for better insights.
- Added compatibility with Shopify's new customer accounts.
- Refreshed the lock configuration interface for easier setup.

## v1.5.0 — Jul 6, 2025

### Improved

- Enabled content design customization for individual rules.
- Expanded compatibility with more Shopify themes.

## v1.4.0 — May 22, 2025

### New

- Added email-domain conditions for lock rules.

## v1.3.0 — Apr 8, 2025

### New

- Added checkout validation rules.

### Improved

- Improved storefront translations.

## v1.2.0 — Mar 12, 2025

### Improved

- Added preset lock configurations for faster setup.
- Let merchants exclude specific products, collections, or pages from a lock rule.
- Added passcode import support.

## v1.1.0 — Feb 24, 2025

### New

- Hide products or prices from Google Search results.
- Added Custom Liquid support, IP-based access control, and locale-based filtering.

### Improved

- Improved compatibility with more Shopify themes.
- Added email notifications for passcode requests.

## v1.0.0 — Jan 21, 2025

### First release

- Hide products, variants, collections, pages, and prices.
- Require login, a secret link, a passcode, or email signup before visitors can view content or pricing.
- Hide products or prices from Google Search results.
- Track analytics, passcode requests, and passcode history.
