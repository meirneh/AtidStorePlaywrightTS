
import { test, expect } from "../utils/fixtures/baseTest";
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
import type HeaderFooterPage from "../pages/HeaderFooterPage";
import type CategoryPage from "../pages/CategoryPage";
import type CartPage from "../pages/CartPage";

import { NAV } from "../utils/test-data/navigation";
import { PRODUCTS } from "../utils/test-data/products";
import { COUPONS } from "../utils/test-data/coupons";
import { goToStore } from "../utils/helpers/navigation";
import { openProductFromStore } from "../utils/helpers/store";
import { addProductToCartFromStoreAndOpenCart } from "../utils/helpers/cart-actions";

test.describe('Promotions & Coupons Apply, Validate and Remove Discounts', () => {

    const goToStoreTab = async (headerFooterPage: HeaderFooterPage) => {
        await goToStore(headerFooterPage, NAV.tabs.store);
    };

    const openProduct = async (headerFooterPage: HeaderFooterPage, categoryPage: CategoryPage, productName: string) => {
        await openProductFromStore(() => goToStoreTab(headerFooterPage), categoryPage, productName);
    };



    const verifyTotalBeforeDiscount = async (cartPage: CartPage) => {
        await cartPage.verifyTotalValue(COUPONS.valid.expectedTotalBeforeDiscount);
    };

    const applyValidCouponAndVerifyTotals = async (cartPage: CartPage) => {
        await cartPage.applyCoupon(COUPONS.valid.code);
        await cartPage.verifyDiscountIsVisible();
        await cartPage.verifyTotalValue(COUPONS.valid.expectedTotalAfterDiscount);
    };

    const applyInvalidCouponAndVerifyNoDiscount = async (cartPage: CartPage) => {
        await cartPage.applyCoupon(COUPONS.invalid.code);
        await cartPage.verifyErrorMessageCoupnNotExist(COUPONS.invalid.code);
        await cartPage.verifyDiscountIsNotVisible();
        await cartPage.verifyTotalValue(COUPONS.valid.expectedTotalBeforeDiscount);
    };

    const removeCouponAndVerifyTotalsRestored = async (cartPage: CartPage) => {
        await cartPage.removeCoupon();
        await cartPage.verifyDiscountIsNotVisible();
        await cartPage.verifyTotalValue(COUPONS.valid.expectedTotalBeforeDiscount);
    };

    test.beforeEach(async ({ goHome }) => {
        await goHome();
    })


    test('TC-046 [Normal] Applying a valid coupon updates totals', async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        allure.epic('Cart');
        allure.feature('Promotions & coupons');
        allure.story('Valid coupon updates totals');
        allure.severity(Severity.NORMAL);

        await test.step('Add product to cart and open cart', async () => {
            await addProductToCartFromStoreAndOpenCart((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidGreenShoes.name);
        });

        await test.step('Verify total before discount', async () => {
            await verifyTotalBeforeDiscount(cartPage);
        });

        await test.step('Apply valid coupon and verify updated totals', async () => {
            await applyValidCouponAndVerifyTotals(cartPage);
        });

    });

    test('TC-047 [Minor] Invalid/expired coupon shows error ', async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        allure.epic('Cart');
        allure.feature('Promotions & coupons');
        allure.story('Invalid coupons shows error');
        allure.severity(Severity.MINOR);

        await test.step('Add product to cart and open cart', async () => {
            await addProductToCartFromStoreAndOpenCart((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidGreenShoes.name);
        });

        await test.step('Verify total before discount', async () => {
            await verifyTotalBeforeDiscount(cartPage);
        });

        await test.step('Apply invalid coupon and verify no discount', async () => {
            await applyInvalidCouponAndVerifyNoDiscount(cartPage);
        });


    });

    test('TC-048 [Minor] Removing coupon restores totals', async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        allure.epic('Cart');
        allure.feature('Promotions & coupons');
        allure.story('Removing coupon restores totals');
        allure.severity(Severity.MINOR);
        await test.step('Add product to cart and open cart', async () => {
            await addProductToCartFromStoreAndOpenCart((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidGreenShoes.name);
        });

        await test.step('Verify total before discount', async () => {
            await verifyTotalBeforeDiscount(cartPage);
        });

        await test.step('Apply valid coupon and verify totals are restored', async () => {
            await applyValidCouponAndVerifyTotals(cartPage);
        });

        await test.step('Remove coupon and verify totals are restored', async () => {
            await removeCouponAndVerifyTotalsRestored(cartPage);
        });
    });

})

