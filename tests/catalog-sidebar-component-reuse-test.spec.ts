import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";

import { NAV } from "../utils/test-data/navigation";
import { SITE } from "../utils/test-data/site";
import { CATALOG } from "../utils/test-data/catalog";
import { PRODUCTS } from "../utils/test-data/products";
import { HOME_GLOBAL_NAVIGATION } from "../utils/test-data/home-global-navigation";
import { goToStore } from "../utils/helpers/navigation";

const cases = HOME_GLOBAL_NAVIGATION.cases; // Array<[tab: string, url: RegExp]>

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage;
let productDetailsPage: ProductDetailsPage;

test.describe('Catalog Sidebar Component Reuse and Behavior Across Catalog Pages', () => {

    const navigateToCaseAndVerifyUrl = async (tab: string, url: RegExp) => {
        await headerFooterPage.navigateToTab(tab);
        await expect(page).toHaveURL(url);
    };
    const isNonCatalogPage = (tab: string) => tab === NAV.tabs.about || tab === NAV.tabs.contactUs;
    const verifySidebarVisibleAndContentOk = async () => {
        await categoryPage.verifySlideFilterByPriceVisibleAndEnable();
        await categoryPage.verifyCategoriesVisible([
            CATALOG.categories.accessories,
            CATALOG.categories.men,
            CATALOG.categories.women,
        ]);
        await categoryPage.verifyBestSellersItemsVisible([...CATALOG.bestSellersItems]);
    };

    const applyNarrowedPriceFilterAndVerify = async () => {
        await categoryPage.verifyProductsPricesInRange(CATALOG.priceFilter.defaultRange.min, CATALOG.priceFilter.defaultRange.max);
        await categoryPage.applyPriceRangeFilter(CATALOG.priceFilter.narrowedRange.sliderDrag.minOffset, CATALOG.priceFilter.narrowedRange.sliderDrag.maxOffset);
        await categoryPage.verifySlidePriceFilterMinPrice(CATALOG.priceFilter.narrowedRange.expectedMinText);
        await categoryPage.verifySlidePriceFilterMaxPrice(CATALOG.priceFilter.narrowedRange.expectedMaxText);
        await categoryPage.verifyPriceParamsInUrl(CATALOG.priceFilter.narrowedRange.min, CATALOG.priceFilter.narrowedRange.max);
        await categoryPage.verifyProductsPricesInRange(CATALOG.priceFilter.narrowedRange.min, CATALOG.priceFilter.narrowedRange.max);
    };

    const selectMenFromSidebarAndVerifyReset = async () => {
        await categoryPage.selectCategoryByName(CATALOG.categories.men);
        await categoryPage.verifySlidePriceFilterMinPrice(CATALOG.priceFilter.afterSelectMenReset.expectedMinText);
        await categoryPage.verifySlidePriceFilterMaxPrice(CATALOG.priceFilter.afterSelectMenReset.expectedMaxText);
        await categoryPage.verifyNotPriceParamsInUrl();
        await categoryPage.verifyAtLeastOneProductPriceOutOfRange(CATALOG.priceFilter.narrowedRange.min, CATALOG.priceFilter.narrowedRange.max);
    };

    const openBestSellerPdpVerifyAndReturnToStore = async () => {
        await categoryPage.selectBestSellerByName(PRODUCTS.blueHoodie.name);
        await productDetailsPage.verifyProductDetailsInfo(PRODUCTS.blueHoodie.name, PRODUCTS.blueHoodie.price);
        await goToStore(headerFooterPage, NAV.tabs.store);;
        await categoryPage.verifyBestSellersItemsVisible([...CATALOG.bestSellersItems]);
    }

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

    test("TC-063 Sidebar is present only on catalog pages ", async () => {
        await goToStore(headerFooterPage, NAV.tabs.store);;

        for (const [tab, url] of cases) {
            await navigateToCaseAndVerifyUrl(tab, url);

            if (isNonCatalogPage(tab)) {
                await categoryPage.verifyCatalogSidebarContentNotPresent();
                continue;
            }

            await verifySidebarVisibleAndContentOk();
        }
    })

    test('TC-064 Price filter resets when selecting category from sidebar', async () => {
        await goToStore(headerFooterPage, NAV.tabs.store);;
        await applyNarrowedPriceFilterAndVerify();
        await selectMenFromSidebarAndVerifyReset();
    });

    test('TC-065 Negative Best Sellers opens correct PDP context', async () => {
        await goToStore(headerFooterPage, NAV.tabs.store);;
        await openBestSellerPdpVerifyAndReturnToStore();
    })


})
