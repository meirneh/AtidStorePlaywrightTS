import { test, expect } from "../utils/fixtures/baseTest";
import type HeaderFooterPage from "../pages/HeaderFooterPage";
import type SearchResultPage from "../pages/SearchResultPage";
import type CategoryPage from "../pages/CategoryPage";

import { SITE } from "../utils/test-data/site";
import { NAV } from "../utils/test-data/navigation";
import { SEARCH } from "../utils/test-data/search";

test.describe('Header Search Functionality Verification', () => {

    const goToTab = async (headerFooterPage: HeaderFooterPage, tab: any) => {
        await headerFooterPage.navigateToTab(tab);
    };

    const headerSearchAndVerifyResults = async (headerFooterPage: HeaderFooterPage, searchResultPage: SearchResultPage, term: string, expectedCount?: number) => {
        await headerFooterPage.searchValue(term);
        await searchResultPage.verifyResultsTitleText(term);
        if (expectedCount !== undefined) {
            await searchResultPage.verifyCountResults(expectedCount);
        }
    };

    const sidebarSearchInCatalogAndVerifyCount = async (headerFooterPage: HeaderFooterPage, categoryPage: CategoryPage, initialCount: number, term: string, filteredCount: number) => {
        await goToTab(headerFooterPage, NAV.tabs.store);
        await categoryPage.verifyCountProducts(initialCount);
        await categoryPage.searchValue(term);
        await categoryPage.verifyCountProducts(filteredCount);
    };

    test.beforeEach(async ({ goHome }) => {
        await goHome();
    })


    test('TC-013 Header search navigates to results ', async ({ headerFooterPage, searchResultPage }) => {
        await headerSearchAndVerifyResults(headerFooterPage, searchResultPage, SEARCH.header.term, SEARCH.header.expectedResultsCount);
    })

    test('TC-014 Sidebar search filters within catalog context ', async ({ headerFooterPage, categoryPage }) => {
        await sidebarSearchInCatalogAndVerifyCount(
            headerFooterPage, categoryPage,
            SEARCH.sidebarCatalog.initialProductsCount,
            SEARCH.sidebarCatalog.term,
            SEARCH.sidebarCatalog.filteredProductsCount
        );
        await categoryPage.searchValue(SEARCH.sidebarCatalog.term);
        await goToTab(headerFooterPage, NAV.tabs.home);
        await goToTab(headerFooterPage, NAV.tabs.store);
    })

    test('TC-015 Negative empty header search does not trigger navigation ', async ({ headerFooterPage }) => {
        await headerFooterPage.searchValue(SEARCH.negative.empty);
        await headerFooterPage.verifySearchBarIsNotVisibleAndDisable();
        await headerFooterPage.verifyHomePageUrl(SITE.baseUrl);
    })

    test('TC-016 Negative no match message displayed and retry search works ', async ({ headerFooterPage, searchResultPage }) => {
        await headerFooterPage.searchValue(SEARCH.negative.noMatch);
        await searchResultPage.verifyResultsTitleText(SEARCH.negative.noMatch);
        await searchResultPage.verifyErrorMessage();
        await searchResultPage.searchValue(SEARCH.header.term);
        await searchResultPage.verifyResultsTitleText(SEARCH.header.term);
        await searchResultPage.verifyCountResults(SEARCH.header.expectedResultsCount);
    })

    test('TC-017 Search term echo is visible ', async ({ headerFooterPage, searchResultPage }) => {
        await headerSearchAndVerifyResults(headerFooterPage, searchResultPage, SEARCH.echo.term);
    })
})
