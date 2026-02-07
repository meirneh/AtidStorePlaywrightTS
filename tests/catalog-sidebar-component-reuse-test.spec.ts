import { test, expect } from "../utils/fixtures/baseTest";
import type HeaderFooterPage from "../pages/HeaderFooterPage";
import type CategoryPage from "../pages/CategoryPage";
import type ProductDetailsPage from "../pages/ProductDetailsPage";

import { NAV } from "../utils/test-data/navigation";
import { CATALOG } from "../utils/test-data/catalog";
import { PRODUCTS } from "../utils/test-data/products";
import { HOME_GLOBAL_NAVIGATION } from "../utils/test-data/home-global-navigation";
import { goToStore } from "../utils/helpers/navigation";

const cases = HOME_GLOBAL_NAVIGATION.cases;
test.describe('Catalog Sidebar Component Reuse and Behavior Across Catalog Pages', () => {

    const navigateToCaseAndVerifyUrl = async (page: import("@playwright/test").Page, headerFooterPage: HeaderFooterPage, tab: string, url: RegExp) => {
        await headerFooterPage.navigateToTab(tab);
        await expect(page).toHaveURL(url);
    }

    const isNonCatalogPage = (tab: string) => tab === NAV.tabs.about || tab === NAV.tabs.contactUs;

    const verifySidebarVisibleAndContentOk = async (categoryPage: CategoryPage) => {
        await categoryPage.verifySlideFilterByPriceVisibleAndEnable();
        await categoryPage.verifyCategoriesVisible([
            CATALOG.categories.accessories,
            CATALOG.categories.men,
            CATALOG.categories.women,
        ]);
        await categoryPage.verifyBestSellersItemsVisible([...CATALOG.bestSellersItems]);
    };

    const applyNarrowedPriceFilterAndVerify = async (categoryPage: CategoryPage) => {
        await categoryPage.verifyProductsPricesInRange(CATALOG.priceFilter.defaultRange.min, CATALOG.priceFilter.defaultRange.max);
        await categoryPage.applyPriceRangeFilter(CATALOG.priceFilter.narrowedRange.sliderDrag.minOffset, CATALOG.priceFilter.narrowedRange.sliderDrag.maxOffset);
        await categoryPage.verifySlidePriceFilterMinPrice(CATALOG.priceFilter.narrowedRange.expectedMinText);
        await categoryPage.verifySlidePriceFilterMaxPrice(CATALOG.priceFilter.narrowedRange.expectedMaxText);
        await categoryPage.verifyPriceParamsInUrl(CATALOG.priceFilter.narrowedRange.min, CATALOG.priceFilter.narrowedRange.max);
        await categoryPage.verifyProductsPricesInRange(CATALOG.priceFilter.narrowedRange.min, CATALOG.priceFilter.narrowedRange.max);
    };

    const selectMenFromSidebarAndVerifyReset = async (categoryPage: CategoryPage) => {
        await categoryPage.selectCategoryByName(CATALOG.categories.men);
        await categoryPage.verifySlidePriceFilterMinPrice(CATALOG.priceFilter.afterSelectMenReset.expectedMinText);
        await categoryPage.verifySlidePriceFilterMaxPrice(CATALOG.priceFilter.afterSelectMenReset.expectedMaxText);
        await categoryPage.verifyNotPriceParamsInUrl();
        await categoryPage.verifyAtLeastOneProductPriceOutOfRange(CATALOG.priceFilter.narrowedRange.min, CATALOG.priceFilter.narrowedRange.max);
    };

    const openBestSellerPdpVerifyAndReturnToStore = async (categoryPage: CategoryPage, productDetailsPage: ProductDetailsPage, headerFooterPage: HeaderFooterPage) => {
        await categoryPage.selectBestSellerByName(PRODUCTS.blueHoodie.name);
        await productDetailsPage.verifyProductDetailsInfo(PRODUCTS.blueHoodie.name, PRODUCTS.blueHoodie.price);
        await goToStore(headerFooterPage, NAV.tabs.store);;
        await categoryPage.verifyBestSellersItemsVisible([...CATALOG.bestSellersItems]);
    }

    test.beforeEach(async ({ goHome }) => {
        await goHome();
    });

    test("TC-063 Sidebar is present only on catalog pages ", async ({ page, headerFooterPage, categoryPage }) => {
        await goToStore(headerFooterPage, NAV.tabs.store);;

        for (const [tab, url] of cases) {
            await navigateToCaseAndVerifyUrl(page, headerFooterPage, tab, url);

            if (isNonCatalogPage(tab)) {
                await categoryPage.verifyCatalogSidebarContentNotPresent();
                continue;
            }

            await verifySidebarVisibleAndContentOk(categoryPage);
        }
    })

    test('TC-064 Price filter resets when selecting category from sidebar', async ({ headerFooterPage, categoryPage }) => {
        await goToStore(headerFooterPage, NAV.tabs.store);
        await applyNarrowedPriceFilterAndVerify(categoryPage);
        await selectMenFromSidebarAndVerifyReset(categoryPage);
    });

    test("TC-065 Negative Best Sellers opens correct PDP context", async ({ headerFooterPage, categoryPage, productDetailsPage }) => {
        await goToStore(headerFooterPage, NAV.tabs.store);
        await openBestSellerPdpVerifyAndReturnToStore(categoryPage, productDetailsPage, headerFooterPage);
    });


})
