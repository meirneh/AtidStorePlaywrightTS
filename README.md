# 🧪 Atid Store – Playwright Automation Project

This project is an **end-to-end test automation suite built with Playwright and TypeScript**, designed as a **professional QA Automation portfolio project**.

The application under test is a real e-commerce site:
👉 https://atid.store (WordPress + WooCommerce)

---

## 🧱 Tech Stack

- Playwright
- TypeScript
- Page Object Model (POM)
- Custom Playwright fixtures
- Stateless reusable helpers
- Deterministic test execution

---

## 📁 Project Structure

```text
AtidStoreAutomation/
│
├── pages/                 # Page Objects (UI logic only)
├── tests/                 # Test specs grouped by feature
├── utils/
│   ├── fixtures/          # baseTest.ts (custom Playwright fixtures)
│   ├── helpers/           # Stateless reusable helpers
│   └── test-data/         # Static test data (products, navigation, cart, etc.)
│
├── playwright.config.ts
└── README.md
```

---

## ▶️ How to Run Tests

### Run **all tests**
```bash
npx playwright test
```

### Run using **Chromium with a single worker** (baseline)
```bash
npx playwright test --project=chromium --workers=1
```

### Run a **specific spec file**
```bash
npx playwright test tests/header-navigation-test.spec.ts --project=chromium --workers=1
```

> ℹ️ `--workers=1` is intentional to reduce flakiness on this real WooCommerce site.

---

### ▶️ Run with **Allure (Recommended)**

#### Run the entire project (cleans Allure results automatically)
```bash
npm run test:allure
```

#### Run a single spec (cleans Allure results automatically)
```bash
npm run test:allure:spec -- tests/cross-checks-consistency-test.spec.ts
```

#### Open the Allure report
```bash
npm run allure:serve
```

> ℹ️ Allure results are cleaned automatically before each run.

---

## 🧪 Test Strategy

- Tests are **independent and deterministic**
- No shared state between tests
- Each test starts from a **known initial state**
- No hard waits (`waitForTimeout`)
- Synchronization is based on DOM and UI state

---

## 📊 Test Reporting (Allure)

The project uses **Allure Report** for advanced test reporting and debugging.

### Features

- Structured test steps using `test.step`
- Test metadata:
  - epic
  - feature
  - story
  - severity
- Automatic evidence collection on failure:
  - Screenshots
  - Video recordings
  - Playwright traces (downloadable)

### Benefits

- Full visibility of test execution flow
- Step-by-step debugging
- Rich attachments for failed tests

### Trace Viewer

Playwright traces can be opened locally using:

```bash
npx playwright show-trace <trace.zip>
```

---

## 🧷 Custom Fixtures (baseTest.ts)

The project uses **custom Playwright fixtures** to inject Page Objects automatically.

Example:
```ts
test("example", async ({ headerFooterPage, categoryPage }) => {
  await headerFooterPage.navigateToTab("STORE");
});
```

### Available fixtures
- `headerFooterPage`
- `categoryPage`
- `productDetailsPage`
- `cartPage`
- `checkoutPage`
- `aboutPage`
- `contactUsPage`
- `searchResultPage`
- `goHome()` → navigates to the home page in a controlled way

---

## 🟢 Stage 3 – Fixtures & Test Lifecycle (COMPLETED)

### What was achieved

✔ All specs migrated to fixtures  
✔ No manual `new PageObject(page)` in specs  
✔ No global `let page` / `let headerFooterPage`  
✔ Correct usage of `beforeEach` (no `afterEach` misuse)  
✔ Helpers are stateless and dependency-injected  
✔ Full project scan confirms zero violations  

Stage 3 is **closed** ✅

---

## 🧪 Test Coverage

- Header & footer navigation
- Home and global navigation
- Header and sidebar search
- Product Details Page (PDP)
- Cart behavior
- Checkout flow (without payment)
- Coupons and promotions
- Static pages (About, Contact)

---

## 🧭 Roadmap

- **Stage 4**: Allure reporting ✅
- **Stage 5 (optional)**: Cross-browser hardening (Firefox / WebKit)
- **Stage 6**: Final polishing for interviews & GitHub

---

## 👤 Author

Built as a **professional QA Automation portfolio project** focused on clarity, maintainability, and real-world practices.
