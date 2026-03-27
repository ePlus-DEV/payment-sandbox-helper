# Changelog

## [Unreleased]

### Added
- Firefox support via `sidebar_action` manifest key with `default_width: 400`
- `utils/storage.ts` — typed WXT storage items for country, cardholder name, and card backgrounds

### Changed
- `wxt.config.ts` — `manifest` converted to function to support per-browser config
- `wxt.config.ts` — `sidePanel` permission now only included for Chrome builds
- `wxt.config.ts` — `side_panel` / `sidebar_action` conditionally set based on target browser
- `wxt.config.ts` — `data_collection_permissions` moved inside `browser_specific_settings.gecko`
- `background.ts` — sidebar toggle now uses `browser.sidebarAction.toggle()` on Firefox and `browser.sidePanel.open()` on Chrome
- `App.tsx` — migrated all `localStorage` calls to WXT storage API (`wxt/utils/storage`)

## [1.0.0] - Initial release

### Added
- PayPal Sandbox card generator (Visa, Mastercard, Amex, Diners, Maestro, CUP, JCB)
- PayPal error trigger cards (CCREJECT-* codes)
- Stripe test card list with Success / Decline / 3DS categories
- Auto-fill content script for payment forms
- Context menu integration for quick field filling
- Settings page — country, cardholder name, card background
- i18n support (English, Vietnamese)
- Chrome and Firefox builds via WXT
