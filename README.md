# Payment Sandbox Helper

A browser extension for developers to quickly generate and auto-fill test card data when working with PayPal Sandbox and Stripe Test environments.

## Features

- **PayPal Sandbox cards** — Generate random valid test cards (Visa, Mastercard, Amex, Diners, Maestro, CUP, JCB) with Luhn-valid numbers
- **PayPal error triggers** — One-click fill for PayPal-specific error codes (CCREJECT-REFUSED, CCREJECT-SF, etc.)
- **PayPal 3D Secure scenarios** — Frictionless, stand-in, and step-up authentication test cards
- **Stripe test cards** — Test cards categorized by Success, Decline, 3DS, Radar, and Disputes
- **Scenario search** — Search cards, test cases, error codes, and expected outcomes
- **Copy full card** — Copy number, expiry, CVV, cardholder, and country in one action
- **Unified context menu** — PayPal and Stripe context-menu scenarios share the same catalog as the side panel
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

## Browser Support

| Browser | Status |
|---------|--------|
| Chrome  | ✅ Manifest V3, `sidePanel` API |
| Firefox | ✅ Manifest V3, `sidebar_action` API |
