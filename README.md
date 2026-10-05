# Payment Sandbox Helper

A browser extension for developers to quickly generate and auto-fill test card data when working with PayPal Sandbox and Stripe Test environments.

## Features

- **PayPal Sandbox cards** — Generate random valid test cards (Visa, Mastercard, Amex, Diners, Maestro, CUP, JCB) with Luhn-valid numbers
- **PayPal error triggers** — One-click fill for PayPal-specific error codes (CCREJECT-REFUSED, CCREJECT-SF, etc.)
- **Scenario library** — Curated Stripe scenarios for Success, Declines, 3DS, Radar risk, verification checks, and disputes\n- **Scenario search & shortcuts** — Search by scenario/card number and keep Favorites + the 5 most recently used scenarios\n- **PayPal 3D Secure** — Official purchase-flow 3DS scenarios for frictionless, step-up, failure, and unavailable authentication
- **Auto-fill** — Automatically fills card number, expiry, CVV, cardholder name, and country into payment forms
- **Unified context menu** — Right-click to browse the same PayPal/Stripe scenario catalog used by the side panel\n- **Copy full card** — Copy card number, expiry, CVC, cardholder, and country in one action
- **Customizable settings** — Set default country, cardholder name, and card background images
- **i18n** — Supports English and Vietnamese\n\nScenario values are curated from the official Stripe and PayPal sandbox testing documentation.

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

## Environment

Copy the example file before using local store-submission tooling:

```bash
cp .env.example .env
```

The extension itself does not require runtime API credentials for normal local development. The environment file is mainly for browser-store publishing and GitHub automation.

For GitHub Actions, add the corresponding values under **Settings → Secrets and variables → Actions → Repository secrets**:

- `EPLUS_BOT_TOKEN` — token for the `eplus-bot` PR/review automation
- `CHROME_EXTENSION_ID`
- `CHROME_CLIENT_ID`
- `CHROME_CLIENT_SECRET`
- `CHROME_REFRESH_TOKEN`
- `FIREFOX_EXTENSION_ID`
- `FIREFOX_JWT_ISSUER`
- `FIREFOX_JWT_SECRET`

See `.env.example` for optional WXT submission settings.

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

## Installation

For Chrome, Firefox, Edge, Opera, and manual update instructions, see [INSTALL.md](INSTALL.md).

## Browser Support

| Browser | Status |
|---------|--------|
| Chrome  | ✅ Manifest V3, `sidePanel` API |
| Firefox | ✅ Manifest V3, `sidebar_action` API · [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/sandbox-pay/) |
