import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage;
let productDetailsPage: ProductDetailsPage;
let cartPage: CartPage;
let checkoutPage: CheckoutPage;

test.describe('Promotions & Coupons – Apply, Validate and Remove Discounts', () => {
    test.beforeEach(async () => {
        browser = await chromium.launch({ channel: "chrome", slowMo: 500 });
        context = await browser.newContext();
        page = await context.newPage();
        await page.goto("https://atid.store/");
        headerFooterPage = new HeaderFooterPage(page);
        categoryPage = new CategoryPage(page);
        productDetailsPage = new ProductDetailsPage(page);
        cartPage = new CartPage(page);
        checkoutPage = new CheckoutPage(page);

    });

    test.afterAll(async () => {
        await context?.close();
        await page?.close();
    })

    test('TC-046 Applying a valid coupon updates totals', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Green Shoes");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyTotalValue(110);
        await cartPage.applyCoupon("kuku");
        await cartPage.verifyDiscountIsVisible();
        await cartPage.verifyTotalValue(88);
    })

    test('TC-047 Invalid/expired coupon shows error ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Green Shoes");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyTotalValue(110);
        await cartPage.applyCoupon("XXXXX");
        await cartPage.verifyErrorMessageCoupnNotExist("XXXXX");
        await cartPage.verifyDiscountIsNotVisible();
        await cartPage.verifyTotalValue(110);
    })

    test('TC-048 Removing coupon restores totals', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Green Shoes");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyTotalValue(110);
        await cartPage.applyCoupon("kuku");
        await cartPage.verifyDiscountIsVisible();
        await cartPage.verifyTotalValue(88);
        await cartPage.removeCoupon();
        await cartPage.verifyDiscountIsNotVisible();
        await cartPage.verifyTotalValue(110);
    })



})

