import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";

import { SITE } from "../utils/test-data/site";
import { NAV } from "../utils/test-data/navigation";
import { CATALOG } from "../utils/test-data/catalog";
import { goToStore } from "../utils/helpers/navigation";

const categoryList = [
    CATALOG.categories.accessories,
    CATALOG.categories.men,
    CATALOG.categories.women
];

const itemsList = CATALOG.bestSellersItems;

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage;
let productDetailsPage: ProductDetailsPage;

test.describe('categories borwsing tests suite', () => {

    const verifySidebarWidgets = async () => {
        await categoryPage.verifySearchProductsVisibleAndEnable();
        await categoryPage.verifySlidePriceFilterProductsVisible();
        await categoryPage.verifyCategoriesVisible(categoryList);
        await categoryPage.verifyBestSellersItemsVisible([...itemsList]);

    };

    const verifyDefaultRangePricesOnly = async () => {
        await categoryPage.verifySlidePriceFilterProductsVisible();

        await categoryPage.verifySlidePriceFilterMinPrice(String(CATALOG.priceFilter.defaultRange.min));
        await categoryPage.verifySlidePriceFilterMaxPrice(String(CATALOG.priceFilter.defaultRange.max));
        await categoryPage.verifyNotPriceParamsInUrl();
        await categoryPage.verifyProductsPricesInRange(
            CATALOG.priceFilter.defaultRange.min,
            CATALOG.priceFilter.defaultRange.max
        );
    };

    const applyNarrowedPriceRangeAndVerify = async () => {
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

    const verifyPostReturnToStoreState = async () => {
        await categoryPage.verifySlidePriceFilterMinPrice(String(CATALOG.priceFilter.defaultRange.min));
        await categoryPage.verifySlidePriceFilterMaxPrice(String(CATALOG.priceFilter.defaultRange.max));
        await categoryPage.verifyNotPriceParamsInUrl();
        await categoryPage.verifyProductsPricesInRange(
            CATALOG.priceFilter.defaultRange.min,
            CATALOG.priceFilter.defaultRange.max
        );
    };

    test.beforeEach(async () => {
        browser = await chromium.launch({ channel: "chrome", slowMo: 500 });
        context = await browser.newContext();
        page = await context.newPage();
        await page.goto(SITE.baseUrl);
        headerFooterPage = new HeaderFooterPage(page);
        categoryPage = new CategoryPage(page);
        productDetailsPage = new ProductDetailsPage(page);
    });

    test.afterAll(async () => {
        await context?.close();
        await page?.close();
    })

    test('TC-008 Category pages display sidebar widgets ', async () => {
        await goToStore(headerFooterPage, NAV.tabs.store);
        await verifySidebarWidgets();
    })

    test("TC-009 Filter by price narrows the list ", async () => {
        await goToStore(headerFooterPage, NAV.tabs.store);
        await verifyDefaultRangePricesOnly();
        await applyNarrowedPriceRangeAndVerify();
        await goToStore(headerFooterPage, NAV.tabs.store);;
        await verifyPostReturnToStoreState();
    });
    test('TC-010 Category link filters listing ', async () => {
        await goToStore(headerFooterPage, NAV.tabs.store);;
        await categoryPage.selectCategoryAndVerifyProducts(CATALOG.categories.accessories);
        await categoryPage.selectCategoryAndVerifyProducts(CATALOG.categories.men);
        // await categoryPage.selectCategoryAndVerifyProducts(CATALOG.categories.women);
    })

    test('TC-011 Best Sellers link opens Product Details Page ', async () => {
        await goToStore(headerFooterPage, NAV.tabs.store);;
        for (const producName of itemsList) {
            await categoryPage.selectBestSellerByName(producName);
            await productDetailsPage.verifyProductTitleText(producName);
            await goToStore(headerFooterPage, NAV.tabs.store);

        }
    })

    test('TC-012 Category counters reflect displayed quantities', async () => {
        await goToStore(headerFooterPage, NAV.tabs.store);
        for (const category of categoryList) {
            await categoryPage.selectCategoryByName(category);
            await categoryPage.verifyCategoryCountMatchesResults(category)
        }
    })

})
