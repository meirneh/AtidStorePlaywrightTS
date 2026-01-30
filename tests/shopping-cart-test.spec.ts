import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";

import { SITE } from "../utils/test-data/site";
import { NAV } from "../utils/test-data/navigation";
import { PRODUCTS } from "../utils/test-data/products";
import { CART } from "../utils/test-data/cart";
import { goToStore } from '../utils/helpers/navigation';
import { openCartFromPdp } from "../utils/helpers/pdp";
import { openProductFromStore } from "../utils/helpers/store";
import { reloadDom } from "../utils/helpers/page";
import { verifyHeaderCartBadgeAndTotal } from "../utils/helpers/header";
import { addProductToCartFromStore } from "../utils/helpers/cart-actions";


let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage
let productDetailsPage: ProductDetailsPage;
let cartPage: CartPage;

test.describe('Shopping Cart Functional Behavior and Validations', () => {

    const goToStoreTab = async () => {
        await goToStore(headerFooterPage, NAV.tabs.store)
    };

    const openProduct = async (productName: string) => {
        await openProductFromStore(goToStoreTab, categoryPage, productName)
    };


    const addProductsToCartFromStore = async (productNames: string[]) => {
        for (const name of productNames) {
            await addProductToCartFromStore(openProduct, productDetailsPage, name)
        }
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

    });

    test.afterAll(async () => {
        await context?.close();
        await page?.close();
    })

    test('TC-025 Cart page shows lines with unit price, qty, line total ', async () => {
        await addProductsToCartFromStore([
            PRODUCTS.atidYellowShoes.name,
            PRODUCTS.blackHoodie.name,
        ])
        await openCartFromPdp(productDetailsPage)
        await cartPage.verifyCartLines([...CART.lines.yellowPlusHoodieQtyOne]);
    })

    test('TC-026 Update quantity recalculates totals', async () => {
        await addProductToCartFromStore(openProduct, productDetailsPage, PRODUCTS.atidYellowShoes.name);
        await openCartFromPdp(productDetailsPage);
        await cartPage.verifyCartLines([...CART.lines.yellowQtyOne]);
        await cartPage.setAndUpdateQty(PRODUCTS.atidYellowShoes.name, CART.quantities.two);
        await cartPage.verifyCartLines([...CART.lines.yellowQtyTwo]);
    })

    test('TC-027 Remove item updates subtotal and CartBadge ', async () => {
        await addProductsToCartFromStore([
            PRODUCTS.atidYellowShoes.name,
            PRODUCTS.blackHoodie.name,
        ]);
        await openCartFromPdp(productDetailsPage);
        await cartPage.verifyCartLines([...CART.lines.yellowPlusHoodieQtyOne]);
        await verifyHeaderCartBadgeAndTotal(
            headerFooterPage,
            Number(CART.header.twoItemsYellowPlusHoodie.badgeCount),
            CART.header.twoItemsYellowPlusHoodie.headerAmount
        )
        await cartPage.removeProductByName(PRODUCTS.atidYellowShoes.name);
        await cartPage.verifyCartLines([...CART.lines.hoodieQtyOne]);
        await reloadDom(page);
        await verifyHeaderCartBadgeAndTotal(headerFooterPage,
            Number(CART.header.afterRemoveYellowFromYellowPlusHoodie.badgeCount),
            CART.header.afterRemoveYellowFromYellowPlusHoodie.headerAmount
        )
    })

    test('TC-028 Negative removing all shows empty cart state ', async () => {
        test.setTimeout(60_000);
        await addProductsToCartFromStore([PRODUCTS.atidYellowShoes.name, PRODUCTS.blackHoodie.name]);
        await openCartFromPdp(productDetailsPage);
        await cartPage.verifyCartLines([...CART.lines.yellowPlusHoodieQtyOne]);
        await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.header.twoItemsYellowPlusHoodie.badgeCount), CART.header.twoItemsYellowPlusHoodie.headerAmount);
        await cartPage.removeProductByName([PRODUCTS.atidYellowShoes.name, PRODUCTS.blackHoodie.name]);
        await cartPage.verifyEmptyCartMessageText();
        await cartPage.verifyNoCartItems();
        await reloadDom(page);
        await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.empty.badgeCount), CART.empty.headerAmount);
    })

    test('TC-029 Negative invalid qty input handled ', async () => {
        await addProductToCartFromStore(openProduct, productDetailsPage, PRODUCTS.atidYellowShoes.name);
        await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.header.singleYellow.badgeCount), CART.header.singleYellow.headerAmount);
        await openCartFromPdp(productDetailsPage);
        await cartPage.setAndTryUpdateInvalidQty(PRODUCTS.atidYellowShoes.name, CART.quantities.invalidNegative);
        await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.header.singleYellow.badgeCount), CART.header.singleYellow.headerAmount);
    })

    test('TC-030 Header amount and cart subtotal match', async () => {
        await addProductToCartFromStore(openProduct, productDetailsPage, PRODUCTS.atidYellowShoes.name);
        await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.header.singleYellow.badgeCount), CART.header.singleYellow.headerAmount);
        await openCartFromPdp(productDetailsPage);
        await cartPage.setAndUpdateQty(PRODUCTS.atidYellowShoes.name, CART.quantities.two);
        await reloadDom(page);
        await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.header.yellowQtyTwo.badgeCount), CART.header.yellowQtyTwo.headerAmount);
    })

    test('TC-031 Navigating back to PDP preserves cart ', async () => {
        await addProductToCartFromStore(openProduct, productDetailsPage, PRODUCTS.atidYellowShoes.name);
        await openCartFromPdp(productDetailsPage);
        await cartPage.verifyCartLines([...CART.lines.yellowQtyOne]);
        await cartPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await headerFooterPage.clickCart();
        await cartPage.verifyCartLines([...CART.lines.yellowQtyOne]);
    })

})
