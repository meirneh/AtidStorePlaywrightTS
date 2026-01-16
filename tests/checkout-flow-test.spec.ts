import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";

import { SITE } from "../utils/test-data/site";
import { NAV } from "../utils/test-data/navigation";
import { PRODUCTS } from "../utils/test-data/products";
import { CART } from "../utils/test-data/cart";
import { BILLING_ISRAEL, CHECKOUT } from "../utils/test-data/checkout";


let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage;
let productDetailsPage: ProductDetailsPage;
let cartPage: CartPage;
let checkoutPage: CheckoutPage;

test.describe('Checkout Flow Shipping, Payment and Order Review', () => {

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

    test('TC-032 Guest checkout is accessible and cart is preserved', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidGreenShoes.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([...CART.lines.greenQtyOne]);
        await cartPage.goToCheckout();
        await checkoutPage.verifyOrderDetails(
            [{ term: PRODUCTS.atidGreenShoes.name, expectedQty: CHECKOUT.orderExpectations.greenShoes.qty }],
            [{ term: PRODUCTS.atidGreenShoes.name, expectedTotal: CHECKOUT.orderExpectations.greenShoes.lineTotal }],
            CHECKOUT.orderExpectations.greenShoes.subTotal,
            CHECKOUT.orderExpectations.greenShoes.orderTotal
        );

    })

    test('TC-033 Shipping address requires mandatory fields', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidGreenShoes.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.goToCheckout();
        await checkoutPage.placeOrder();
        await checkoutPage.verifyErrorsMessagesTexts();
    })

    test('TC-034 Shipping method selection updates totals', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidGreenShoes.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.goToCheckout();
        await checkoutPage.selectShippingOption(CHECKOUT.shippingOptions.deliveryExpress);
        await checkoutPage.verifyTotalsAfterShippingChange(CHECKOUT.shippingCosts.deliveryExpress);
        await checkoutPage.selectShippingOption(CHECKOUT.shippingOptions.registeredMail);
        await checkoutPage.verifyRegisteredMailSelected();
        await checkoutPage.verifyTotalsAfterShippingChange(CHECKOUT.shippingCosts.registeredMail);
        await checkoutPage.selectShippingOption(CHECKOUT.shippingOptions.localPickup);
        await checkoutPage.verifyTotalsAfterShippingChange(CHECKOUT.shippingCosts.localPickup);
    })

    test('TC-035 Payment step accepts valid path', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidGreenShoes.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.goToCheckout();
        await checkoutPage.selectShippingOption(CHECKOUT.shippingOptions.deliveryExpress);
        await checkoutPage.fillBillInfo(BILLING_ISRAEL)
        await checkoutPage.placeOrder();
        await checkoutPage.verifyInvalidPaymentMessage();
    })
})
