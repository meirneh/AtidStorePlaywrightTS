import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";

import { NAV } from "../utils/test-data/navigation";
import { SITE } from "../utils/test-data/site";
import { CATALOG } from "../utils/test-data/catalog";
import { PRODUCTS } from "../utils/test-data/products";

type Case = {
    tab: string;
    url: RegExp;
    pageType: "category" | "about" | "contact";
    breadcrumb?: string;
};

const cases: Case[] = [
    { tab: "STORE", url: /\/store\/?$/, pageType: "category", breadcrumb: "Store" },
    { tab: "MEN", url: /\/product-category\/men\/?$/, pageType: "category", breadcrumb: "Men" },
    { tab: "WOMEN", url: /\/product-category\/women\/?$/, pageType: "category", breadcrumb: "Women" },
    { tab: "ACCESSORIES", url: /\/product-category\/accessories\/?$/, pageType: "category", breadcrumb: "Accessories" },
    { tab: "ABOUT", url: /\/about\/?$/, pageType: "about" },
    { tab: "CONTACT US", url: /\/contact-us\/?$/, pageType: "contact" },
];


let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage;
let productDetailsPage: ProductDetailsPage;

test.describe('Catalog Sidebar Component Reuse and Behavior Across Catalog Pages', () => {
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

    test('TC-063 Sidebar is present only on catalog pages ', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);

        for (const c of cases) {
            await headerFooterPage.navigateToTab(c.tab);
            await expect(page).toHaveURL(c.url);
            if (c.pageType === 'about' || c.pageType === 'contact') {
                await categoryPage.verifyCatalogSidebarContentNotPresent();
                continue;
            }

            await categoryPage.verifySlideFilterByPriceVisibleAndEnable();
            await categoryPage.verifyCategoriesVisible([
                CATALOG.categories.accessories,
                CATALOG.categories.men,
                CATALOG.categories.women
            ]);
            await categoryPage.verifyBestSellersItemsVisible([...CATALOG.bestSellersItems]);
        }
    })

    test('TC-064 Price filter resets when selecting category from sidebar', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.verifyProductsPricesInRange(
            CATALOG.priceFilter.defaultRange.min,
            CATALOG.priceFilter.defaultRange.max
        );
        await categoryPage.applyPriceRangeFilter(
            CATALOG.priceFilter.narrowedRange.sliderDrag.minOffset,
            CATALOG.priceFilter.narrowedRange.sliderDrag.maxOffset
        );
        await categoryPage.verifySlidePriceFilterMinPrice(CATALOG.priceFilter.narrowedRange.expectedMinText);
        await categoryPage.verifySlidePriceFilterMaxPrice(CATALOG.priceFilter.narrowedRange.expectedMaxText);
        await categoryPage.verifyPriceParamsInUrl(
            CATALOG.priceFilter.narrowedRange.min,
            CATALOG.priceFilter.narrowedRange.max
        );
        await categoryPage.verifyProductsPricesInRange(
            CATALOG.priceFilter.narrowedRange.min,
            CATALOG.priceFilter.narrowedRange.max);
        await categoryPage.selectCategoryByName("Men");
        await categoryPage.selectCategoryByName(CATALOG.categories.men);
        await categoryPage.verifySlidePriceFilterMinPrice(CATALOG.priceFilter.afterSelectMenReset.expectedMinText);
        await categoryPage.verifySlidePriceFilterMaxPrice(CATALOG.priceFilter.afterSelectMenReset.expectedMaxText);
        await categoryPage.verifyNotPriceParamsInUrl();
        await categoryPage.verifyAtLeastOneProductPriceOutOfRange(
            CATALOG.priceFilter.narrowedRange.min,
            CATALOG.priceFilter.narrowedRange.max
        );
    });

    test('TC-065 Negative Best Sellers opens correct PDP context', async () => {
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectBestSellerByName(PRODUCTS.blueHoodie.name);
        await productDetailsPage.verifyProductDetailsInfo(
            PRODUCTS.blueHoodie.name,
            PRODUCTS.blueHoodie.price
        );
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.verifyBestSellersItemsVisible([...CATALOG.bestSellersItems]);
    })


})
