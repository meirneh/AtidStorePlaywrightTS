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
import { goToStore } from "../utils/helpers/navigation";
import { openProductFromStore } from "../utils/helpers/store";
import { addProductToCartFromStoreAndOpenCart } from "../utils/helpers/cart-actions";

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage;
let productDetailsPage: ProductDetailsPage;
let cartPage: CartPage;
let checkoutPage: CheckoutPage;

test.describe('Promotions & Coupons Apply, Validate and Remove Discounts', () => {

    const goToStoreTab = async () => {
            await goToStore(headerFooterPage, NAV.tabs.store);
        };
    
        const openProduct = async (productName: string) => {
            await openProductFromStore(goToStoreTab, categoryPage, productName);
        };
    


    const verifyTotalBeforeDiscount = async () => {
        await cartPage.verifyTotalValue(COUPONS.valid.expectedTotalBeforeDiscount);
    };

    const applyValidCouponAndVerifyTotals = async () => {
        await cartPage.applyCoupon(COUPONS.valid.code);
        await cartPage.verifyDiscountIsVisible();
        await cartPage.verifyTotalValue(COUPONS.valid.expectedTotalAfterDiscount);
    };

    const applyInvalidCouponAndVerifyNoDiscount = async () => {
        await cartPage.applyCoupon(COUPONS.invalid.code);
        await cartPage.verifyErrorMessageCoupnNotExist(COUPONS.invalid.code);
        await cartPage.verifyDiscountIsNotVisible();
        await cartPage.verifyTotalValue(COUPONS.valid.expectedTotalBeforeDiscount);
    };

    const removeCouponAndVerifyTotalsRestored = async () => {
        await cartPage.removeCoupon();
        await cartPage.verifyDiscountIsNotVisible();
        await cartPage.verifyTotalValue(COUPONS.valid.expectedTotalBeforeDiscount);
    };

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
        await addProductToCartFromStoreAndOpenCart(openProduct, productDetailsPage,PRODUCTS.atidGreenShoes.name);
        await verifyTotalBeforeDiscount();
        await applyValidCouponAndVerifyTotals();
    })

    test('TC-047 Invalid/expired coupon shows error ', async () => {
        await addProductToCartFromStoreAndOpenCart(openProduct, productDetailsPage, PRODUCTS.atidGreenShoes.name);
        await verifyTotalBeforeDiscount();
        await applyInvalidCouponAndVerifyNoDiscount();
    })

    test('TC-048 Removing coupon restores totals', async () => {
        await addProductToCartFromStoreAndOpenCart(openProduct, productDetailsPage, PRODUCTS.atidGreenShoes.name);
        await verifyTotalBeforeDiscount();
        await applyValidCouponAndVerifyTotals();
        await removeCouponAndVerifyTotalsRestored();
    })

})

