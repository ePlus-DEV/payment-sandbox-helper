# Changelog

## [1.1.0] - 2026-10-05
### :sparkles: New Features
- [`b9c400a`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/b9c400aa826d76aa867e73a039e2381a0a4842d0) - add curated payment scenario catalog *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`1216982`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/12169822030903e8403e9899347a1f0de25ec8ab) - persist scenario favorites and recents *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`a3c9d74`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/a3c9d745ce01eaf0115476c1322aba57f14c8307) - add en scenario library translations *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`26fe99e`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/26fe99e2e23b2cb1de6f0f1eac8098ea21fe807d) - add vi scenario library translations *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`c3c714c`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/c3c714c93fe1f0f9594de427360ff0e4c17d4688) - add searchable scenario library UI *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`4965c0a`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/4965c0ada1a98e2586fc6a334efb68bbc867c790) - add PayPal context scenario catalog *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`7e6cd4e`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/7e6cd4e2266acde0d28378170df3330cde1562c7) - add PayPal search and copy-all actions *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f2be12b`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/f2be12bd0d72cfeebc64a3860d7f492084c0912c) - sync context menu with scenario catalog *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3aaf68e`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/3aaf68e480fa1cb60569c673ccdf719ff8fbe6c2) - expose payment provider detection *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3b444ad`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/3b444adb20c433c761db9ecc768a84b88e17f947) - auto-select provider from detected payment form *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :bug: Bug Fixes
- [`a79248c`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/a79248c173fa8cb50b27678d835108fff6ec5580) - improve autofill across payment frames *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`bd768e6`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/bd768e6f24449f3db4c1ad12caec0aaf99592583) - stabilize side panel and context menu fills *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`2c1887a`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/2c1887aab372af2e5eb1c714ef9efb14e1d9bdf8) - keep background types browser-agnostic *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`9333807`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/9333807f160c04b8e443396202a31e5f17b99a0d) - avoid duplicate context menu initialization *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`e87cba0`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/e87cba025935b7cba01c036600416dd83ae2409e) - use secure randomness for generated card data *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`921f65a`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/921f65a2d978c96f898e10d2fb9da6c03f27d522) - **ci**: preserve typecheck failures through tee *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f3184b7`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/f3184b7755c518e93a18c044c0b67074abb05ce1) - normalize expiry and satisfy strict type checks *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`96e9b02`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/96e9b0203f36e60eb116800f8163acf71482aa95) - make secure card helpers type-safe *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`2fdff14`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/2fdff14f60eb94cf1a51f33dc154ca86cb11e75b) - satisfy strict sidepanel type checks *(commit by [@github-actions[bot]](https://github.com/apps/github-actions))*
- [`398db2b`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/398db2bad51d24f200ffff53993b3af3e8420760) - reuse secure card generators in side panel *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`cd50f36`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/cd50f364021dbf063283fcd4a35b918b1a541cb3) - handle shadow fields and split expiry inputs *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3c9bd80`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/3c9bd805143426fabe693e556c64e5802ac5a112) - preserve field context for targeted menu fills *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b0fff6c`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/b0fff6c3505007812c9e342c1917dc50cc161235) - use scenario country for PayPal 3DS fills *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`809ab6e`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/809ab6e33db707d11b1a0b21ddda3357425b6e91) - unify autofill across payment frames *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`652d6e5`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/652d6e5aaeffcf9a106c3b8e51574e29bd5d5642) - target every payment iframe from context menu *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3c34bd2`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/3c34bd2f2439880a9ca1d42895fe44ededd96fd3) - allow frame enumeration for reliable autofill *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b9247ee`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/b9247ee11e4b7e1d736f2874b2a3c25d91ffa2f1) - tag autofill payloads with payment provider *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`248cd2d`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/248cd2de0316f44614760a4fedac08d7397052a5) - prevent cross-provider payment autofill *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`034dace`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/034dace5c86aac388cb0bdfe93d6bac587c16b17) - preserve provider in context-menu autofill *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`8db5cd2`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/8db5cd22a648aa398a925faeac58b2ac3ceccb18) - type-safe provider detection result *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`35f0133`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/35f01336e4ba7fd30d3659078d21403808cc86a4) - keep context-menu autofill inside clicked frame *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :wrench: Chores
- [`b59dec5`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/b59dec5bcfed45451aa7894a9fe38bcece215ad6) - **deps**: bump actions/github-script from 8.0.0 to 9.0.0 *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`d736b13`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/d736b13f1124503da89d352562d978520ed36358) - **deps**: bump softprops/action-gh-release from 2 to 3 *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`5c536fa`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/5c536fa3d96c7c8193048196bef23aeeb6d3b071) - **deps**: bump the production-dependencies group with 2 updates *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`10a3f5e`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/10a3f5e7380dcfb56412471eb1812faeb887e598) - **deps**: bump dependabot/fetch-metadata from 3.0.0 to 3.1.0 *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`f7a121d`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/f7a121d8a470557b3036cc6eea4aecc546fe0ffd) - **deps**: bump @fortawesome/react-fontawesome *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`ccaa574`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/ccaa5746546bc515c71ca62337b5f1e89553525a) - **deps**: bump the production-dependencies group with 2 updates *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`43e630b`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/43e630b7754f72b9b2fe9a1671bead7d1b6ef865) - **deps**: bump the production-dependencies group with 2 updates *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`f9ccaca`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/f9ccacab7e96174d13596277cc81945be31ad1b1) - **deps**: bump actions/checkout from 6 to 7 *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`ea967b4`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/ea967b4ff45d1f5e094ac69b17eee7cf6fdca71d) - **deps**: bump the production-dependencies group with 3 updates *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`ff6cf08`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/ff6cf08099a46bf69bb32e3aaac1c99011445e24) - **deps**: bump @fortawesome/react-fontawesome *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`873cc86`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/873cc869d90ed7c5f87a194fb33f968a6544c801) - **deps**: bump actions/setup-node from 6 to 7 *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`79b8c1e`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/79b8c1ec39c655c78eece312ed8c48a73a993779) - **deps**: bump the production-dependencies group with 4 updates *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`00211a3`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/00211a37397e9ab81e2a19229eb4ea421d63b4c1) - **deps-dev**: bump the dev-dependencies group across 1 directory with 5 updates *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`69acc59`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/69acc598004c648c57ab9bf97fe7e4a260d8d925) - **deps-dev**: bump wxt in the dev-dependencies group *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`6d6a2c0`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/6d6a2c0310a7b58e605c2e42e5e5c70bcade24ab) - add temporary PR patch workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`54cb7b5`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/54cb7b5e4d3252179e733327be5f7b13a2b3a9d1) - remove temporary PR patch workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`7eb6778`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/7eb6778f4b9ef6efe7ec01f6a8afcb583fc061bf) - **deps**: bump the production-dependencies group across 1 directory with 2 updates *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`eeca3ab`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/eeca3abcc4c488fee760854beb2f406204c7e888) - **deps-dev**: bump the dev-dependencies group across 1 directory with 2 updates *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`d0d4622`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/d0d4622fd3210cade121ae1e0ad1de75f865c9fa) - **deps-dev**: bump wxt in the dev-dependencies group *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`0b3599c`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/0b3599cf7eff2301932d5385c40d51f7f6e1a738) - **deps-dev**: bump vite in the dev-dependencies group *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`3aae0a3`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/3aae0a38d1b902bab3b42ac44974c4a0e5efe1d2) - **deps-dev**: bump @types/react-dom in the dev-dependencies group *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`5f44bf3`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/5f44bf366125e3858b4e6278ee80b1004ece8e04) - **deps-dev**: bump @types/react-dom in the dev-dependencies group *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`1d4827f`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/1d4827f018608becb485160f74fc383b0fd4de27) - **deps-dev**: bump vite in the dev-dependencies group *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`b475b0c`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/b475b0c18e3a66dc8bf9a3d609ebb9521ff572ac) - **deps**: bump the production-dependencies group across 1 directory with 2 updates *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`92eb1e5`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/92eb1e5aec73f779c2e793139aa5b8ba50c72061) - **deps-dev**: bump vite in the dev-dependencies group *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`13ba3c0`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/13ba3c0d82d5aaabaec9862fcdfbb463d0848895) - bump extension version to 1.1.0 *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`61910d6`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/61910d6edb23aa9f1f995fbcfdde64807979ffb7) - keep en locale diff compact *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`fe9caad`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/fe9caadc47af38ec6edbd2677d7d25693d2f804e) - keep vi locale diff compact *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`a484137`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/a4841372b6cd493ac82a266c5c0efaaa48c71693) - **deps**: bump tar from 7.5.13 to 7.5.22 *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*
- [`8fa7ee0`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/8fa7ee07139de605a3ac9a845e0acee4282059ad) - ignore local environment files *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f9d4b49`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/f9d4b49b3c3815a43ecf5874a4eb0435ee036131) - **deps**: refresh patched transitive dependencies *(commit by [@github-actions[bot]](https://github.com/apps/github-actions))*
- [`3b9bbb4`](https://github.com/ePlus-DEV/payment-sandbox-helper/commit/3b9bbb4b0b6ff0ba8e5e32e399a88c46f1af8a4f) - **deps-dev**: bump vite *(commit by [@dependabot[bot]](https://github.com/apps/dependabot))*


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
[1.1.0]: https://github.com/ePlus-DEV/payment-sandbox-helper/compare/1.0.0...1.1.0
