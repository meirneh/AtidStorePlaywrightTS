import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";

import { SITE } from "../utils/test-data/site";
import { NAV } from "../utils/test-data/navigation";
import { PRODUCTS } from "../utils/test-data/products";
import { CART } from "../utils/test-data/cart";


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

    test('TC-025 Cart page shows lines with unit price, qty, line total ', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.addToCart();
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.blackHoodie.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([...CART.lines.yellowPlusHoodieQtyOne]);
    })

    test('TC-026 Update quantity recalculates totals', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([...CART.lines.yellowQtyOne]);
        await cartPage.setAndUpdateQty(PRODUCTS.atidYellowShoes.name, CART.quantities.two);
        await cartPage.verifyCartLines([...CART.lines.yellowQtyTwo]);
    })

    test('TC-027 Remove item updates subtotal and CartBadge ', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.addToCart();
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.blackHoodie.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([...CART.lines.yellowPlusHoodieQtyOne]);
        await headerFooterPage.verifyQuantityItemsInCart(CART.header.twoItemsYellowPlusHoodie.badgeCount)
        await headerFooterPage.verifyTotalItemsInCart(CART.header.twoItemsYellowPlusHoodie.headerAmount);
        await cartPage.removeProductByName(PRODUCTS.atidYellowShoes.name);
        await cartPage.verifyCartLines([...CART.lines.hoodieQtyOne]);
        await page.reload({ waitUntil: "domcontentloaded" });
        await headerFooterPage.verifyQuantityItemsInCart(CART.header.afterRemoveYellowFromYellowPlusHoodie.badgeCount);
        await headerFooterPage.verifyTotalItemsInCart(CART.header.afterRemoveYellowFromYellowPlusHoodie.headerAmount);
    })

    test('TC-028 Negative removing all shows empty cart state ', async () => {
        test.setTimeout(60_000);
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.addToCart();
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.blackHoodie.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([...CART.lines.yellowPlusHoodieQtyOne]);
        await headerFooterPage.verifyQuantityItemsInCart(CART.header.twoItemsYellowPlusHoodie.badgeCount);
        await headerFooterPage.verifyTotalItemsInCart(CART.header.twoItemsYellowPlusHoodie.headerAmount);
        await cartPage.removeProductByName([PRODUCTS.atidYellowShoes.name, PRODUCTS.blackHoodie.name]);
        await cartPage.verifyEmptyCartMessageText();
        await cartPage.verifyNoCartItems();
        await page.reload({ waitUntil: "domcontentloaded" });
        await headerFooterPage.verifyQuantityItemsInCart(CART.empty.badgeCount);
        await headerFooterPage.verifyTotalItemsInCart(CART.empty.headerAmount);
    })

    test('TC-029 Negative invalid qty input handled ', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.addToCart();
        await headerFooterPage.verifyQuantityItemsInCart(CART.header.singleYellow.badgeCount);
        await headerFooterPage.verifyTotalItemsInCart(CART.header.singleYellow.headerAmount);
        await productDetailsPage.viewCart();
        await cartPage.setAndTryUpdateInvalidQty(PRODUCTS.atidYellowShoes.name, CART.quantities.invalidNegative);
        await headerFooterPage.verifyQuantityItemsInCart(CART.header.singleYellow.badgeCount);
        await headerFooterPage.verifyTotalItemsInCart(CART.header.singleYellow.headerAmount)
    })

    test('TC-030 Header amount and cart subtotal match', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.addToCart();
        await headerFooterPage.verifyQuantityItemsInCart(CART.header.singleYellow.badgeCount);
        await headerFooterPage.verifyTotalItemsInCart(CART.header.singleYellow.headerAmount);
        await productDetailsPage.viewCart();
        await cartPage.setAndUpdateQty(PRODUCTS.atidYellowShoes.name, CART.quantities.two);
        await page.reload({ waitUntil: "domcontentloaded" });
        await headerFooterPage.verifyQuantityItemsInCart(CART.header.yellowQtyTwo.badgeCount);
        await headerFooterPage.verifyTotalItemsInCart(CART.header.yellowQtyTwo.headerAmount);
    })

    test('TC-031 Navigating back to PDP preserves cart ', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart()
        await cartPage.verifyCartLines([...CART.lines.yellowQtyOne]);
        await cartPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await headerFooterPage.clickCart();
        await cartPage.verifyCartLines([...CART.lines.yellowQtyOne]);
    })








})
