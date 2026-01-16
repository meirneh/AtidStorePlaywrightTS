import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";

import { SITE } from "../utils/test-data/site";
import { CART } from "../utils/test-data/cart";
import { NAV } from "../utils/test-data/navigation";
import { PDP } from "../utils/test-data/product-details-page";
import { PRODUCTS } from "../utils/test-data/products";

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage;
let productDetailsPage: ProductDetailsPage;

test.describe('Product Details Page Info and Cart Behavior', () => {
    test.beforeEach(async () => {
        browser = await chromium.launch({ channel: "chrome", slowMo: 500 });
        context = await browser.newContext();
        page = await context.newPage();
        await page.goto(SITE.baseUrl);
        headerFooterPage = new HeaderFooterPage(page);
        categoryPage = new CategoryPage(page);
        productDetailsPage = new ProductDetailsPage(page);
    });

    test.afterAll(async () => {
        await context?.close();
        await page?.close();
    })


    test('018 Product Details (PDP)', async () => {
        await categoryPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.verifyProductDetailsInfo(PRODUCTS.atidYellowShoes.name, PRODUCTS.atidYellowShoes.price);
        await productDetailsPage.verifyAddToCartButtonEnableAndVisible();
    })

    test('TC-019 Add to cart updates CartBadge and header amount', async () => {
        await headerFooterPage.verifyQuantityItemsInCart(String(CART.quantities.zero));
        await headerFooterPage.verifyTotalItemsInCart(CART.empty.headerAmount);
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.addToCart();
        await headerFooterPage.verifyQuantityItemsInCart(String(CART.quantities.one));
        await headerFooterPage.verifyTotalItemsInCart(PDP.cart.totals.oneItem);
        await productDetailsPage.verifyNoticeMessageText(PRODUCTS.atidYellowShoes.name);
        await headerFooterPage.showItemsInCart();
    });

    test('TC-020 Re-adding same product increments quantity', async () => {
        await headerFooterPage.verifyQuantityItemsInCart(String(CART.quantities.zero));
        await headerFooterPage.verifyTotalItemsInCart(CART.empty.headerAmount);
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.incrementQuantity(CART.quantities.one);
        await productDetailsPage.addToCart();
        await headerFooterPage.verifyQuantityItemsInCart(String(CART.quantities.two));
        await headerFooterPage.verifyTotalItemsInCart(PDP.cart.totals.twoItems);

    });

    test('TC-021 Quantity control affects add amount', async () => {
        await headerFooterPage.verifyQuantityItemsInCart(String(CART.quantities.zero));
        await headerFooterPage.verifyTotalItemsInCart(CART.empty.headerAmount);
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.incrementQuantity(CART.quantities.two);
        await productDetailsPage.addToCart();
        await headerFooterPage.verifyQuantityItemsInCart(String(CART.quantities.three));
        await headerFooterPage.verifyTotalItemsInCart(PDP.cart.totals.threeItems);
    });

    test('TC-022 Negative invalid qty blocked ', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.decrementQuantity(CART.quantities.one);
        await productDetailsPage.verifyQuantityText(String(CART.quantities.one));
    })

    test('TC-023 Price format consistency ', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.verifyPriceFormat(PDP.currency.symbol);
    })

})

