# BSS B2B Wholesale Solution

Customer-facing changelog for the public update page.
This version history keeps merchant-visible changes and removes internal ticket IDs and implementation notes.
The source material includes a few duplicate version labels and overlapping dates. To avoid inventing new version numbers, those entries are preserved with their original labels and dates.

## v9.52.0 — Mar 16, 2026

### New

- Refreshed the Order Limit and Quantity Increments settings pages for a clearer setup experience.
- Added a more visual editor with live preview for Order Limit and Quantity Increments.
- Updated the homepage to show Theme App Extension and App Block status, including how many app blocks are active in the store.

### Improved

- Refreshed the in-app What's Coming Up section on the dashboard.

## v9.51.0 — Mar 2, 2026

### New

- Rebuilt Shipping Rate settings with step-by-step setup and clearer wording.
- Manual Orders now respect Volume Pricing exclude-customer and exclude-product settings.
- Added a custom net term option for Manual Orders, so merchants can enter a custom due date.

### Improved

- Volume Pricing import and export now runs in the background, notifies merchants when finished, and provides clearer error files.
- Simplified the Volume Pricing import template and moved import and export actions into the module configuration.
- Refreshed the in-app What's Coming Up section on the dashboard.

## v9.50.0 — Feb 9, 2026

### New

- Rebuilt the Price List rule editor with step-by-step setup and clearer wording.
- Public API secret keys are now shown only once when created for better security.
- Manual Orders now respect Custom Pricing and Price List exclude settings.
- Added in-app languages: Swedish, Czech, Hungarian, Turkish, Romanian, and Thai.

### Improved

- Price List import and export now runs in the background, notifies merchants when finished, and provides clearer error files.
- Simplified the Price List import template and moved import and export actions into the module configuration.

## Jan 28, 2026 — Onboarding update

### Improved

- Refined the onboarding flow to make first-time setup clearer for new merchants.
- Updated the onboarding experience to match the latest design improvements.

## v9.49.0 — Jan 26, 2026

### New

- Quantity Increments now works on collection pages and quick-view pages when the rule applies by variant.
- Added Exclude Variants to Volume Pricing.
- Rebuilt the Custom Pricing rule editor with guided steps and clearer wording.
- Added in-app languages: Danish, Finnish, Korean, Dutch, Polish, and Portuguese.

## v9.48.0 — Jan 12, 2026

### New

- Added a fixed-fee-per-item option in Extra Fee.
- Redesigned Extra Fee rules for a clearer setup experience.
- Added after-submit settings for Registration Forms.
- Custom Pricing now applies to unit-price displays.

## v9.47.0 — Dec 29, 2025

### New

- Quantity/Amount Break has been renamed Volume Pricing.
- Added a new onboarding flow for faster setup.
- Net Terms is now compatible with Price Override in Advanced Settings.
- Added end-of-month options to Net Terms.
- Added start and end dates to Shipping Rate rules.

## v9.46.0 — Dec 17, 2025

### New

- Added multilingual support for Order Limit, Quantity Increments, Tax Display, Tax Exempt, Extra Fee, Discount Code, and Net Term.
- Added support for Shopify API version 2025-04.

### Improved

- Refreshed the dashboard interface.

## v9.45.0 — Dec 1, 2025

### New

- Introduced a new dashboard with a clearer overview of modules, setup status, and shortcuts.
- Added multilingual support for Volume Pricing.

### Improved

- Simplified the Registration Form publish tab.
- Improved Volume Pricing stability and error tracking.
- Improved Registration Form file uploads with better progress feedback, MP4 support, and image support up to 25 MP.

## v9.44.0 — Oct 2, 2025

### New

- Added a PO number field to Net Term forms and synced it to Shopify Draft Orders.
- Expanded EU VAT validation to support Switzerland and Norway.

## v9.43.1 — Aug 28, 2025

### Improved

- Refreshed the homepage interface.

## v9.43.0 — Jul 10, 2025

### New

- Net Term is now compatible with other modules.

## v9.42.0 — Jun 26, 2025

### Improved

- Improved the Public API interface and moved App Integration into Advanced Settings.

## v9.41.0 — Jun 12, 2025

### New

- Price List can now increase original product prices, not only discount them.

## v9.40.0 — Jun 5, 2025

### Improved

- Simplified Email Sender configuration with a clearer setup flow.

## v9.39.0 — May 22, 2025

### New

- Added a new multi-step Registration Form template with support for Shopify Customer Account Login.
- Merchants can now show the form in the menu and wholesaler information on the profile page.

### Improved

- Expanded EU VAT validation to support Norway and Switzerland.

## v9.38.0 — May 15, 2025

### Improved

- Improved Custom Pricing import with larger file support and background processing.
- Added Switzerland and Norway validation for Tax Exempt.

## v9.37.0 — Apr 24, 2025

### New

- Added Net Terms for deferred B2B payment setup.
- Added theme integrations for Trade, ZEST, Minimog OS 2.0, Megamog, and Concept.

## v9.36.0 — Apr 8, 2025

### Improved

- Added a Development Plan experience for development stores.
- Added theme integration for Baseline.

## v9.35.0 — Mar 13, 2025

### New

- Show only the discounted price as MSRP at checkout.

### Improved

- Improved import performance for Registration Form v2.

## v9.34.0 — Mar 6, 2025

### Improved

- Added Shopify POS integration.
- Added theme integrations for Enterprise and Empire.

## v9.33.0 — Feb 27, 2025

### Improved

- Added theme integrations for Habitat, Stiletto, Sleek, and Focal.

## v9.32.0 — Feb 13, 2025

### Improved

- Added search and sorting for easier rule management across all modules.
- Added theme integration for Impact.
- Synced all product tags from Shopify Admin for rule setup.

## v9.31.0 — Feb 6, 2025

### Improved

- Added Japanese in-app translation.
- Added theme integrations for Eurus, Vegist, and Warehouse.
- Introduced a new homepage interface.

## v9.30.0 — Jan 16, 2025

### Improved

- Added Spanish in-app translation.

## v9.29.0 — Jan 9, 2025

### New

- Added Registration Form translations for cross-border wholesalers.

## v9.28.0 — Dec 26, 2024

### New

- Added theme integration for Prestige.
- Added in-app languages: German, French, Italian, and English.

## v9.27.0 — Nov 19, 2024

### New

- Added customizable field layout for Registration Forms.

## v9.26.0 — Nov 28, 2024

### New

- Merchants can now apply a Shopify discount to B2B draft orders at checkout.

### Improved

- Shipping Rates can now be calculated from the subtotal, total items, or total weight of eligible products.
- Quantity/Amount Break rules can now import excluded variants.

## v9.26.0 — Nov 5, 2024

### Improved

- B2B draft orders are now compatible with Shopify Discount codes.

## v9.25.0 — Nov 28, 2024

### Improved

- Manual Orders now charge tax by default, except for tax-exempt customers.

## v9.24.0 — Nov 14, 2024

### Improved

- Manual Orders now respect Shopify tax override settings.
- Price List imports now display all errors in a single list.

## v9.23.0 — Nov 7, 2024

### Improved

- Price List can now import excluded variants into rules.

## v9.22.0 — Oct 31, 2024

### New

- Auto Tag rules can now use Country as a condition.

## v9.21.0 — Oct 23, 2024

### Improved

- Customize email notifications for Registration Forms.
- Auto Tags now support the condition "Product SKU starts with".
- Public API can now exclude products for Quantity/Amount Break.

## v9.21.0 — Oct 16, 2024

### Improved

- Added more default fields when creating a Registration Form.
- Quantity/Amount Break can now target a specific market.
- Hide the rule name, table header, or column titles in the Quantity/Amount Break table.
- Update existing Price List rules through the Public API.

## v9.20.0 — Oct 10, 2024

### New

- Registration Form custom field data can now be stored in Shopify customer metafields.

### Improved

- Manual Orders can now use Shopify shipping rates.
- Change the Registration Form submit button text and color in Settings.
- Price List now validates the start and end date field format.

## v9.19.0 — Sep 25, 2024

### New

- Custom Pricing, Quantity/Amount Break, Price List, and Tax Display can now auto-install theme code.

## v9.18.0 — Sep 19, 2024

### Improved

- Copy the Registration Form ID and jump straight to App Embed settings from the setup page.
- Search by title, SKU, or barcode when adding products or variants to Price List rules.

### Fixed

- Fixed default address selection in Manual Orders.
- Fixed a compatibility issue between BOGO and Custom Pricing or Price List.

## v9.17.0 — Sep 12, 2024

### Improved

- Search variant IDs when importing Custom Pricing, Price List, and Quantity/Amount Break rules.
- Apply Order Limit to logged-in customers.
- Grant Tax Exempt status to specific customers.
- Change the discount title in Advanced Settings.

## v9.16.0 — Sep 5, 2024

### New

- Price List discounts can now target a specific market.
- Quantity/Amount Break rules can now use start and end times.

## v9.15.0 — Aug 29, 2024

### New

- Public API now supports specific variants for Quantity/Amount Break.

### Improved

- Choose whether Shipping Rates use the highest or lowest matching rate.
- Select another saved customer address when creating a Manual Order.
- Add password requirements to Registration Forms for stronger account security.
- Show clearer checkout error messages to customers on the storefront.

## v9.14.0 — Aug 22, 2024

### New

- Introduced Registration Form v2.

### Improved

- Simplified installation and testing with Theme Dawn by BSS.
- Improved app performance, including LCP and CLS.

## v9.13.0 — Aug 15, 2024

### New

- Quantity/Amount Break can now import and export discounts for product variants.

### Fixed

- Fixed Order Limit currency display on product pages.
- Fixed market-currency support in the Extra Fee cart table.
- Fixed an Extra Fee eligibility issue on cart quantity or amount ranges.

## v9.12.0 — Aug 8, 2024

### Improved

- Improved the responsive experience when building conditional logic in Registration Forms.
- Added a contextual save bar for Registration and Multi-currency settings.

## v9.11.0 — Aug 1, 2024

### New

- Custom Pricing can now import and export excluded products.
- Public API can now exclude products for Custom Pricing.

### Improved

- After saving a rule, merchants can edit it immediately instead of returning to the rule list.
- Tax Exempt and Tax Display now have separate translation settings.
- Refreshed the pricing plan page UI.

## v9.10.0 — Jul 25, 2024

### New

- Edit Price List prices faster by searching selected products with title, SKU, or barcode.

### Improved

- Export registered customer data with submission time.
- Added support for Shopify API version 2024-04.

### Fixed

- Fixed customer status updates when accounts are deleted in Shopify Admin.
- Fixed auto-approval behavior for imported customers.
- Fixed several Registration Form admin issues.

## v9.9.0 — Jul 12, 2024

### Improved

- Refreshed the Manual Order create and edit layout.
- Improved page load speed in Manual Orders.

## v9.8.0 — Jul 2, 2024

### New

- Quantity/Amount Break discounts now work at the variant level.

## v9.7.0 — Jun 24, 2024

### Improved

- Custom Pricing can now exclude products.
- Price List can now exclude variants.

## v9.6.0 — Jun 13, 2024

### Improved

- Registration Form uploads now show the file name.

### Fixed

- Fixed Discount Codes in additional Shopify markets.
- Fixed Tax Display location detection for correct prices.

## v9.5.0 — Jun 7, 2024

### Improved

- Added an Updated date column to rule lists across all modules.
- Increased the number of products you can save in one Price List API rule.

## v9.5.0 — May 29, 2024

### Improved

- Manual Orders can now set quantity while selecting products.

### Fixed

- Fixed Tax Display amounts when used with Custom Pricing.
- Fixed a Registration Form email template issue that allowed empty subject lines.

## v9.4.0 — May 16, 2024

### Improved

- Introduced a new user interface.

### Fixed

- Fixed checkout bypass issues in Order Limit.
- Fixed free shipping and extra fee calculation issues.
- Fixed a Multiple Currency compatibility issue with Custom Pricing.

## v9.4.0 — Apr 24, 2024

### Improved

- Registration Forms can now verify customer phone numbers during account creation.

## v9.3.0 — Apr 3, 2024

### New

- The app is now embedded inside Shopify Admin.

## v9.2.0 — Mar 14, 2024

### Improved

- Collection search results are now paginated, so merchants can search more than 30 collections.
- Discount Code details are now displayed on the cart page.

## v9.1.0 — Feb 29, 2024

### New

- Price List can now import and export variant pricing.
- Public API now supports specific variants for Price List.
- Discount Code rules can now exclude customers.

## v9.0.0 — Feb 15, 2024

### New

- Added App Blocks support.

## v8.8.0 — Jan 18, 2024

### New

- Registration Forms now support tax ID validation for India GST, UK VAT ID, and US EIN.
- Public API now keeps a history of API requests.

## v8.7.0 — Jan 4, 2024

### Improved

- Shipping Rates are now compatible with Shopify Markets.

### Fixed

- Fixed a Registration Form issue that allowed sign-ups without required fields.

## v8.6.0 — Dec 21, 2023

### New

- Custom Pricing can now import and export variant pricing.

### Fixed

- Fixed a Quantity Increments issue where quantities could move incorrectly.

## v8.5.0 — Dec 5, 2023

### New

- Price List now works at the variant level.
- Registration Form now integrates with Klaviyo.
- Discount Code now supports minimum requirements.
- Shipping Rates can now be calculated by product weight.

### Improved

- Added a Created date column to help merchants find and edit rules faster.

### Fixed

- Fixed preview counts in Price List.
- Fixed Shipping Rate calculation issues.
- Fixed an Extra Fee checkout issue.

## v8.4.0 — Nov 2, 2023

### New

- Added plan-based billing discounts.

## v8.3.0 — Sep 15, 2023

### New

- Custom Pricing is now available at the variant level.

## v8.2.0 — Jul 18, 2023

### New

- Quantity Increments now support specific variants.

## v8.1.0 — May 25, 2023

### New

- Added a yearly pricing plan.

## v8.0.0 — May 8, 2023

### New

- Added editable design templates for Quantity Break tables.

## v7.9.0 — Apr 30, 2023

### Improved

- Refreshed Registration Form general settings.
- Added usage limits to Shipping Rate rules.
- Improved the Remove Tags option in Auto Tag.

## v7.8.0 — Apr 15, 2023

### New

- Quantity Break tables can now appear in Featured Products.
- Shipping Rate rules can now exclude products.
- Several pricing and order control modules can now exclude specific customers.

## v7.7.0 — Mar 28, 2023

### New

- Added integrations with LangShop and Order Printer Pro.

### Improved

- Made Custom Pricing, Quantity Break, Discount Code, and Order Limit compatible with Shopify Markets.
- Improved UX and UI across the app.

## v7.6.0 — Feb 3, 2023

### New

- Added a mass action to reject pending customers in Registration Forms.

## v7.5.0 — Dec 22, 2022

### New

- Manual Orders can now edit draft orders.

## v7.4.0 — Aug 15, 2022

### New

- Quantity Break and Amount Break tables can now be shown on collection pages.

## v7.3.0 — May 26, 2022

### New

- Custom Pricing import and export now supports excluded customers and start and end dates.

## v7.2.0 — Apr 12, 2022

### New

- Custom Pricing can now show the compare-at price or original price next to the discounted price.

## v7.1.0 — Apr 1, 2022

### New

- Added the Extra Fees module.
- Added tax override configuration for tax-inclusive and tax-exclusive display.

## v7.0.0 — Mar 18, 2022

### New

- Added the Buy One Get One module.
- Added Public APIs for customer-specific pricing.
- Improved compatibility between tax display, Quantity Break and Amount Break, and Quick Order.
- Changed the Registration Form country field to autocomplete.

## v6.9.0 — Jan 19, 2022

### New

- Added the Shipping Rate and Quantity Increments modules.
- Renamed Advanced Minimum Order to Order Limit.
- Expanded tax ID validation with India GST, ABN, and GB validation.

## v6.8.0 — Dec 6, 2021

### New

- Added URL editing for Registration Form pages in Advanced Settings.
- Added usage limits for Discount Codes.

## v6.7.0 — Nov 30, 2021

### New

- Registration Forms can now show a list of verified email addresses.
- Custom Pricing advanced settings now support excluded customers and start and end dates.

## v6.6.0 — Nov 4, 2021

### New

- Import customers and sync them with Shopify.

## v6.5.0 — Oct 28, 2021

### New

- Registration Form custom fields now work with Apply to Previous Customers and Orders.
- Changed the delete action on Shopify Default Form to a disabled action.
- Added ABN and VAT lookup with saved search records.

## v6.4.0 — Oct 25, 2021

### New

- Added default address fields to pending, approved, and new registration emails.
- Manual Orders can now display up to 100 variants and 250 collections when selecting products.

## v6.3.0 — Oct 18, 2021

### New

- Tax Exempt now works when all prices include tax.
- Manual Orders can now display up to 10 products and 65 variants when selecting products.

## v6.2.0 — Oct 11, 2021

### New

- Added more Registration Form input types, including address fields saved to Shopify Default Address.

## v6.1.0 — Oct 8, 2021

### New

- Added multiple Quantity Break and Amount Break tables on product pages.
- Added Price Applied settings and a dedicated section for Quantity Break and Amount Break tables.

## v6.0.0 — Sep 30, 2021

### New

- Quantity Break, Custom Pricing, and Advanced Minimum Order can now exclude customer tags.

## v5.9.0 — Sep 29, 2021

### New

- Manual Orders can create draft orders for customers who do not already exist in the store.
- Registration Forms can be saved as custom templates.
- Added increment quantity support for Quantity Break rules.

### Improved

- Improved Multi-currency UI on mobile devices.
- Updated the Custom Pricing preview table.

## v5.8.0 — Sep 22, 2021

### New

- Save Registration Form customer information to order notes for new registrations.
- Added expand and collapse controls for Quantity Break tables on cart and quick cart pages.

## v5.7.0 — Sep 20, 2021

### New

- Search products by SKU or barcode when selecting specific products in Custom Pricing.
- Added SKU and barcode fields to Custom Pricing import and export files.

## v5.6.0 — Sep 8, 2021

### Improved

- Improved Amount Break rules.
- Updated the Display on QB table setting.
- Automatically highlight the active Quantity Break range based on selected quantity.
- Show discounted prices on cart and mini cart line items.

## v5.5.0 — Aug 23, 2021

### New

- Added the Manual Order module for Advanced and Platinum plans.

## v5.4.0 — Aug 17, 2021

### New

- Added the Discount Code module for Advanced and Platinum plans.

## v5.3.0 — Aug 13, 2021

### New

- Send new registration emails to multiple recipients.
- Added Deleted, Pending, and Restricted customer statuses.
- Send under-review emails for pending approvals.
- Send test emails to specific addresses for all email templates.

## v5.2.1 — Aug 10, 2021

### Improved

- Expanded email sender customization for Registration Forms.
- Improved Public API server stability.
- Added compatibility with Shopify Dawn.
- Expanded business validation support.

## v5.2.0 — Aug 5, 2021

### New

- Added email sender customization for Registration Forms.

## v5.1.0 — Jul 20, 2021

### New

- Added the Multi-Currency module for Advanced and Platinum plans.

## v5.0.0 — Jul 5, 2021

### New

- Added import and export for Custom Pricing rules.
- Added order amount rules to Advanced Minimum Order.

## v4.9.0 — Jun 25, 2021

### New

- Added an Open API for Custom Pricing.
- Added the $100 per month pricing plan.

## v4.8.0 — Jun 24, 2021

### Improved

- Improved the customer registration management grid with pagination and created dates.
- Added reCAPTCHA to the wholesale registration form.
- Added phone and company fields compatible with Shopify forms.
- Let admins download uploaded files from new registration emails.

## v4.7.0 — Jun 10, 2021

### New

- Added approved and rejected customer emails.

### Fixed

- Fixed duplicate account creation.

## v4.6.0 — Jun 2, 2021

### New

- Added tax-inclusive and tax-exclusive display on product pages.
- Automatically detect visitor IP to display the right tax setting.

## v4.4.1 — May 26, 2021

### Improved

- Updated Custom Pricing installation instructions.

### Fixed

- Fixed short password support in the wholesaler registration form.

## v4.4.0 — May 25, 2021

### New

- Exempt tax for customers who register through a specific wholesale registration form.

## v4.3.0 — May 19, 2021

### Improved

- Save option labels or placeholder values even without visible labels.
- Add custom fields to notes for existing customers.
- Improved the UX for required fields in Registration Forms.

## v4.2.0 — May 19, 2021

### Improved

- Added manual installation instructions for Quantity Break.
- Improved the Custom Pricing installation page.

## v4.1.0 — May 13, 2021

### New

- Added a file upload field to the wholesale registration form.
- Supported file types include documents, images, audio, video, archives, and spreadsheets up to 2 MB.

## v4.0.0 — May 6, 2021

### New

- Added the Advanced Minimum Order module with quantity-based and order-amount rules.
- Supports multiple rules, specific products or tags and collections, cart page validation, and Buy It Now compatibility.

## v3.5.0 — Apr 16, 2021

### New

- Added email notifications when customers register.

### Improved

- Improved the overall UX.

## v3.5.0 — Apr 14, 2021

### New

- Added automatic and manual installation options.
- Added VAT validation on the cart page.
- Added VAT ID to orders and order attributes.

## v3.1.0 — Mar 26, 2021

### New

- Added auto tags based on custom fields.
- Added Custom Pricing and Quantity Break display on cart pages.
- Published a release notes page.

### Improved

- Synced custom field information with Shopify customer notes.
- Optimized the app UX and Registration Form storefront display.

## v3.0.0 — Mar 5, 2021

### Improved

- Improved Custom Pricing loading speed by up to 5x.
- Added compatibility with the Warehouse theme.
- Added more translation text in Registration Forms.

### Fixed

- Fixed checkout loading button and Buy It Now button issues.

## v2.9.0 — Feb 12, 2021

### New

- Added the Quantity Break module.
- Works with all free Shopify themes.
- Added unlimited Quantity Break rules with product-, variant-, and minimum-order-based rule types.
- Added compatibility with Custom Pricing.

## v2.5.0 — Jan 14, 2021

### New

- Added the B2B Registration Form module.
- Added unlimited registration fields and unlimited custom fields.
- Let merchants modify or disable Shopify's default registration form.
- Added account actions after signup, VAT validation, translation support, and UX improvements.

## v2.0.0 — Nov 26, 2020

### New

- Added the Auto Tag module.
- Auto-tag customers and orders based on events such as creation, payment, fulfillment, and cancellation.
- Added multiple tags, Any and All mixed conditions, unlimited rules, and Apply to Previous Customers and Orders.

## v1.0.0 — Aug 9, 2020

### First release

- Added the Custom Pricing module.
- Set customer-specific pricing with automatic installation.
- Works with all free Shopify themes.
- Select products by tags, collections, and more.
