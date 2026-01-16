import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from '../pages/CartPage';

import { SITE } from "../utils/test-data/site";
import { NAV } from "../utils/test-data/navigation";
import { PRODUCTS } from "../utils/test-data/products";
import { CART } from "../utils/test-data/cart";

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

    test('TC-066 Subtotal equals sum of line totals ', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidGreenShoes.name);
        await productDetailsPage.addToCart();
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidGreenTshirt.name);
        await productDetailsPage.incrementQuantity(CART.quantities.two);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([...CART.lines.greenShoesQtyOnePlusGreenTshirtQtyThree])
        await cartPage.verifyCartTotalsSubtotal(CART.totals.greenShoesPlusGreenTshirt);
    })

    test('TC-067 Increasing and then decreasing qty keeps math correct', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidGreenShoes.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([...CART.lines.greenShoesQtyOne]);
        await cartPage.verifyCartTotalsSubtotal(CART.totals.greenShoesQtyOne);
        await cartPage.setAndUpdateQty(PRODUCTS.atidGreenShoes.name, CART.quantities.two);
        await cartPage.verifyCartLines([...CART.lines.greenShoesQtyTwo]);;
        await cartPage.verifyCartTotalsSubtotal(CART.totals.greenShoesQtyTwo);
        await cartPage.setAndUpdateQty(PRODUCTS.atidGreenShoes.name, CART.quantities.one);
        await cartPage.verifyCartLines([...CART.lines.greenShoesQtyOne]);
        await cartPage.verifyCartTotalsSubtotal(CART.totals.greenShoesQtyOne);
    })

    test('TC-068 Removing last item resets header amount and badge', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidGreenShoes.name);
        await productDetailsPage.addToCart();
        await productDetailsPage.viewCart();
        await cartPage.verifyCartLines([...CART.lines.greenShoesQtyOne]);
        await cartPage.verifyCartTotalsSubtotal(CART.totals.greenShoesQtyOne);
        await cartPage.removeProductByName(PRODUCTS.atidGreenShoes.name);
        await cartPage.verifyEmptyCartMessageText();
        await page.reload({ waitUntil: "domcontentloaded" });
        await headerFooterPage.verifyQuantityItemsInCart(CART.empty.badgeCount);
        await headerFooterPage.verifyTotalItemsInCart(CART.empty.headerAmount);
    })



})
