import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from '../pages/CheckoutPage';


let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage
let productDetailsPage: ProductDetailsPage;
let cartPage: CartPage;
let checkoutPage: CheckoutPage;


test.describe('Cross-Checks & Consistency — Price and totals consistency across Listing, PDP, Cart, and Checkout', () => {
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

    test('TC-053 Listing price equals PDP price', async () => {
        const productName = "ATID Blue Shoes";
        await headerFooterPage.navigateToTab("STORE");
        const listingPriceText = await categoryPage.getProductPriceByName(productName);
        await categoryPage.selectProductByName(productName);
        const pdpPriceText = await productDetailsPage.getProductCurrentPriceText();
        expect(pdpPriceText.trim()).toBe(listingPriceText.trim());
    });

    test('TC-054 PDP/Cart unit price consistency', async () => {
        const normalize = (s: string): string =>
            s
                .replace(/\u00A0/g, " ")        // NBSP
                .replace(/[\u200E\u200F]/g, "") // LRM/RLM (RTL marks)
                .replace(/\s+/g, " ")
                .trim();

        const productName = "ATID Blue Shoes";
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName(productName);
        const pdpPriceText = await productDetailsPage.getProductCurrentPriceText();
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        const productPriceInCart = await cartPage.getCartUnitPriceTextByName(productName);
        expect(normalize(pdpPriceText)).toBe(normalize(productPriceInCart));
    });

    test('TC-055 Rounding of totals is consistent', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Blue Shoes");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("Black Hoodie");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartTotalsSubtotalText("230.00 ₪");
        await cartPage.removeProductByName("Black Hoodie");
        await cartPage.verifyCartTotalsSubtotalText("80.00 ₪");
        await cartPage.setAndUpdateQty("ATID Blue Shoes", 2);
        await cartPage.verifyCartTotalsSubtotalText("160.00 ₪");
    })

    test('TC-056 Header CartBadge matches sum of quantities ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Blue Shoes");
        await productDetailsPage.addToCart();
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("Black Hoodie");
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.setAndUpdateQty("ATID Blue Shoes", 2);
        await page.reload();
        await cartPage.verifyQuantities([
            { term: "Black Hoodie", expectedQty: 1 },
            { term: "ATID Blue Shoes", expectedQty: 2 },
        ]);
        const totalQtyInCartPage = await cartPage.getTotalQuantityInCart();
        const badgeQty = await headerFooterPage.getQuantityItemsInCartCount();
        expect(badgeQty).toBe(totalQtyInCartPage);
    })

    test('TC-057 Currency symbol is consistent across pages', async () => {
        const productName = "ATID Blue Shoes";

        const normalize = (s: string): string =>
            s
                .replace(/\u00A0/g, " ")
                .replace(/[\u200E\u200F]/g, "")
                .replace(/\s+/g, " ")
                .trim();

        const PRICE_ILS_PATTERN = /^\d+\.\d{2}\s₪$/;

        await headerFooterPage.navigateToTab("STORE");

        // 1) Store/listing (cards)
        const listingPriceText = await categoryPage.getProductPriceByName(productName);
        expect(normalize(listingPriceText)).toMatch(PRICE_ILS_PATTERN);

        // 2) PDP
        await categoryPage.selectProductByName(productName);
        const pdpPriceText = await productDetailsPage.getProductCurrentPriceText();
        expect(normalize(pdpPriceText)).toMatch(PRICE_ILS_PATTERN);

        // 3) Header total price
        await productDetailsPage.addToCart();
        const headerTotalText = await headerFooterPage.getTotalItemsPriceInCart();
        expect(normalize(headerTotalText)).toMatch(PRICE_ILS_PATTERN);

        // 4) Cart page
        await productDetailsPage.viewCart();
        const cartUnitPriceText = await cartPage.getCartUnitPriceTextByName(productName);
        expect(normalize(cartUnitPriceText)).toMatch(PRICE_ILS_PATTERN);
    });

    test('TC-058 Breadcrumbs reflect navigation ', async () => {
        await headerFooterPage.navigateToTab("MEN");
        await categoryPage.verifyBreadCrumbCategoryText("Men");
        await categoryPage.selectProductByName("Black Hoodie");
        await productDetailsPage.verifyProductBreadCrumbText("Black Hoodie");
        await productDetailsPage.goToCategoryByBreadCrumb();
        await categoryPage.verifyBreadCrumbCategoryText("Men");
        await categoryPage.goToHomePageByBreadCrumb();
        await expect(page).toHaveURL("https://atid.store/");
    })



})
