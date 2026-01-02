import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage
let productDetailsPage: ProductDetailsPage;
let cartPage: CartPage;
test.describe('Shopping Cart Functional Behavior and Validations', () => {
    test.beforeEach(async () => {
        browser = await chromium.launch({ channel: "chrome", slowMo: 500 });
        context = await browser.newContext();
        page = await context.newPage();
        await page.goto("https://atid.store/");
        headerFooterPage = new HeaderFooterPage(page);
        categoryPage = new CategoryPage(page);
        productDetailsPage = new ProductDetailsPage(page);
        cartPage = new CartPage(page);

    });

    test.afterAll(async () => {
        await context?.close();
        await page?.close();
    })

    test('TC-025 Cart page shows lines with unit price, qty, line total ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Yellow Shoes");
        await productDetailsPage.addToCart();
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("Black Hoodie");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([
            { term: "ATID Yellow Shoes", expectedPrice: 120.00, expectedQty: 1, expectedSubtotal: 120.00 },
            { term: "Black Hoodie", expectedPrice: 150.00, expectedQty: 1, expectedSubtotal: 150.00 },
        ]);
    })

    test('TC-026 Update quantity recalculates totals', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Yellow Shoes");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([
            { term: "ATID Yellow Shoes", expectedPrice: 120.00, expectedQty: 1, expectedSubtotal: 120.00 },
        ]);
        await cartPage.setAndUpdateQty("ATID Yellow Shoes", 2);
        await cartPage.verifyCartLines([
            { term: "ATID Yellow Shoes", expectedPrice: 120.00, expectedQty: 2, expectedSubtotal: 240.00 },
        ]);
    })

    test('TC-027 Remove item updates subtotal and CartBadge ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Yellow Shoes");
        await productDetailsPage.addToCart();
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("Black Hoodie");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([
            { term: "ATID Yellow Shoes", expectedPrice: 120.00, expectedQty: 1, expectedSubtotal: 120.00 },
            { term: "Black Hoodie", expectedPrice: 150.00, expectedQty: 1, expectedSubtotal: 150.00 },
        ]);
        await headerFooterPage.verifyQuantityItemsInCart("2");
        await headerFooterPage.verifyTotalItemsInCart("270.00");
        await cartPage.removeProductByName("ATID Yellow Shoes");
        await cartPage.verifyCartLines([
            { term: "Black Hoodie", expectedPrice: 150.00, expectedQty: 1, expectedSubtotal: 150.00 },
        ]);
        await page.reload({ waitUntil: "domcontentloaded" });
        await headerFooterPage.verifyQuantityItemsInCart("1");
        await headerFooterPage.verifyTotalItemsInCart("150.00");
    })

    test('TC-028 Negative removing all shows empty cart state ', async () => {
        test.setTimeout(60_000);
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Yellow Shoes");
        await productDetailsPage.addToCart();
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("Black Hoodie");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([
            { term: "ATID Yellow Shoes", expectedPrice: 120.00, expectedQty: 1, expectedSubtotal: 120.00 },
            { term: "Black Hoodie", expectedPrice: 150.00, expectedQty: 1, expectedSubtotal: 150.00 },
        ]);
        await headerFooterPage.verifyQuantityItemsInCart("2");
        await headerFooterPage.verifyTotalItemsInCart("270.00");
        await cartPage.removeProductByName(["ATID Yellow Shoes", "Black Hoodie"]);
        await cartPage.verifyEmptyCartMessageText();
        await cartPage.verifyNoCartItems();
        await page.reload({ waitUntil: "domcontentloaded" });
        await headerFooterPage.verifyQuantityItemsInCart("0");
        await headerFooterPage.verifyTotalItemsInCart("0.00");
    })

    test('TC-029 Negative invalid qty input handled ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Yellow Shoes");
        await productDetailsPage.addToCart();
        await headerFooterPage.verifyQuantityItemsInCart("1");
        await headerFooterPage.verifyTotalItemsInCart("120.00");
        await productDetailsPage.viewCart();
        await cartPage.setAndTryUpdateInvalidQty("ATID Yellow Shoes", -1);
        await headerFooterPage.verifyQuantityItemsInCart("1");
        await headerFooterPage.verifyTotalItemsInCart("120.00");
    })

    test('TC-030 Header amount and cart subtotal match', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Yellow Shoes");
        await productDetailsPage.addToCart();
        await headerFooterPage.verifyQuantityItemsInCart("1");
        await headerFooterPage.verifyTotalItemsInCart("120.00");
        await productDetailsPage.viewCart();
        await cartPage.setAndUpdateQty("ATID Yellow Shoes", 2);
        await page.reload({ waitUntil: "domcontentloaded" });
        await headerFooterPage.verifyQuantityItemsInCart("2");
        await headerFooterPage.verifyTotalItemsInCart("240.00");
    })

    test('TC-031 Navigating back to PDP preserves cart ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Yellow Shoes");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart()
        await cartPage.verifyCartLines([
            { term: "ATID Yellow Shoes", expectedPrice: 120.00, expectedQty: 1, expectedSubtotal: 120.00 },
        ]);
        await cartPage.selectProductByName("ATID Yellow Shoes");
        await headerFooterPage.clickCart();
        await cartPage.verifyCartLines([
            { term: "ATID Yellow Shoes", expectedPrice: 120.00, expectedQty: 1, expectedSubtotal: 120.00 },
        ]);
    })








})
