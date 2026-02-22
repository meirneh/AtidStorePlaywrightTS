import { test, expect } from "../utils/fixtures/baseTest";
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
import type CategoryPage from "../pages/CategoryPage";

import { NAV } from "../utils/test-data/navigation";
import { CATALOG } from "../utils/test-data/catalog";
import { goToStore } from "../utils/helpers/navigation";


const categoryList = [
    CATALOG.categories.accessories,
    CATALOG.categories.men,
    CATALOG.categories.women
];

const itemsList = CATALOG.bestSellersItems;

test.describe('categories borwsing tests suite', () => {

    const verifySidebarWidgets = async (categoryPage: CategoryPage) => {
        await categoryPage.verifySearchProductsVisibleAndEnable();
        await categoryPage.verifySlidePriceFilterProductsVisible();
        await categoryPage.verifyCategoriesVisible(categoryList);
        await categoryPage.verifyBestSellersItemsVisible([...itemsList]);
    };

    const verifyDefaultRangePricesOnly = async (categoryPage: CategoryPage) => {
        await categoryPage.verifySlidePriceFilterProductsVisible();

        await categoryPage.verifySlidePriceFilterMinPrice(String(CATALOG.priceFilter.defaultRange.min));
        await categoryPage.verifySlidePriceFilterMaxPrice(String(CATALOG.priceFilter.defaultRange.max));
        await categoryPage.verifyNotPriceParamsInUrl();
        await categoryPage.verifyProductsPricesInRange(
            CATALOG.priceFilter.defaultRange.min,
            CATALOG.priceFilter.defaultRange.max
        );
    };

    const applyNarrowedPriceRangeAndVerify = async (categoryPage: CategoryPage) => {
        await categoryPage.verifySlidePriceFilterProductsVisible();

        await categoryPage.applyPriceRangeFilter(
            CATALOG.priceFilter.narrowedRange.sliderDrag.minOffset,
            CATALOG.priceFilter.narrowedRange.sliderDrag.maxOffset,
            CATALOG.priceFilter.narrowedRange.expectedMinText,
            CATALOG.priceFilter.narrowedRange.expectedMaxText
        );
        await categoryPage.verifySlidePriceFilterMinPrice(
            CATALOG.priceFilter.narrowedRange.expectedMinText
        );
        await categoryPage.verifySlidePriceFilterMaxPrice(
            CATALOG.priceFilter.narrowedRange.expectedMaxText
        );
        await categoryPage.verifyPriceParamsInUrl(
            CATALOG.priceFilter.narrowedRange.min,
            CATALOG.priceFilter.narrowedRange.max
        );
        await categoryPage.verifyProductsPricesInRange(
            CATALOG.priceFilter.narrowedRange.min,
            CATALOG.priceFilter.narrowedRange.max
        );
    };

    const verifyPostReturnToStoreState = async (categoryPage: CategoryPage) => {
        await categoryPage.verifySlidePriceFilterMinPrice(String(CATALOG.priceFilter.defaultRange.min));
        await categoryPage.verifySlidePriceFilterMaxPrice(String(CATALOG.priceFilter.defaultRange.max));
        await categoryPage.verifyNotPriceParamsInUrl();
        await categoryPage.verifyProductsPricesInRange(
            CATALOG.priceFilter.defaultRange.min,
            CATALOG.priceFilter.defaultRange.max
        );
    };

    test.beforeEach(async ({ goHome }) => {
        await goHome();
    })

    test('TC-008 [Critical] Category pages display sidebar widgets ', async ({ headerFooterPage, categoryPage }) => {
        allure.epic("Catalog");
        allure.feature("Catalog browsing");
        allure.story("Sidebar widgets");
        allure.severity(Severity.CRITICAL);
        await test.step('Navigate to Store', async () => {
            await goToStore(headerFooterPage, NAV.tabs.store);
        });
        await test.step('Verify sidebar widgets are visible and enabled', async () => {
            await verifySidebarWidgets(categoryPage);
        })
    })

    test("TC-009 [Critical] Filter by price narrows the list ", async ({ headerFooterPage, categoryPage }) => {
        allure.epic("Catalog");
        allure.feature("Catalog browsing");
        allure.story("Filter by price ");
        allure.severity(Severity.CRITICAL);
        await test.step('Navigate to Store', async () => {
            await goToStore(headerFooterPage, NAV.tabs.store);
        });

        await test.step('Verify default range prices', async () => {
            await verifyDefaultRangePricesOnly(categoryPage);
        });

        await test.step('Apply narrow price range and verify', async () => {
            await applyNarrowedPriceRangeAndVerify(categoryPage);
        });

        await test.step('Navigate back  to Store', async () => {
            await goToStore(headerFooterPage, NAV.tabs.store);
        });

        await test.step('Return to store page', async () => {
            await verifyPostReturnToStoreState(categoryPage);
        })
    });

    test('TC-010 [Normal] Category link filters listing ', async ({ headerFooterPage, categoryPage }) => {
        allure.epic("Catalog");
        allure.feature("Catalog browsing");
        allure.story("Filter by category  ");
        allure.severity(Severity.NORMAL);
        await test.step('Navigate to Store', async () => {
            await goToStore(headerFooterPage, NAV.tabs.store);
        });

        await test.step('Select category: Accessories', async () => {
            await categoryPage.selectCategoryAndVerifyProducts(CATALOG.categories.accessories);
        });

        await test.step('Select category: Men', async () => {
            await categoryPage.selectCategoryAndVerifyProducts(CATALOG.categories.men);
        })
        // await categoryPage.selectCategoryAndVerifyProducts(CATALOG.categories.women);
    })

    test('TC-011 [Minor] Best Sellers link opens Product Details Page ', async ({ headerFooterPage, categoryPage, productDetailsPage }) => {
        allure.epic("Catalog");
        allure.feature("Catalog browsing");
        allure.story("Category counters");
        allure.severity(Severity.MINOR);
        await test.step('Navigate to Store', async () => {
            await goToStore(headerFooterPage, NAV.tabs.store);
        });
        await test.step('Open each Best Seller and verify PDP title', async () => {
            for (const producName of itemsList) {
                await categoryPage.selectBestSellerByName(producName);
                await productDetailsPage.verifyProductTitleText(producName);
                await goToStore(headerFooterPage, NAV.tabs.store);
            };
        });
    })

    test('TC-012 [Minor] Category counters reflect displayed quantities', async ({ headerFooterPage, categoryPage }) => {
        allure.epic("Catalog");
        allure.feature("Catalog browsing");
        allure.story("Filter by best seller ");
        allure.severity(Severity.MINOR);
        await test.step('Navigate to Store', async () => {
            await goToStore(headerFooterPage, NAV.tabs.store);
        });
        await test.step('Verify category counter matches results', async () => {
            for (const category of categoryList) {
                await categoryPage.selectCategoryByName(category);
                await categoryPage.verifyCategoryCountMatchesResults(category)
            };
        });

    })

})
