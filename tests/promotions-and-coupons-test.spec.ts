import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";

import { SITE } from "../utils/test-data/site";
import { NAV } from "../utils/test-data/navigation";
import { PRODUCTS } from "../utils/test-data/products";
import { COUPONS } from "../utils/test-data/coupons";

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
        await page.goto(SITE.baseUrl);
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
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidGreenShoes.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyTotalValue(COUPONS.valid.expectedTotalBeforeDiscount);
        await cartPage.applyCoupon(COUPONS.valid.code);
        await cartPage.verifyDiscountIsVisible();
        await cartPage.verifyTotalValue(COUPONS.valid.expectedTotalAfterDiscount);
    })

    test('TC-047 Invalid/expired coupon shows error ', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidGreenShoes.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyTotalValue(COUPONS.valid.expectedTotalBeforeDiscount);
        await cartPage.applyCoupon(COUPONS.invalid.code);
        await cartPage.verifyErrorMessageCoupnNotExist(COUPONS.invalid.code);
        await cartPage.verifyDiscountIsNotVisible();
        await cartPage.verifyTotalValue(COUPONS.valid.expectedTotalBeforeDiscount);
    })

    test('TC-048 Removing coupon restores totals', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidGreenShoes.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyTotalValue(COUPONS.valid.expectedTotalBeforeDiscount);
        await cartPage.applyCoupon(COUPONS.valid.code);
        await cartPage.verifyDiscountIsVisible();
        await cartPage.verifyTotalValue(COUPONS.valid.expectedTotalAfterDiscount);
        await cartPage.removeCoupon();
        await cartPage.verifyDiscountIsNotVisible();
        await cartPage.verifyTotalValue(COUPONS.valid.expectedTotalBeforeDiscount);
    })


})

