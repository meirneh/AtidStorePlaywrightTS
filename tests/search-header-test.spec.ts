import { test, expect } from "../utils/fixtures/baseTest";
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
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


    test('TC-013 [Normal] Header search navigates to results ', async ({ headerFooterPage, searchResultPage }) => {
        allure.epic('Search');
        allure.feature('Header Search');
        allure.story('Header search navigates to results');
        allure.severity(Severity.NORMAL);

        await test.step('Search from header and navigate to results', async () => {
            await headerSearchAndVerifyResults(headerFooterPage, searchResultPage, SEARCH.header.term, SEARCH.header.expectedResultsCount);
        });
    });

    test('TC-014 [Normal] Sidebar search filters within catalog context ', async ({ headerFooterPage, categoryPage }) => {
        allure.epic('Search');
        allure.feature('Sidebar Search');
        allure.story('Sidebar search filters within catalog context');
        allure.severity(Severity.NORMAL);

        await test.step('Apply sidebar search and verify filtered count', async () => {
            await sidebarSearchInCatalogAndVerifyCount(
                headerFooterPage, categoryPage,
                SEARCH.sidebarCatalog.initialProductsCount,
                SEARCH.sidebarCatalog.term,
                SEARCH.sidebarCatalog.filteredProductsCount
            );
        });

        await test.step('Re-apply search value (stability step)', async () => {
            await categoryPage.searchValue(SEARCH.sidebarCatalog.term);
        });

        await test.step('Navigate Home and back to Store (reset context)', async () => {
            await goToTab(headerFooterPage, NAV.tabs.home);
            await goToTab(headerFooterPage, NAV.tabs.store);
        });

    });

    test('TC-015 [Minor] Negative empty header search does not trigger navigation ', async ({ headerFooterPage }) => {
        allure.epic('Search');
        allure.feature('Header Search');
        allure.story('Negative empty search does not navigate');
        allure.severity(Severity.MINOR);

        await test.step('Submit empty header search', async () => {
            await headerFooterPage.searchValue(SEARCH.negative.empty);
        });

        await test.step('Verify search bar closes and is disabled', async () => {
            await headerFooterPage.verifySearchBarIsNotVisibleAndDisable();
        });

        await test.step('Verify user remains on Home URL', async () => {
            await headerFooterPage.verifyHomePageUrl(SITE.baseUrl);
        });
    });

    test('TC-016 [Minor] Negative no match message displayed and retry search works ', async ({ headerFooterPage, searchResultPage }) => {
        allure.epic('Search');
        allure.feature('Header Search');
        allure.story('Negative no match message and retry search works');
        allure.severity(Severity.MINOR);

        await test.step('Search from header with no-match term', async () => {
            await headerFooterPage.searchValue(SEARCH.negative.noMatch);
        });

        await test.step('Verify no-results title and error message', async () => {
            await searchResultPage.verifyResultsTitleText(SEARCH.negative.noMatch);
            await searchResultPage.verifyErrorMessage();
        });

        await test.step('Retry search with valid term', async () => {
            await searchResultPage.searchValue(SEARCH.header.term);
        });

        await test.step('Verify results title and expected results count', async () => {
            await searchResultPage.verifyResultsTitleText(SEARCH.header.term);
            await searchResultPage.verifyCountResults(SEARCH.header.expectedResultsCount);
        });

    });

    test('TC-017 [Minor] Search term echo is visible ', async ({ headerFooterPage, searchResultPage }) => {
        allure.epic('Search');
        allure.feature('Header Search');
        allure.story('Search term echo is visible');
        allure.severity(Severity.MINOR);

        await test.step('Search from header', async () => {
            await headerSearchAndVerifyResults(headerFooterPage, searchResultPage, SEARCH.echo.term);
        });
    });
})
