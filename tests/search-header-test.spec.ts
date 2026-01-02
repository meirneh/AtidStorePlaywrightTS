import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import SearchResultPage from "../pages/SearchResultPage";
import CategoryPage from "../pages/CategoryPage";

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let searchResultPage: SearchResultPage;
let categoryPage: CategoryPage;

test.describe('Header Search Functionality Verification', () => {
    test.beforeEach(async () => {
        browser = await chromium.launch({ channel: "chrome", slowMo: 500 });
        context = await browser.newContext();
        page = await context.newPage();
        await page.goto("https://atid.store/");
        headerFooterPage = new HeaderFooterPage(page);
        searchResultPage = new SearchResultPage(page);
        categoryPage = new CategoryPage(page);
    });

    test.afterEach(async () => {
        await context?.close();
        await page?.close();
    });

    test('TC-013 Header search navigates to results ', async () => {
        await headerFooterPage.searchValue("shirt");
        await searchResultPage.verifyResultsTitleText("shirt");
        await searchResultPage.verifyCountResults(8);


    })

    test('TC-014 Sidebar search filters within catalog context ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.verifyCountProducts(12);
        await categoryPage.searchValue("Shirt");
        await categoryPage.verifyCountProducts(7);
        await categoryPage.verifyProductContain("Shirt");
        await headerFooterPage.navigateToTab("HOME");
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.verifyCountProducts(12);
    })

    test('TC-015 Negative empty header search does not trigger navigation ', async () => {
        await headerFooterPage.searchValue("");
        await headerFooterPage.verifySearchBarIsNotVisibleAndDisable();
        await headerFooterPage.verifyHomePageUrl("https://atid.store/");
    })

    test('TC-016 Negative no match message displayed and retry search works ', async () => {
        await headerFooterPage.searchValue("pizza");
        await searchResultPage.verifyResultsTitleText("pizza");
        await searchResultPage.verifyErrorMessage();
        await searchResultPage.searchValue("shirt");
        await searchResultPage.verifyResultsTitleText("shirt");
        await searchResultPage.verifyCountResults(8);
    })

    test('TC-017 Search term echo is visible ', async () => {
        await headerFooterPage.searchValue("men");
        await searchResultPage.verifyResultsTitleText("men");
    })






})
