# Atid Store Playwright (TypeScript) – E2E Automation (Demo / Portfolio)

This is a learning and portfolio project built using **Playwright with TypeScript**, based on a demo e-commerce application.
The goal of this project is to practice and demonstrate good E2E automation practices, structure, and stability.

## Scope
- ~58 end-to-end test cases
- All test suites aligned with an internal STD
- Stable execution baseline on Chromium

## Tech Stack
- Playwright
- TypeScript
- Page Object Model (POM)

## Project Structure
- `tests/` – Test specifications grouped by functional suites
- `pages/` – Page Object Model implementations
- `utils/` – Utilities and shared helpers (test data, helpers)
- `playwright.config.ts` – Playwright configuration

## How to Run

Install dependencies:
```bash
npm install
```

Run the official baseline:
```bash
npx playwright test --project=chromium --workers=1
```

Open the last HTML report:
```bash
npx playwright show-report
```

## Execution Policy
- **Official baseline:** Chromium + `--workers=1`
- Running with multiple workers (e.g. `--workers=4`) may produce worker teardown timeout warnings due to demo/environment limitations.
- These warnings do not indicate functional test failures.

## Cross-Browser
- Cross-browser execution (Chromium, Firefox, WebKit) is considered an optional hardening stage.
- A small number of tests may fail cross-browser due to engine differences and demo limitations.

## Stage 2 – Global Helpers Optimization
Stage 2 focuses on reducing duplication and improving maintainability by introducing reusable global helpers under `utils/helpers/`,
while keeping readability via local wrappers inside each `describe`.

Rules applied during Stage 2:
- Keep local wrapper helpers at the beginning of each `describe`
- No artificial waits
- No changes to hooks/fixtures during this stage
- Each migrated spec is validated before proceeding

Key global helpers added/used:
- `openProductFromStore` – Navigate to Store and open a product by name
- `reloadDom` – `page.reload({ waitUntil: "domcontentloaded" })` wrapper
- `verifyHeaderCartBadgeAndTotal` – Stable header badge/total verification
- `addProductToCartFromStore` – open product + add to cart
- `addProductToCartFromStoreAndOpenCart` – open product + add to cart + open cart

## Versioning
- `v1.0-baseline` – Stable baseline: tests passing on Chromium with `--workers=1`.
- `v1.1-stage1-hardcoded-cleanup` – Stage 1 refactor and cleanup after baseline stabilization.
- `v1.2-stage2-helpers` – Stage 2 global helpers introduced + specs migrated and validated spec-by-spec.

## Notes
This project is not a production system and not a home assignment.
It is intended solely for learning, experimentation, and portfolio demonstration.
