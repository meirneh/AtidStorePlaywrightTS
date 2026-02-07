import {test, expect} from "../utils/fixtures/baseTest";
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
    
    test('TC-008 Category pages display sidebar widgets ', async ({headerFooterPage, categoryPage}) => {
        await goToStore(headerFooterPage, NAV.tabs.store);
        await verifySidebarWidgets(categoryPage);
    })

    test("TC-009 Filter by price narrows the list ", async ({headerFooterPage,categoryPage}) => {
        await goToStore(headerFooterPage, NAV.tabs.store);
        await verifyDefaultRangePricesOnly(categoryPage);
        await applyNarrowedPriceRangeAndVerify(categoryPage);
        await goToStore(headerFooterPage, NAV.tabs.store);;
        await verifyPostReturnToStoreState(categoryPage);
    });
    test('TC-010 Category link filters listing ', async ({headerFooterPage, categoryPage}) => {
        await goToStore(headerFooterPage, NAV.tabs.store);
        await categoryPage.selectCategoryAndVerifyProducts(CATALOG.categories.accessories);
        await categoryPage.selectCategoryAndVerifyProducts(CATALOG.categories.men);
        // await categoryPage.selectCategoryAndVerifyProducts(CATALOG.categories.women);
    })

    test('TC-011 Best Sellers link opens Product Details Page ', async ({headerFooterPage, categoryPage, productDetailsPage}) => {
        await goToStore(headerFooterPage, NAV.tabs.store);;
        for (const producName of itemsList) {
            await categoryPage.selectBestSellerByName(producName);
            await productDetailsPage.verifyProductTitleText(producName);
            await goToStore(headerFooterPage, NAV.tabs.store);

        }
    })

    test('TC-012 Category counters reflect displayed quantities', async ({headerFooterPage, categoryPage}) => {
        await goToStore(headerFooterPage, NAV.tabs.store);
        for (const category of categoryList) {
            await categoryPage.selectCategoryByName(category);
            await categoryPage.verifyCategoryCountMatchesResults(category)
        }
    })

})
