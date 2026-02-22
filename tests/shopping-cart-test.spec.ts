
import { test, expect } from "../utils/fixtures/baseTest";
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
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


    test("TC-025 [Critical] Cart page shows lines with unit price, qty, line total ", async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        allure.epic('Cart');
        allure.feature('Shopping Cart');
        allure.story('Cart lines show unit price, quantity, and line total');
        allure.severity(Severity.CRITICAL);
        await test.step('Add two products to cart from Store', async () => {
            await addProductsToCartFromStore(headerFooterPage, categoryPage, productDetailsPage, [
                PRODUCTS.atidYellowShoes.name,
                PRODUCTS.blackHoodie.name,
            ]);
        });

        await test.step('Open cart', async () => {
            await openCartFromPdp(productDetailsPage);
        });

        await test.step('Verify cart lines display correct values', async () => {
            await cartPage.verifyCartLines([...CART.lines.yellowPlusHoodieQtyOne]);
        });
    });

    test('TC-026 [Critical] Update quantity recalculates totals', async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        allure.epic('Cart');
        allure.feature('Shopping Cart');
        allure.story('Updating quantity recalculates totals');
        allure.severity(Severity.CRITICAL);

        await test.step('Add product to cart from Store', async () => {
            await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidYellowShoes.name);
        });

        await test.step('Open cart', async () => {
            await openCartFromPdp(productDetailsPage);
        });

        await test.step('Verify initial cart line (qty=1)', async () => {
            await cartPage.verifyCartLines([...CART.lines.yellowQtyOne]);
        });

        await test.step('Update quantity to 2', async () => {
            await cartPage.setAndUpdateQty(PRODUCTS.atidYellowShoes.name, CART.quantities.two);
        });

        await test.step('Verify updated cart line (qty=2)', async () => {
            await cartPage.verifyCartLines([...CART.lines.yellowQtyTwo]);
        });
    });

    test('TC-027 [Critical] Remove item updates subtotal and CartBadge ', async ({ page, headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        allure.epic('Cart');
        allure.feature('Shopping Cart');
        allure.story('Removing item updates totals and cart badge');
        allure.severity(Severity.CRITICAL);

        await test.step('Add two products to cart from Store', async () => {
            await addProductsToCartFromStore(headerFooterPage, categoryPage, productDetailsPage, [
                PRODUCTS.atidYellowShoes.name,
                PRODUCTS.blackHoodie.name,
            ]);
        });

        await test.step('Open cart', async () => {
            await openCartFromPdp(productDetailsPage);
        });

        await test.step('Verify initial cart lines', async () => {
            await cartPage.verifyCartLines([...CART.lines.yellowPlusHoodieQtyOne]);
        });

        await test.step('Verify header cart badge and total (initial)', async () => {
            await verifyHeaderCartBadgeAndTotal(
                headerFooterPage,
                Number(CART.header.twoItemsYellowPlusHoodie.badgeCount),
                CART.header.twoItemsYellowPlusHoodie.headerAmount
            )
        });

        await test.step('Remove one product', async () => {
            await cartPage.removeProductByName(PRODUCTS.atidYellowShoes.name);
        });

        await test.step('Verify remaining cart lines', async () => {
            await cartPage.verifyCartLines([...CART.lines.hoodieQtyOne]);
        });

        await test.step('Refresh page', async () => {
            await reloadDom(page);
        });

        await test.step('Verify header cart badge and total (after removal)', async () => {
            await verifyHeaderCartBadgeAndTotal(headerFooterPage,
                Number(CART.header.afterRemoveYellowFromYellowPlusHoodie.badgeCount),
                CART.header.afterRemoveYellowFromYellowPlusHoodie.headerAmount
            );
        });
    })

    test('TC-028 [Normal] Negative removing all shows empty cart state ', async ({ page, headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        allure.epic('Cart');
        allure.feature('Shopping Cart');
        allure.story('Negative removing all shows empty cart state');
        allure.severity(Severity.NORMAL);

        test.setTimeout(60_000);
        await test.step('Add two products to cart from Store', async () => {
            await addProductsToCartFromStore(headerFooterPage, categoryPage, productDetailsPage, [PRODUCTS.atidYellowShoes.name, PRODUCTS.blackHoodie.name]);
        });

        await test.step('Open cart', async () => {
            await openCartFromPdp(productDetailsPage);
        });

        await test.step('Verify header cart badge and total (initial)', async () => {
            await cartPage.verifyCartLines([...CART.lines.yellowPlusHoodieQtyOne]);
            await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.header.twoItemsYellowPlusHoodie.badgeCount), CART.header.twoItemsYellowPlusHoodie.headerAmount);
        });

        await test.step('Remove all products', async () => {
            await cartPage.removeProductByName([PRODUCTS.atidYellowShoes.name, PRODUCTS.blackHoodie.name]);
        });

        await test.step('Verify empty cart state', async () => {
            await cartPage.verifyEmptyCartMessageText();
            await cartPage.verifyNoCartItems();
        });

        await test.step('Refesh page', async () => {
            await reloadDom(page);
        });

        await test.step('Verify header cart badge and total reset', async () => {
            await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.empty.badgeCount), CART.empty.headerAmount);
        });
    });

    test('TC-029 [Normal] Negative invalid qty input handled ', async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        allure.epic('Cart');
        allure.feature('Shopping Cart');
        allure.story('Negative invalid quantity input handled');
        allure.severity(Severity.NORMAL);

        await test.step('Add poduct to cart from Store', async () => {
            await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidYellowShoes.name);
        });

        await test.step('Verify header cart badge and total (initial)', async () => {
            await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.header.singleYellow.badgeCount), CART.header.singleYellow.headerAmount);
        });

        await test.step('Open cart', async () => {
            await openCartFromPdp(productDetailsPage);
        });

        await test.step('Try updating invalid quantity', async () => {
            await cartPage.setAndTryUpdateInvalidQty(PRODUCTS.atidYellowShoes.name, CART.quantities.invalidNegative);
        });

        await test.step('', async () => {
            await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.header.singleYellow.badgeCount), CART.header.singleYellow.headerAmount);
        });
    });

    test('TC-030 [Normal] Header amount and cart subtotal match', async ({ page, headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        allure.epic('Cart');
        allure.feature('Totals consistency');
        allure.story('Header amount matches cart subtotal');
        allure.severity(Severity.NORMAL);

        await test.step('Add product to cart from Store', async () => {
            await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidYellowShoes.name);
        });

        await test.step('Verify header cart badge and total (initial)', async () => {
            await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.header.singleYellow.badgeCount), CART.header.singleYellow.headerAmount);
        });

        await test.step('Open cart', async () => {
            await openCartFromPdp(productDetailsPage);
        });

        await test.step('Update quantity to 2', async () => {
            await cartPage.setAndUpdateQty(PRODUCTS.atidYellowShoes.name, CART.quantities.two);
        });

        await test.step('Refresh page', async () => {
            await reloadDom(page);
        });

        await test.step('Verify header cart badge and total (after update)', async () => {
            await verifyHeaderCartBadgeAndTotal(headerFooterPage, Number(CART.header.yellowQtyTwo.badgeCount), CART.header.yellowQtyTwo.headerAmount);
        });
    });

    test('TC-031 [Minor] Navigating back to PDP preserves cart ', async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        allure.epic('Cart');
        allure.feature('Navigation consistency');
        allure.story('Navigating back to PDP preserves cart');
        allure.severity(Severity.MINOR);

        await test.step('Add product to cart from Store', async () => {
            await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidYellowShoes.name);
        });

        await test.step('Open cart', async () => {
            await openCartFromPdp(productDetailsPage);
        });

        await test.step('Verify cart line is present', async () => {
            await cartPage.verifyCartLines([...CART.lines.yellowQtyOne]);
        });

        await test.step('Open product PDP from cart', async () => {
            await cartPage.selectProductByName(PRODUCTS.atidYellowShoes.name);
        });

        await test.step('Return to cart from header', async () => {
            await headerFooterPage.clickCart();
        });

        await test.step('Verify cart line is preserved', async () => {
            await cartPage.verifyCartLines([...CART.lines.yellowQtyOne]);
        });
    });

})
