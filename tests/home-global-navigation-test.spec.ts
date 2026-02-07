
import { test, expect } from "../utils/fixtures/baseTest";
// import { type Page } from "@playwright/test";
import type HeaderFooterPage from '../pages/HeaderFooterPage';
import type { LinkKey } from "../pages/HeaderFooterPage";
import { NAV } from "../utils/test-data/navigation";
import { SITE } from "../utils/test-data/site";
import { CART } from "../utils/test-data/cart";
import { HOME_GLOBAL_NAVIGATION } from "../utils/test-data/home-global-navigation";

const cases = HOME_GLOBAL_NAVIGATION.cases;
const quickLinks = HOME_GLOBAL_NAVIGATION.quickLinks;
test.describe('home and global navigations tests', () => {

    const goHomeAndVerify = async (page: import("@playwright/test").Page, headerFooterPage: HeaderFooterPage) => {
        await headerFooterPage.backToHomeTab();
        await expect(page).toHaveURL(SITE.baseUrl);
    };

    const navigateTabAndVerifyUrl = async (page: import("@playwright/test").Page, headerFooterPage: HeaderFooterPage, tab: string, expectedUrl: RegExp) => {
        await headerFooterPage.navigateToTab(tab);
        await expect(page).toHaveURL(expectedUrl);
    };

    const navigateTabVerifyAndReturnHome = async (page: import("@playwright/test").Page, headerFooterPage: HeaderFooterPage, tab: string, expectedUrl: RegExp) => {
        await navigateTabAndVerifyUrl(page, headerFooterPage, tab, expectedUrl);
        await goHomeAndVerify(page, headerFooterPage);
    };

    const verifyCartBadgeZeroAndStableAfterReload = async (page: import("@playwright/test").Page, headerFooterPage: HeaderFooterPage) => {
        await headerFooterPage.verifyQuantityItemsInCart(CART.empty.badgeCount);
        await page.reload();
        await headerFooterPage.verifyQuantityItemsInCart(CART.empty.badgeCount);
    };

    const navigateQuickLinkVerifyAndBack = async (page: import("@playwright/test").Page, headerFooterPage: HeaderFooterPage, label: LinkKey, expectedUrl: RegExp) => {
        await headerFooterPage.navigateToQuickLink(label);
        await headerFooterPage.verifyQuickLinkUrl(label);
        await expect(page).toHaveURL(expectedUrl);
        await page.goBack();
    };

    const verifySearchControlVisibleEnabledInTabAndReturnHome = async (page: import("@playwright/test").Page, headerFooterPage: HeaderFooterPage, tab: string) => {
        await headerFooterPage.navigateToTab(tab);
        await headerFooterPage.verifySearchButtonVisibleEnable();
        await headerFooterPage.clickSearchButton();
        await goHomeAndVerify(page, headerFooterPage);
    };

    const verifyLogoReturnHomeFromTab = async (page: import("@playwright/test").Page, headerFooterPage: HeaderFooterPage, tab: string, expectedUrl: RegExp) => {
        await navigateTabAndVerifyUrl(page, headerFooterPage, tab, expectedUrl);
        await expect(page).not.toHaveURL(SITE.baseUrl);
        await goHomeAndVerify(page, headerFooterPage);
    };

    const runHeaderTabSanityNo404 = async (headerFooterPage: HeaderFooterPage) => {
        for (const [label] of cases) {
            await headerFooterPage.navigateTabAndSanity(label as any);
        }
    };

    const runQuickLinksSanityNo404 = async (headerFooterPage: HeaderFooterPage) => {
        for (const [label] of quickLinks) {
            await headerFooterPage.navigateQuickLinkAndSanity(label);
        }
    }

    // let page: Page;
    // let headerFooterPage: HeaderFooterPage;
    /* test.beforeEach(async ({ page: fixturePage, headerFooterPage: fixtureHeaderFooterPage, goHome }) => { 
        page = fixturePage;
        headerFooterPage = fixtureHeaderFooterPage; 
        await goHome(); 
    }) */

    test.beforeEach(async ({ goHome }) => {
        await goHome();
    })


    test('TC-001 Header navigation tabs are visible and routable', async ({ page, headerFooterPage }) => {
        for (const [tab, expectedUrl] of cases) {
            await navigateTabVerifyAndReturnHome(page, headerFooterPage, tab, expectedUrl)
        };
    })

    test('TC-002 Cart badge shows 0 on clean session', async ({ page, headerFooterPage }) => {
        for (const [tab] of cases) {
            await headerFooterPage.navigateToTab(tab);
            await verifyCartBadgeZeroAndStableAfterReload(page, headerFooterPage);
        };
    })

    test('TC-003 Footer quick links navigate correctly ', async ({ page, headerFooterPage }) => {
        for (const [label, expected] of quickLinks) {
            await navigateQuickLinkVerifyAndBack(page, headerFooterPage, label, expected);
        };

    })

    test('TC-004 Header search control is visible and enabled', async ({ page, headerFooterPage }) => {
        test.setTimeout(60_000);
        for (const [tab] of cases) {
            await verifySearchControlVisibleEnabledInTabAndReturnHome(page, headerFooterPage, tab);
        };
    })

    test('TC-005 Negative navigation never returns 404', async ({ headerFooterPage }) => {
        test.setTimeout(90_000);
        await runHeaderTabSanityNo404(headerFooterPage);
        await runQuickLinksSanityNo404(headerFooterPage);
    });

    test('TC-006 Logo click returns to Home', async ({ page, headerFooterPage }) => {
        for (const [tab, expectedUrl] of cases) {
            await verifyLogoReturnHomeFromTab(page, headerFooterPage, tab, expectedUrl);
        };
    });


    test('TC-007 Header amount is visible', async ({ headerFooterPage }) => {
        for (const [tab] of cases) {
            await headerFooterPage.navigateToTab(tab);
            await headerFooterPage.verifyTotalItemsInCart(CART.empty.headerAmount);
        };
    });

})

