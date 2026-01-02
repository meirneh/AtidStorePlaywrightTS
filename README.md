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
- `utils/` – Utilities and shared helpers (test data, helpers, fixtures)
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
- Running with multiple workers (`--workers=4`) may produce worker teardown timeout warnings due to demo/environment limitations.
- These warnings do not indicate functional test failures.

## Cross-Browser
- Cross-browser execution (Chromium, Firefox, WebKit) is considered an optional hardening stage.
- A small number of tests may fail cross-browser due to engine differences and demo limitations.

## Versioning
- `v1.0-baseline` – Stable baseline: 58 tests passing on Chromium with `--workers=1`.

## Notes
This project is not a production system and not a home assignment.
It is intended solely for learning, experimentation, and portfolio demonstration.
