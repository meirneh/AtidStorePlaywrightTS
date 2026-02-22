
import { test, expect } from "../utils/fixtures/baseTest";
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
import type HeaderFooterPage from "../pages/HeaderFooterPage";
import type CategoryPage from "../pages/CategoryPage";

import { SITE } from "../utils/test-data/site";
import { NAV } from "../utils/test-data/navigation";
import { PRODUCTS } from "../utils/test-data/products";
import { CATALOG } from '../utils/test-data/catalog';
import { FORMATS } from '../utils/test-data/formats';
import { CROSS_CHECKS_CONSISTENCY } from "../utils/test-data/cross-checks-consistency";
import { CART } from "../utils/test-data/cart";

import { goToStore } from "../utils/helpers/navigation";
import { openCartFromPdp } from '../utils/helpers/pdp';
import { openProductFromStore } from "../utils/helpers/store";
import { addProductToCartFromStore } from "../utils/helpers/cart-actions";
import { reloadDom } from "../utils/helpers/page";

test.describe('Cross-Checks & Consistency — Price and totals consistency across Listing, PDP, Cart, and Checkout', () => {
    const atidBlueShoesName = PRODUCTS.atidBlueShoes.name;

    const normalizeText = (s: string): string =>
        s
            .replace(/\u00A0/g, " ")
            .replace(/[\u200E\u200F]/g, "")
            .replace(/\s+/g, " ")
            .trim();

    const goToStoreTab = async (headerFooterPage: HeaderFooterPage) => {
        await goToStore(headerFooterPage, NAV.tabs.store);
    };

    const openProduct = async (headerFooterPage: HeaderFooterPage, categoryPage: CategoryPage, productName: string) => {
        await openProductFromStore(() => goToStoreTab(headerFooterPage), categoryPage, productName);
    };

    test.beforeEach(async ({ goHome }) => {
        await goHome();
    })

    test('TC-053 [Normal] Listing price equals PDP price', async ({ page, headerFooterPage, categoryPage }) => {
        allure.epic('Cross-checks');
        allure.feature('Price-consistency');
        allure.story('Listing price equals PDP price');
        allure.severity(Severity.NORMAL);

        let listingPriceText = '';
        let pdpSalePriceText = '';
        let pdpRegularPriceText = '';
        let pdpFallbackPriceText = '';
        await test.step('Open Store listing', async () => {
            await goToStoreTab(headerFooterPage);
        });

        await test.step('Capture listing price', async () => {
            listingPriceText = await categoryPage.getProductPriceByName(atidBlueShoesName);
        });

        await test.step('Open PDP from listing ', async () => {
            await categoryPage.selectProductByName(atidBlueShoesName);
        });

        await test.step('Capture PDP price', async () => {
            pdpSalePriceText =
                (await page.locator("p.price ins .woocommerce-Price-amount").first().textContent()) ?? "";

            pdpRegularPriceText =
                (await page.locator("p.price del .woocommerce-Price-amount").first().textContent()) ?? "";

            pdpFallbackPriceText =
                (await page.locator("p.price .woocommerce-Price-amount").first().textContent()) ?? "";
        });

    });


    test('TC-054 [Normal] PDP/Cart unit price consistency', async ({ headerFooterPage, categoryPage, productDetailsPage }) => {
        allure.epic('Cross-checks');
        allure.feature('Price consistency');
        allure.story('PDP vs Cart unit price');
        allure.severity(Severity.NORMAL);
        let pdpPriceText = '';
        await test.step('Open PDP from listing', async () => {
            await openProduct(headerFooterPage, categoryPage, PRODUCTS.atidBlueShoes.name);
        });

        await test.step('Capture PDP price', async () => {
            pdpPriceText = await productDetailsPage.getProductCurrentPriceText();
        })

        await test.step('Add product to cart', async () => {
            await productDetailsPage.addToCart();
        });

        await test.step('Open cart from PDP', async () => {
            await openCartFromPdp(productDetailsPage);
        });
    });

    test("TC-055 [Minor] Rounding of totals is consistent", async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        allure.epic('Cross-checks');
        allure.feature('Totals consistency');
        allure.story('Rounding of totals');
        allure.severity(Severity.NORMAL);
        await test.step('Add Blue Shoes to cart', async () => {
            await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidBlueShoes.name);
        });

        await test.step('Open Cart', async () => {
            await openCartFromPdp(productDetailsPage);
        });

        await test.step('Add Black Hoodie  to cart', async () => {
            await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.blackHoodie.name);
        });

        await test.step('Open Cart again', async () => {
            await openCartFromPdp(productDetailsPage);
        });

        await test.step('Verify subtotal after adding items', async () => {
            await cartPage.verifyCartTotalsSubtotalText(
                CROSS_CHECKS_CONSISTENCY.expectedSubtotals.blueShoesPlusHoodie
            );
        })
        await test.step('Remove Black Hoodie anverify subtotal', async () => {
            await cartPage.removeProductByName(PRODUCTS.blackHoodie.name);
            await cartPage.verifyCartTotalsSubtotalText(
                CROSS_CHECKS_CONSISTENCY.expectedSubtotals.afterRemoveHoodie
            );
        });

        await test.step('Update Blue Shoes quantity to 2 and verify subtotal', async () => {
            await cartPage.setAndUpdateQty(PRODUCTS.atidBlueShoes.name, CART.quantities.two);
            await cartPage.verifyCartTotalsSubtotalText(
                CROSS_CHECKS_CONSISTENCY.expectedSubtotals.afterUpdateBlueShoesQty2
            );
        })
    });

    test('TC-056 [Normal] Header CartBadge matches sum of quantities ', async ({ page, headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        allure.epic('Cross-checks');
        allure.feature('Cart consistency');
        allure.story('Header CartBadge matches total quantity');
        allure.severity(Severity.NORMAL);
        let totalQtyInCartPage = 0;
        let badgeQty = 0
        await test.step('Add two products to cart', async () => {
            await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidBlueShoes.name);
            await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.blackHoodie.name);
        });

        await test.step('Open cart', async () => {
            await openCartFromPdp(productDetailsPage);
        });

        await test.step('Update quantity and verify cart lines', async () => {
            await cartPage.setAndUpdateQty(PRODUCTS.atidBlueShoes.name, CART.quantities.two);
            await reloadDom(page);
            await cartPage.verifyQuantities([
                { term: PRODUCTS.blackHoodie.name, expectedQty: CART.quantities.one },
                { term: PRODUCTS.atidBlueShoes.name, expectedQty: CART.quantities.two },
            ]);
        });

        await test.step('Compare header badge quantity vs cart total quantity', async () => {
            totalQtyInCartPage = await cartPage.getTotalQuantityInCart();
            badgeQty = await headerFooterPage.getQuantityItemsInCartCount();
            expect(badgeQty).toBe(totalQtyInCartPage);
        });
    });

    test('TC-057 [minor] Currency symbol is consistent across pages', async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
        allure.epic('Cross- checks');
        allure.feature('Currency consistency');
        allure.story('Currency simbol is consistent across pages');
        const PRICE_ILS_PATTERN = FORMATS.priceIlsPattern;
        await test.step('Open Store Listing', async () => {
            await goToStoreTab(headerFooterPage);
        });

        // 1) Store/listing (cards)
        await test.step('Verify listing price currency format', async () => {
            const listingPriceText = await categoryPage.getProductPriceByName(atidBlueShoesName);
            expect(normalizeText(listingPriceText)).toMatch(PRICE_ILS_PATTERN);
        });
        // 2) PDP
        await test.step('Open PDP and verify currency format', async () => {
            await categoryPage.selectProductByName(atidBlueShoesName);
            const pdpPriceText = await productDetailsPage.getProductCurrentPriceText();
            expect(normalizeText(pdpPriceText)).toMatch(PRICE_ILS_PATTERN);
        });

        // 3) Header total price
        await test.step('Add to cart and verify header total currency format', async () => {
            await productDetailsPage.addToCart();
            const headerTotalText = await headerFooterPage.getTotalItemsPriceInCart();
            expect(normalizeText(headerTotalText)).toMatch(PRICE_ILS_PATTERN);
        });
        // 4) Cart page
        await test.step('Open cart and verify unit price currency format', async () => {

            await openCartFromPdp(productDetailsPage);
            const cartUnitPriceText = await cartPage.getCartUnitPriceTextByName(atidBlueShoesName);
            expect(normalizeText(cartUnitPriceText)).toMatch(PRICE_ILS_PATTERN);
        });

    });

    test('TC-058 [Minor] Breadcrumbs reflect navigation ', async ({ page, headerFooterPage, categoryPage, productDetailsPage }) => {
        allure.epic('Cross-checks');
        allure.feature('Navigation consistency');
        allure.story('Breadcrumbs reflect navigation');
        allure.severity(Severity.MINOR);
        await test.step('Navigate to Men category', async () => {
            await headerFooterPage.navigateToTab(NAV.tabs.men);
        });

        await test.step('Verify category breadcrumb', async () => {
            await categoryPage.verifyBreadCrumbCategoryText(CATALOG.categories.men);
        });

        await test.step('Open product and verify breadcrumb', async () => {
            await categoryPage.selectProductByName(PRODUCTS.blackHoodie.name);
            await productDetailsPage.verifyProductBreadCrumbText(PRODUCTS.blackHoodie.name);
        });

        await test.step('Navigate back to category via breadcrumb', async () => {
            await productDetailsPage.goToCategoryByBreadCrumb();
            await categoryPage.verifyBreadCrumbCategoryText(CATALOG.categories.men);
        });

        await test.step('Navigate to Home via breadcrumb and verify URL', async () => {
            await categoryPage.goToHomePageByBreadCrumb();
            await expect(page).toHaveURL(SITE.baseUrl);
        });
    });
})
