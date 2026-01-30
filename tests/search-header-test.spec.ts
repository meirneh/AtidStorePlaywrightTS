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

    const goToTab = async (tab: any) => {
        await headerFooterPage.navigateToTab(tab);
    };

    const headerSearchAndVerifyResults = async (term: string, expectedCount?: number) => {
        await headerFooterPage.searchValue(term);
        await searchResultPage.verifyResultsTitleText(term);
        if (expectedCount !== undefined) {
            await searchResultPage.verifyCountResults(expectedCount);
        }
    };

    const sidebarSearchInCatalogAndVerifyCount = async (initialCount: number, term: string, filteredCount: number) => {
        await goToTab(NAV.tabs.store);
        await categoryPage.verifyCountProducts(initialCount);
        await categoryPage.searchValue(term);
        await categoryPage.verifyCountProducts(filteredCount);
    };

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
        await headerSearchAndVerifyResults(SEARCH.header.term, SEARCH.header.expectedResultsCount);
    })

    test('TC-014 Sidebar search filters within catalog context ', async () => {
        await sidebarSearchInCatalogAndVerifyCount(
            SEARCH.sidebarCatalog.initialProductsCount,
            SEARCH.sidebarCatalog.term,
            SEARCH.sidebarCatalog.filteredProductsCount
        );
        await categoryPage.searchValue(SEARCH.sidebarCatalog.term);
        await goToTab(NAV.tabs.home);
        await goToTab(NAV.tabs.store);
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
        await headerSearchAndVerifyResults(SEARCH.echo.term);
    })






})
