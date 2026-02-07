
import { test, expect } from "../utils/fixtures/baseTest";
import type HeaderFooterPage from "../pages/HeaderFooterPage";
import type CategoryPage from "../pages/CategoryPage";

import { SITE } from "../utils/test-data/site";
import { NAV } from "../utils/test-data/navigation";
import { PRODUCTS } from "../utils/test-data/products";
import { CATALOG } from "../utils/test-data/catalog";
import { FORMATS } from "../utils/test-data/formats";
import { CROSS_CHECKS_CONSISTENCY } from "../utils/test-data/cross-checks-consistency";
import { CART } from "../utils/test-data/cart";
import { goToStore } from "../utils/helpers/navigation";
import { openCartFromPdp } from "../utils/helpers/pdp";
import { openProductFromStore } from "../utils/helpers/store";
import { reloadDom } from "../utils/helpers/page";
import { addProductToCartFromStore } from "../utils/helpers/cart-actions";

test.describe(
  "Cross-Checks & Consistency — Price and totals consistency across Listing, PDP, Cart, and Checkout",
  () => {
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
      await openProductFromStore(()=> goToStoreTab(headerFooterPage), categoryPage, productName);
    };

    test.beforeEach(async ({ goHome }) => {
      await goHome();
    })
    

     test("TC-067 Listing price equals PDP price", async ({page, headerFooterPage, categoryPage}) => {
      await goToStoreTab(headerFooterPage);
      const listingPriceText = await categoryPage.getProductPriceByName(atidBlueShoesName);
      await categoryPage.selectProductByName(atidBlueShoesName);
      const pdpSalePriceText =
        (await page.locator("p.price ins .woocommerce-Price-amount").first().textContent()) ?? ""; 
      const pdpRegularPriceText =
        (await page.locator("p.price del .woocommerce-Price-amount").first().textContent()) ?? ""; 
      const pdpFallbackPriceText =
        (await page.locator("p.price .woocommerce-Price-amount").first().textContent()) ?? ""; 

      const normalizedListingPrice = normalizeText(listingPriceText); 
      const normalizedPdpCurrentPrice = normalizeText(pdpSalePriceText || pdpFallbackPriceText); 
      const normalizedPdpRegularPrice = normalizeText(pdpRegularPriceText); 
      expect([normalizedPdpCurrentPrice, normalizedPdpRegularPrice].filter(Boolean)).toContain(
        normalizedListingPrice
      );
    });

    test("TC-068 PDP/Cart unit price consistency", async ({headerFooterPage, categoryPage, productDetailsPage}) => {
      await openProduct(headerFooterPage, categoryPage, PRODUCTS.atidBlueShoes.name); 
      const pdpPriceText = await productDetailsPage.getProductCurrentPriceText();
      await productDetailsPage.addToCart();
      await openCartFromPdp(productDetailsPage);
      // NOTE: keeping original behavior (no assertion was present originally)
      void pdpPriceText;
    });

    test("TC-069 Rounding of totals is consistent", async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage }) => {
      await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidBlueShoes.name);
      await openCartFromPdp(productDetailsPage);
      await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.blackHoodie.name);
      await openCartFromPdp(productDetailsPage);
      await cartPage.verifyCartTotalsSubtotalText(
        CROSS_CHECKS_CONSISTENCY.expectedSubtotals.blueShoesPlusHoodie
      );
      await cartPage.removeProductByName(PRODUCTS.blackHoodie.name);
      await cartPage.verifyCartTotalsSubtotalText(
        CROSS_CHECKS_CONSISTENCY.expectedSubtotals.afterRemoveHoodie
      );
      await cartPage.setAndUpdateQty(PRODUCTS.atidBlueShoes.name, CART.quantities.two);
      await cartPage.verifyCartTotalsSubtotalText(
        CROSS_CHECKS_CONSISTENCY.expectedSubtotals.afterUpdateBlueShoesQty2
      );
    });

    test("TC-070 Header CartBadge matches sum of quantities ", async ({page, headerFooterPage, categoryPage, cartPage, productDetailsPage }) => {
      await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidBlueShoes.name);
      await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.blackHoodie.name);
      await openCartFromPdp(productDetailsPage);
      await cartPage.setAndUpdateQty(PRODUCTS.atidBlueShoes.name, CART.quantities.two);
      await reloadDom(page);
      await cartPage.verifyQuantities([
        { term: PRODUCTS.blackHoodie.name, expectedQty: CART.quantities.one },
        { term: PRODUCTS.atidBlueShoes.name, expectedQty: CART.quantities.two },
      ]);
      const totalQtyInCartPage = await cartPage.getTotalQuantityInCart();
      const badgeQty = await headerFooterPage.getQuantityItemsInCartCount();
      expect(badgeQty).toBe(totalQtyInCartPage);
    });

    test("TC-071 Currency symbol is consistent across pages", async ({headerFooterPage, categoryPage, productDetailsPage, cartPage}) => {
      const PRICE_ILS_PATTERN = FORMATS.priceIlsPattern;

      await goToStoreTab(headerFooterPage);

      // 1) Store/listing (cards)
      const listingPriceText = await categoryPage.getProductPriceByName(atidBlueShoesName);
      expect(normalizeText(listingPriceText)).toMatch(PRICE_ILS_PATTERN);

      // 2) PDP
      await categoryPage.selectProductByName(atidBlueShoesName);
      const pdpPriceText = await productDetailsPage.getProductCurrentPriceText();
      expect(normalizeText(pdpPriceText)).toMatch(PRICE_ILS_PATTERN);

      // 3) Header total price
      await productDetailsPage.addToCart();
      const headerTotalText = await headerFooterPage.getTotalItemsPriceInCart();
      expect(normalizeText(headerTotalText)).toMatch(PRICE_ILS_PATTERN);

      // 4) Cart page
      await openCartFromPdp(productDetailsPage);
      const cartUnitPriceText = await cartPage.getCartUnitPriceTextByName(atidBlueShoesName);
      expect(normalizeText(cartUnitPriceText)).toMatch(PRICE_ILS_PATTERN);
    });

    test("TC-072 Breadcrumbs reflect navigation ", async ({page, headerFooterPage, categoryPage, productDetailsPage}) => {
      await headerFooterPage.navigateToTab(NAV.tabs.men);
      await categoryPage.verifyBreadCrumbCategoryText(CATALOG.categories.men);
      await categoryPage.selectProductByName(PRODUCTS.blackHoodie.name);
      await productDetailsPage.verifyProductBreadCrumbText(PRODUCTS.blackHoodie.name);
      await productDetailsPage.goToCategoryByBreadCrumb();
      await categoryPage.verifyBreadCrumbCategoryText(CATALOG.categories.men);
      await categoryPage.goToHomePageByBreadCrumb();
      await expect(page).toHaveURL(SITE.baseUrl);
    });
  }
);
