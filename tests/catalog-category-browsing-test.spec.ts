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

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage;
let productDetailsPage: ProductDetailsPage;

test.describe('categories borwsing tests suite', () => {
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

    test('TC-008 Category pages display sidebar widgets ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.verifySearchProductsVisibleAndEnable();
        await categoryPage.verifySearchProductsVisibleAndEnable();
        await categoryPage.verifySlidePriceFilterProductsVisible();
        await categoryPage.verifyCategoriesVisible(categoryList);
        await categoryPage.verifyBestSellersItemsVisible(itemsList);

    })

    test('TC-009 Filter by price narrows the list ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.verifyProductsPricesInRange(30, 250);
        await categoryPage.applyPriceRangeFilter(0, -130);
        await categoryPage.verifySlidePriceFilterMinPrice("30");;
        await categoryPage.verifySlidePriceFilterMaxPrice("120");
        await categoryPage.verifyPriceParamsInUrl(30, 120)
        await categoryPage.verifyProductsPricesInRange(30, 120);
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.verifySlidePriceFilterMinPrice("30");
        await categoryPage.verifySlidePriceFilterMaxPrice("250");
        await categoryPage.verifyNotPriceParamsInUrl();
        await categoryPage.verifyProductsPricesInRange(30, 250);
    })

    test('TC-010 Category link filters listing ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectCategoryAndVerifyProducts("Accessories");
        await categoryPage.selectCategoryAndVerifyProducts("Men");
        // await categoryPage.selectCategoryAndVerifyProducts("Women");
    })

    test('TC-011 Best Sellers link opens Product Ddetais Page ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        for (const producName of itemsList) {
            await categoryPage.selectBestSellerByName(producName);
            await productDetailsPage.verifyProductTitleText(producName);
            await headerFooterPage.navigateToTab("STORE");

        }
    })

    test('TC-012 Category counters reflect displayed quantities', async () => {
        await headerFooterPage.navigateToTab("STORE");
        for (const category of categoryList) {
            await categoryPage.selectCategoryByName(category);
            await categoryPage.verifyCategoryCountMatchesResults(category)
        }
    })









})
