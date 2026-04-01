# Payment Sandbox Helper

A browser extension for developers to quickly generate and auto-fill test card data when working with PayPal Sandbox and Stripe Test environments.

## Features

- **PayPal Sandbox cards** — Generate random valid test cards (Visa, Mastercard, Amex, Diners, Maestro, CUP, JCB) with Luhn-valid numbers
- **PayPal error triggers** — One-click fill for PayPal-specific error codes (CCREJECT-REFUSED, CCREJECT-SF, etc.)
- **Stripe test cards** — Full list of Stripe test cards categorized by Success, Decline, and 3DS
- **Auto-fill** — Automatically fills card number, expiry, CVV, cardholder name, and country into payment forms
- **Context menu** — Right-click on any input field to fill card data directly
- **Customizable settings** — Set default country, cardholder name, and card background images
- **i18n** — Supports English and Vietnamese

## Supported Sites

The auto-fill content script runs on:

- `*.paypal.com`
- `*.sandbox.paypal.com`
- `*.stripe.com`
- `localhost` / `127.0.0.1`
- `*.appspot.com`

## Tech Stack

- [WXT](https://wxt.dev) — Web Extension framework
- React 19 + TypeScript
- Tailwind CSS v4
- FontAwesome icons
- WXT Storage API

## Development

```bash
# Install dependencies
yarn install

# Dev mode (Chrome)
yarn dev

# Dev mode (Firefox)
yarn dev:firefox

# Build for Chrome
yarn build

# Build for Firefox
yarn build:firefox

# Package as zip
yarn zip
yarn zip:firefox
```

## Project Structure

```
entrypoints/
  background.ts       # Service worker — sidebar toggle, context menus
  content.ts          # Content script — form detection and auto-fill
  sidepanel/
    App.tsx           # Main UI (PayPal + Stripe tabs, settings)
utils/
  cards.ts            # Card generation helpers (Luhn, random expiry/CVV)
  storage.ts          # WXT storage items (country, cardholder, backgrounds)
public/
  _locales/en/        # English i18n messages
  _locales/vi/        # Vietnamese i18n messages
  img/background/     # Preset card background images
```

## Browser Support

| Browser | Status |
|---------|--------|
| Chrome  | ✅ Manifest V3, `sidePanel` API |
| Firefox | ✅ Manifest V3, `sidebar_action` API |
