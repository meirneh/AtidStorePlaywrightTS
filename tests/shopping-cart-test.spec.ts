
import { test, expect } from "../utils/fixtures/baseTest";
import type HeaderFooterPage from "../pages/HeaderFooterPage";
import type CategoryPage from "../pages/CategoryPage";
import type ProductDetailsPage from "../pages/ProductDetailsPage";

import { NAV } from "../utils/test-data/navigation";
import { PRODUCTS } from "../utils/test-data/products";
import { CART } from "../utils/test-data/cart";
import { goToStore } from '../utils/helpers/navigation';
import { openCartFromPdp } from "../utils/helpers/pdp";
import { openProductFromStore } from "../utils/helpers/store";
import { reloadDom } from "../utils/helpers/page";
import { verifyHeaderCartBadgeAndTotal } from "../utils/helpers/header";
import { addProductToCartFromStore } from "../utils/helpers/cart-actions";

test.describe('Shopping Cart Functional Behavior and Validations', () => {

    const goToStoreTab = async (headerFooterPage: HeaderFooterPage) => {
        await goToStore(headerFooterPage, NAV.tabs.store)
    };

    const openProduct = async (headerFooterPage: HeaderFooterPage, categoryPage: CategoryPage, productName: string) => {
        await openProductFromStore(() => goToStoreTab(headerFooterPage), categoryPage, productName)
    };

    const addProductsToCartFromStore = async (headerFooterPage: HeaderFooterPage, categoryPage: CategoryPage, productDetailsPage: ProductDetailsPage, productNames: string[]) => {
        for (const name of productNames) {
            await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, name)
        }
    };

    test.beforeEach(async ({ goHome }) => {
        await goHome();
    })


    test(
        "TC-025 Cart page shows lines with unit price, qty, line total ",
        async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
            await addProductsToCartFromStore(headerFooterPage, categoryPage, productDetailsPage, [
                PRODUCTS.atidYellowShoes.name,
                PRODUCTS.blackHoodie.name,
            ]);
            await openCartFromPdp(productDetailsPage);
            await cartPage.verifyCartLines([...CART.lines.yellowPlusHoodieQtyOne]);
        }
    );

    test('TC-026 Update quantity recalculates totals', async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn ), productDetailsPage, PRODUCTS.atidYellowShoes.name);
        await openCartFromPdp(productDetailsPage);
        await cartPage.verifyCartLines([...CART.lines.yellowQtyOne]);
        await cartPage.setAndUpdateQty(PRODUCTS.atidYellowShoes.name, CART.quantities.two);
        await cartPage.verifyCartLines([...CART.lines.yellowQtyTwo]);
    })

    test('TC-027 Remove item updates subtotal and CartBadge ', async ({ page, headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        await addProductsToCartFromStore(headerFooterPage, categoryPage, productDetailsPage,[
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

    test('TC-028 Negative removing all shows empty cart state ', async ({ page, headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        test.setTimeout(60_000);
        await addProductsToCartFromStore(headerFooterPage, categoryPage, productDetailsPage,[PRODUCTS.atidYellowShoes.name, PRODUCTS.blackHoodie.name]);
        await openCartFromPdp(productDetailsPage);
        await cartPage.verifyCartLines([...CART.lines.yellowPlusHoodieQtyOne]);
        await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.header.twoItemsYellowPlusHoodie.badgeCount), CART.header.twoItemsYellowPlusHoodie.headerAmount);
        await cartPage.removeProductByName([PRODUCTS.atidYellowShoes.name, PRODUCTS.blackHoodie.name]);
        await cartPage.verifyEmptyCartMessageText();
        await cartPage.verifyNoCartItems();
        await reloadDom(page);
        await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.empty.badgeCount), CART.empty.headerAmount);
    })

    test('TC-029 Negative invalid qty input handled ', async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        await addProductToCartFromStore( (pn: string) =>openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidYellowShoes.name);
        await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.header.singleYellow.badgeCount), CART.header.singleYellow.headerAmount);
        await openCartFromPdp(productDetailsPage);
        await cartPage.setAndTryUpdateInvalidQty(PRODUCTS.atidYellowShoes.name, CART.quantities.invalidNegative);
        await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.header.singleYellow.badgeCount), CART.header.singleYellow.headerAmount);
    })

    test('TC-030 Header amount and cart subtotal match', async ({ page, headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        await addProductToCartFromStore((pn: string) =>openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidYellowShoes.name);
        await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.header.singleYellow.badgeCount), CART.header.singleYellow.headerAmount);
        await openCartFromPdp(productDetailsPage);
        await cartPage.setAndUpdateQty(PRODUCTS.atidYellowShoes.name, CART.quantities.two);
        await reloadDom(page);
        await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.header.yellowQtyTwo.badgeCount), CART.header.yellowQtyTwo.headerAmount);
    })

    test('TC-031 Navigating back to PDP preserves cart ', async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidYellowShoes.name);
        await openCartFromPdp(productDetailsPage);
        await cartPage.verifyCartLines([...CART.lines.yellowQtyOne]);
        await cartPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await headerFooterPage.clickCart();
        await cartPage.verifyCartLines([...CART.lines.yellowQtyOne]);
    })

})
