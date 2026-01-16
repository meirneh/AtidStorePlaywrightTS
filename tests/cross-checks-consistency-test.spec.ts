import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";

import { SITE } from "../utils/test-data/site";
import { NAV } from "../utils/test-data/navigation";
import { PRODUCTS } from "../utils/test-data/products";
import { CATALOG } from '../utils/test-data/catalog';
import { FORMATS } from '../utils/test-data/formats';
import { CROSS_CHECKS_CONSISTENCY } from "../utils/test-data/cross-checks-consistency";
import { CART } from "../utils/test-data/cart";

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage
let productDetailsPage: ProductDetailsPage;
let cartPage: CartPage;

test.describe('Cross-Checks & Consistency — Price and totals consistency across Listing, PDP, Cart, and Checkout', () => {
    const atidBlueShoesName = PRODUCTS.atidBlueShoes.name;
    test.beforeEach(async () => {
        browser = await chromium.launch({ channel: "chrome", slowMo: 500 });
        context = await browser.newContext();
        page = await context.newPage();
        await page.goto(SITE.baseUrl);
        headerFooterPage = new HeaderFooterPage(page);
        categoryPage = new CategoryPage(page);
        productDetailsPage = new ProductDetailsPage(page);
        cartPage = new CartPage(page);

    });

    test.afterAll(async () => {
        await context?.close();
        await page?.close();
    })

    test('TC-053 Listing price equals PDP price', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        const listingPriceText = await categoryPage.getProductPriceByName(atidBlueShoesName);
        await categoryPage.selectProductByName(atidBlueShoesName);
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
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(atidBlueShoesName);
        const pdpPriceText = await productDetailsPage.getProductCurrentPriceText();
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        const productPriceInCart = await cartPage.getCartUnitPriceTextByName(atidBlueShoesName);
        expect(normalize(pdpPriceText)).toBe(normalize(productPriceInCart));
    });

    test("TC-055 Rounding of totals is consistent", async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidBlueShoes.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.blackHoodie.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartTotalsSubtotalText(
            CROSS_CHECKS_CONSISTENCY.expectedSubtotals.blueShoesPlusHoodie
        );
        await cartPage.removeProductByName(PRODUCTS.blackHoodie.name);
        await cartPage.verifyCartTotalsSubtotalText(
            CROSS_CHECKS_CONSISTENCY.expectedSubtotals.afterRemoveHoodie
        );
        await cartPage.setAndUpdateQty(PRODUCTS.atidBlueShoes.name, CART.quantities.two);
        await cartPage.verifyCartTotalsSubtotalText(
            CROSS_CHECKS_CONSISTENCY.expectedSubtotals.afterUpdateBlueShoesQty2
        );
    });

    test('TC-056 Header CartBadge matches sum of quantities ', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidBlueShoes.name);
        await productDetailsPage.addToCart();
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.blackHoodie.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.setAndUpdateQty(PRODUCTS.atidBlueShoes.name, CART.quantities.two);
        await page.reload();
        await cartPage.verifyQuantities([
            { term: PRODUCTS.blackHoodie.name, expectedQty: CART.quantities.one },
            { term: PRODUCTS.atidBlueShoes.name, expectedQty: CART.quantities.two},
        ]);
        const totalQtyInCartPage = await cartPage.getTotalQuantityInCart();
        const badgeQty = await headerFooterPage.getQuantityItemsInCartCount();
        expect(badgeQty).toBe(totalQtyInCartPage);
    })

    test('TC-057 Currency symbol is consistent across pages', async () => {
        const normalize = (s: string): string =>
            s
                .replace(/\u00A0/g, " ")
                .replace(/[\u200E\u200F]/g, "")
                .replace(/\s+/g, " ")
                .trim();
        const PRICE_ILS_PATTERN = FORMATS.priceIlsPattern;

        await headerFooterPage.navigateToTab(NAV.tabs.store);

        // 1) Store/listing (cards)
        const listingPriceText = await categoryPage.getProductPriceByName(atidBlueShoesName);
        expect(normalize(listingPriceText)).toMatch(PRICE_ILS_PATTERN);

        // 2) PDP
        await categoryPage.selectProductByName(atidBlueShoesName);
        const pdpPriceText = await productDetailsPage.getProductCurrentPriceText();
        expect(normalize(pdpPriceText)).toMatch(PRICE_ILS_PATTERN);

        // 3) Header total price
        await productDetailsPage.addToCart();
        const headerTotalText = await headerFooterPage.getTotalItemsPriceInCart();
        expect(normalize(headerTotalText)).toMatch(PRICE_ILS_PATTERN);

        // 4) Cart page
        await productDetailsPage.viewCart();
        const cartUnitPriceText = await cartPage.getCartUnitPriceTextByName(atidBlueShoesName);
        expect(normalize(cartUnitPriceText)).toMatch(PRICE_ILS_PATTERN);
    });

    test('TC-058 Breadcrumbs reflect navigation ', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.men);
        await categoryPage.verifyBreadCrumbCategoryText(CATALOG.categories.men);
        await categoryPage.selectProductByName(PRODUCTS.blackHoodie.name);
        await productDetailsPage.verifyProductBreadCrumbText(PRODUCTS.blackHoodie.name);
        await productDetailsPage.goToCategoryByBreadCrumb();
        await categoryPage.verifyBreadCrumbCategoryText(CATALOG.categories.men);
        await categoryPage.goToHomePageByBreadCrumb();
        await expect(page).toHaveURL(SITE.baseUrl);
    })



})
