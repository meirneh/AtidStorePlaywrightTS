
import { test, expect } from "../utils/fixtures/baseTest";
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
    
        const openProduct = async (headerFooterPage: HeaderFooterPage,categoryPage: CategoryPage, productName: string) => {
            await openProductFromStore(()=> goToStoreTab(headerFooterPage), categoryPage, productName);
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
        

    test('TC-046 Applying a valid coupon updates totals', async ({headerFooterPage, categoryPage, productDetailsPage, cartPage}) => {
        await addProductToCartFromStoreAndOpenCart((pn: string)=>openProduct(headerFooterPage,categoryPage,pn), productDetailsPage,PRODUCTS.atidGreenShoes.name);
        await verifyTotalBeforeDiscount(cartPage);
        await applyValidCouponAndVerifyTotals(cartPage);
    })

    test('TC-047 Invalid/expired coupon shows error ', async ({headerFooterPage, categoryPage, productDetailsPage, cartPage}) => {
        await addProductToCartFromStoreAndOpenCart((pn: string)=>openProduct(headerFooterPage,categoryPage,pn), productDetailsPage, PRODUCTS.atidGreenShoes.name);
        await verifyTotalBeforeDiscount(cartPage);
        await applyInvalidCouponAndVerifyNoDiscount(cartPage);
    })

    test('TC-048 Removing coupon restores totals', async ({headerFooterPage, categoryPage, productDetailsPage, cartPage}) => {
        await addProductToCartFromStoreAndOpenCart((pn: string)=>openProduct(headerFooterPage,categoryPage,pn), productDetailsPage, PRODUCTS.atidGreenShoes.name);
        await verifyTotalBeforeDiscount(cartPage);
        await applyValidCouponAndVerifyTotals(cartPage);
        await removeCouponAndVerifyTotalsRestored(cartPage);
    })

})

