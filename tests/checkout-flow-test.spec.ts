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

const billingInfoIsrael = {
    firstName: "Haim",
    lastName: "Cohen",
    company: "Cohen LTD.",     // optional
    country: "Israel",
    address: "Ha Jasmin 8",
    appartment: "floor 1",     // optional
    postcode: "1234567",
    city: "Tel Aviv",
    phone: "050-1234567",
    email: "cohen@gmail.com",
}

test.describe('Checkout Flow – Shipping, Payment and Order Review', () => {

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

    test('TC-032 Guest checkout is accessible and cart is preserved', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Green Shoes");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([{ term: "ATID Green Shoes", expectedPrice: 110.00, expectedQty: 1, expectedSubtotal: 110.00 }]);
        await cartPage.goToCheckout();
        await checkoutPage.verifyOrderDetails(
            [{ term: "ATID Green Shoes", expectedQty: 1 }],
            [{ term: "ATID Green Shoes", expectedTotal: 110.00 }],
            110.00, // expectedSubTotal
            110.00  // expectedOrderTotal
        );
    })

    test('TC-033 Shipping address requires mandatory fields', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Green Shoes");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.goToCheckout();
        await checkoutPage.placeOrder();
        await checkoutPage.verifyErrorsMessagesTexts();
    })

    test('TC-034 Shipping method selection updates totals', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Green Shoes");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.goToCheckout();
        await checkoutPage.selectShippingOption('deliveryExpress');
        await checkoutPage.verifyTotalsAfterShippingChange(12.50);
        await checkoutPage.selectShippingOption('registeredMail');
        await checkoutPage.verifyRegisteredMailSelected();
        await checkoutPage.verifyTotalsAfterShippingChange(5.90);
        await checkoutPage.selectShippingOption('localPickup');
        await checkoutPage.verifyTotalsAfterShippingChange(0);
    })

    test('TC-035 Payment step accepts valid path', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Green Shoes");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.goToCheckout();
        await checkoutPage.selectShippingOption('deliveryExpress');
        await checkoutPage.fillBillInfo(billingInfoIsrael)
        await checkoutPage.placeOrder();
        await checkoutPage.verifyInvalidPaymentMessage();
    })








})
