
import { test, expect } from "../utils/fixtures/baseTest";
import type HeaderFooterPage from "../pages/HeaderFooterPage";
import type CategoryPage from "../pages/CategoryPage";

import { CART } from "../utils/test-data/cart";
import { NAV } from "../utils/test-data/navigation";
import { PDP } from "../utils/test-data/product-details-page";
import { PRODUCTS } from "../utils/test-data/products";
import { goToStore } from "../utils/helpers/navigation";
import { openProductFromStore } from "../utils/helpers/store";
import { verifyHeaderCartBadgeAndTotal } from "../utils/helpers/header";

test.describe('Product Details Page Info and Cart Behavior', () => {
    const verifyEmptyHeaderCart = async (headerFooterPage: HeaderFooterPage) => {
        await headerFooterPage.verifyQuantityItemsInCart(String(CART.quantities.zero));
        await headerFooterPage.verifyTotalItemsInCart(CART.empty.headerAmount);
    };

    const goToStoreTab = async (headerFooterPage: HeaderFooterPage) => {
        await goToStore(headerFooterPage, NAV.tabs.store);
    };

    const openProduct = async (headerFooterPage: HeaderFooterPage, categoryPage: CategoryPage, productName: string) => {
        await openProductFromStore(() => goToStoreTab(headerFooterPage), categoryPage, productName);
    };

    test.beforeEach(async ({ goHome }) => {
        await goHome();
    })


    test('018 Product Details (PDP)', async ({ categoryPage, productDetailsPage }) => {
        await categoryPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.verifyProductDetailsInfo(PRODUCTS.atidYellowShoes.name, PRODUCTS.atidYellowShoes.price);
        await productDetailsPage.verifyAddToCartButtonEnableAndVisible();
    })

    test('TC-019 Add to cart updates CartBadge and header amount', async ({ headerFooterPage, categoryPage, productDetailsPage }) => {
        await verifyEmptyHeaderCart(headerFooterPage);
        await openProduct(headerFooterPage, categoryPage, PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.addToCart();
        await verifyHeaderCartBadgeAndTotal(headerFooterPage, (CART.quantities.one), PDP.cart.totals.oneItem);
        await headerFooterPage.verifyTotalItemsInCart(PDP.cart.totals.oneItem);
        await productDetailsPage.verifyNoticeMessageText(PRODUCTS.atidYellowShoes.name);
        await headerFooterPage.showItemsInCart();
    });

    test('TC-020 Re-adding same product increments quantity', async ({ headerFooterPage, categoryPage, productDetailsPage }) => {
        await verifyEmptyHeaderCart(headerFooterPage);
        await openProduct(headerFooterPage, categoryPage, PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.incrementQuantity(CART.quantities.one);
        await productDetailsPage.addToCart();
        await verifyHeaderCartBadgeAndTotal(headerFooterPage, (CART.quantities.two), PDP.cart.totals.twoItems);
    });

    test('TC-021 Quantity control affects add amount', async ({ headerFooterPage, categoryPage, productDetailsPage }) => {
        await verifyEmptyHeaderCart(headerFooterPage);
        await openProduct(headerFooterPage, categoryPage, PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.incrementQuantity(CART.quantities.two);
        await productDetailsPage.addToCart();
        await verifyHeaderCartBadgeAndTotal(headerFooterPage, (CART.quantities.three), PDP.cart.totals.threeItems);
    });

    test('TC-022 Negative invalid qty blocked ', async ({ headerFooterPage, categoryPage, productDetailsPage }) => {
        await openProduct(headerFooterPage, categoryPage, PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.decrementQuantity(CART.quantities.one);
        await productDetailsPage.verifyQuantityText(String(CART.quantities.one));
    })

    test('TC-023 Price format consistency ', async ({ headerFooterPage, categoryPage, productDetailsPage }) => {
        await openProduct(headerFooterPage, categoryPage, PRODUCTS.atidYellowShoes.name);
        await productDetailsPage.verifyPriceFormat(PDP.currency.symbol);
    })

})
