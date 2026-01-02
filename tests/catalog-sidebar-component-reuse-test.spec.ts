import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
const categoryList = ['Accessories', 'Men', 'Women'];
const itemsList = [
    'Boho Bangle Bracelet',
    'Bright Gold Purse With Chain',
    'Buddha Bracelet',
    'Flamingo Tshirt',
    'Blue Hoodie',
]

type Case = {
    tab: string;
    url: RegExp;
    pageType: "category" | "about" | "contact";
    // heading?: string;
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
        await page.goto("https://atid.store/");
        headerFooterPage = new HeaderFooterPage(page);
        categoryPage = new CategoryPage(page);
        productDetailsPage = new ProductDetailsPage(page);
    });

    test.afterAll(async () => {
        await context?.close();
        await page?.close();
    })

    test('TC-063 Sidebar is present only on catalog pages ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        for (const c of cases) {
            await headerFooterPage.navigateToTab(c.tab);
            await expect(page).toHaveURL(c.url);
            if (c.pageType === 'about' || c.pageType === 'contact') {
                await categoryPage.verifyCatalogSidebarContentNotPresent();
                continue;
            }

            await categoryPage.verifySlideFilterByPriceVisibleAndEnable();
            await categoryPage.verifyCategoriesVisible(categoryList);
            await categoryPage.verifyBestSellersItemsVisible(itemsList);

        }
    })

    test('TC-064 Price filter resets when selecting category from sidebar', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.verifyProductsPricesInRange(30, 250);
        await categoryPage.applyPriceRangeFilter(0, -130);
        await categoryPage.verifySlidePriceFilterMinPrice("30");;
        await categoryPage.verifySlidePriceFilterMaxPrice("120");
        await categoryPage.verifyPriceParamsInUrl(30, 120)
        await categoryPage.verifyProductsPricesInRange(30, 120);
        await categoryPage.selectCategoryByName("Men");
        await categoryPage.verifySlidePriceFilterMinPrice("80");
        await categoryPage.verifySlidePriceFilterMaxPrice("190");
        await categoryPage.verifyNotPriceParamsInUrl();
        await categoryPage.verifyAtLeastOneProductPriceOutOfRange(30, 120);
    });

    test('TC-065 Negative Best Sellers opens correct PDP context', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectBestSellerByName("Blue Hoodie");
        await productDetailsPage.verifyProductDetailsInfo("Blue Hoodie", 150);
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.verifyBestSellersItemsVisible(itemsList);
    })


})
