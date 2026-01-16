import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import SearchResultPage from "../pages/SearchResultPage";
import CategoryPage from "../pages/CategoryPage";

import { SITE } from "../utils/test-data/site";
import { NAV } from "../utils/test-data/navigation";
import { SEARCH } from "../utils/test-data/search";

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
        await page.goto(SITE.baseUrl);
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
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.verifyCountProducts(SEARCH.sidebarCatalog.initialProductsCount);
        await categoryPage.searchValue(SEARCH.sidebarCatalog.term);
        await categoryPage.verifyCountProducts(SEARCH.sidebarCatalog.filteredProductsCount);
        await categoryPage.searchValue(SEARCH.sidebarCatalog.term);
        await headerFooterPage.navigateToTab(NAV.tabs.home);
        await headerFooterPage.navigateToTab(NAV.tabs.store);
    })

    test('TC-015 Negative empty header search does not trigger navigation ', async () => {
        await headerFooterPage.searchValue(SEARCH.negative.empty);
        await headerFooterPage.verifySearchBarIsNotVisibleAndDisable();
        await headerFooterPage.verifyHomePageUrl(SITE.baseUrl);
    })

    test('TC-016 Negative no match message displayed and retry search works ', async () => {
        await headerFooterPage.searchValue(SEARCH.negative.noMatch);
        await searchResultPage.verifyResultsTitleText(SEARCH.negative.noMatch);
        await searchResultPage.verifyErrorMessage();
        await searchResultPage.searchValue(SEARCH.header.term);
        await searchResultPage.verifyResultsTitleText(SEARCH.header.term);
        await searchResultPage.verifyCountResults(SEARCH.header.expectedResultsCount);
    })

    test('TC-017 Search term echo is visible ', async () => {
        await headerFooterPage.searchValue(SEARCH.echo.term);
        await searchResultPage.verifyResultsTitleText(SEARCH.echo.term);
    })






})
