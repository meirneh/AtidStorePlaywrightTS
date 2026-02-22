
import { test, expect } from "../utils/fixtures/baseTest";
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
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


    test('TC-018 [Critical] Product Details (PDP)', async ({ categoryPage, productDetailsPage }) => {
        allure.epic('PDP');
        allure.feature('Product details');
        allure.story('PDP shows mandatory information');
        allure.severity(Severity.CRITICAL);

        await test.step('Open PDP from category', async () => {
            await categoryPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        });

        await test.step('Verify mandatory PDP information', async () => {
            await productDetailsPage.verifyProductDetailsInfo(PRODUCTS.atidYellowShoes.name, PRODUCTS.atidYellowShoes.price);
        });

        await test.step('Verify Add to Cart button is visible and enabled', async () => {
            await productDetailsPage.verifyAddToCartButtonEnableAndVisible();
        });
    })

    test('TC-019 [Critical] Add to cart updates CartBadge and header amount', async ({ headerFooterPage, categoryPage, productDetailsPage }) => {
        allure.epic('PDP');
        allure.feature('Add to cart');
        allure.story('Add to cart updates CartBadge and header amount');
        allure.severity(Severity.CRITICAL);
        await test.step('Verify header cart is empty', async () => {
            await verifyEmptyHeaderCart(headerFooterPage);
        });

        await test.step('Open PDP from Store', async () => {
            await openProduct(headerFooterPage, categoryPage, PRODUCTS.atidYellowShoes.name);
        });

        await test.step('Add product to cart', async () => {
            await productDetailsPage.addToCart();
        });

        await test.step('Verify header CartBadge and total amount', async () => {
            await verifyHeaderCartBadgeAndTotal(headerFooterPage, (CART.quantities.one), PDP.cart.totals.oneItem);
            await headerFooterPage.verifyTotalItemsInCart(PDP.cart.totals.oneItem);
        });

        await test.step('Verify add-to-cart notice message', async () => {
            await productDetailsPage.verifyNoticeMessageText(PRODUCTS.atidYellowShoes.name);
        });

        await test.step('Open header cart preview', async () => {
            await headerFooterPage.showItemsInCart();
        });

    });

    test('TC-020 [Critical] Re-adding same product increments quantity', async ({ headerFooterPage, categoryPage, productDetailsPage }) => {
        allure.epic('PDP');
        allure.feature('Add to cart');
        allure.story('Re-adding same product increments quantity');
        allure.severity(Severity.CRITICAL);

        await test.step('Verify header is empty', async () => {
            await verifyEmptyHeaderCart(headerFooterPage);
        });

        await test.step('Open PDP from Store', async () => {
            await openProduct(headerFooterPage, categoryPage, PRODUCTS.atidYellowShoes.name);
        });

        await test.step('Set quantity to 2', async () => {
            await productDetailsPage.incrementQuantity(CART.quantities.one);
        });

        await test.step('Add product to cart', async () => {
            await productDetailsPage.addToCart();
        });

        await test.step('Verify header CartBadge and total amount', async () => {
            await verifyHeaderCartBadgeAndTotal(headerFooterPage, (CART.quantities.two), PDP.cart.totals.twoItems);
        });
    });

    test('TC-021 [Critical] Quantity control affects add amount', async ({ headerFooterPage, categoryPage, productDetailsPage }) => {
        allure.epic('PDP');
        allure.feature('Quantity control');
        allure.story('Quantity control affects add amount');
        allure.severity(Severity.CRITICAL);

        await test.step('Verify header cart is empty', async () => {
            await verifyEmptyHeaderCart(headerFooterPage);
        });

        await test.step('Open PDP from Store', async () => {
            await openProduct(headerFooterPage, categoryPage, PRODUCTS.atidYellowShoes.name);
        });

        await test.step('Set quantity to 3', async () => {
            await productDetailsPage.incrementQuantity(CART.quantities.two);
        });

        await test.step('Add product to cart', async () => {
            await productDetailsPage.addToCart();
        });

        await test.step('Verify header CartBadge and total amount', async () => {
            await verifyHeaderCartBadgeAndTotal(headerFooterPage, (CART.quantities.three), PDP.cart.totals.threeItems);
        });
    });

    test('TC-022 [Normal] Negative invalid qty blocked ', async ({ headerFooterPage, categoryPage, productDetailsPage }) => {
        allure.epic('PDP');
        allure.feature('Quantity control');
        allure.story('Negative invalid quantity blocked');
        allure.severity(Severity.NORMAL);

        await test.step('Open PDP from Store', async () => {
            await openProduct(headerFooterPage, categoryPage, PRODUCTS.atidYellowShoes.name);
        });

        await test.step('Attempt to decrement quantity below 1', async () => {
            await productDetailsPage.decrementQuantity(CART.quantities.one);
        });

        await test.step('Verify quantity remains 1', async () => {
            await productDetailsPage.verifyQuantityText(String(CART.quantities.one));
        });
    });

    test('TC-023 [Minor] Price format consistency ', async ({ headerFooterPage, categoryPage, productDetailsPage }) => {
        allure.epic('PDP');
        allure.feature('Price display');
        allure.story('Price format consistency');
        allure.severity(Severity.MINOR);

        await test.step('Open PDP from Store', async () => {
            await openProduct(headerFooterPage, categoryPage, PRODUCTS.atidYellowShoes.name);
        });

        await test.step('Verify price format includes currency symbol', async () => {
            await productDetailsPage.verifyPriceFormat(PDP.currency.symbol);
        });

    });

})
