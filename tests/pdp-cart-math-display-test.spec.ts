import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from '../pages/CartPage';




let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage;
let productDetailsPage: ProductDetailsPage;
let cartPage: CartPage;

test.describe('PDP → Cart Math & Display — Quantity Adjustments & Empty Cart Reset', () => {
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

    test('TC-066 Subtotal equals sum of line totals ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Green Shoes");
        await productDetailsPage.addToCart();
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Green Tshirt");
        await productDetailsPage.incrementQuantity(2);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([{ term: "ATID Green Shoes", expectedPrice: 110.00, expectedQty: 1, expectedSubtotal: 110.00 },
        { term: "ATID Green Tshirt", expectedPrice: 190.00, expectedQty: 3, expectedSubtotal: 570.00 }],)
        await cartPage.verifyCartTotalsSubtotal(680.00);
    })

    test('TC-067 Increasing and then decreasing qty keeps math correct', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Green Shoes");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([{ term: "ATID Green Shoes", expectedPrice: 110.00, expectedQty: 1, expectedSubtotal: 110.00 }]);
        await cartPage.verifyCartTotalsSubtotal(110.00);
        await cartPage.setAndUpdateQty("ATID Green Shoes", 2);
        await cartPage.verifyCartLines([{ term: "ATID Green Shoes", expectedPrice: 110.00, expectedQty: 2, expectedSubtotal: 220.00 }]);
        await cartPage.verifyCartTotalsSubtotal(220.00);
        await cartPage.setAndUpdateQty("ATID Green Shoes", 1);
        await cartPage.verifyCartLines([{ term: "ATID Green Shoes", expectedPrice: 110.00, expectedQty: 1, expectedSubtotal: 110.00 }]);
        await cartPage.verifyCartTotalsSubtotal(110.00);
    })

    test('TC-068 Removing last item resets header amount and badge', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Green Shoes");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([{ term: "ATID Green Shoes", expectedPrice: 110.00, expectedQty: 1, expectedSubtotal: 110.00 }]);
        await cartPage.verifyCartTotalsSubtotal(110.00);
        await cartPage.removeProductByName("ATID Green Shoes");
        await cartPage.verifyEmptyCartMessageText();
        await page.reload();
        await headerFooterPage.verifyQuantityItemsInCart("0");
        await headerFooterPage.verifyTotalItemsInCart("0.00");
    })



})
