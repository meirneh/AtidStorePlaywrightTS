import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from '../pages/HeaderFooterPage';

import { LinkKey } from "../pages/HeaderFooterPage";
import { SITE } from "../utils/test-data/site";
import { CART } from "../utils/test-data/cart";
import { HOME_GLOBAL_NAVIGATION } from "../utils/test-data/home-global-navigation";

const cases = HOME_GLOBAL_NAVIGATION.cases;
const quickLinks = HOME_GLOBAL_NAVIGATION.quickLinks;

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;

test.describe('home and global navigations tests', () => {

    const goHomeAndVerify = async () => {
        await headerFooterPage.backToHomeTab();
        await expect(page).toHaveURL(SITE.baseUrl);
    };

    const navigateTabAndVerifyUrl = async (tab: string, expectedUrl: RegExp) => {
        await headerFooterPage.navigateToTab(tab);
        await expect(page).toHaveURL(expectedUrl);
    };

    const navigateTabVerifyAndReturnHome = async (tab: string, expectedUrl: RegExp) => {
        await navigateTabAndVerifyUrl(tab, expectedUrl);
        await goHomeAndVerify();
    };

    const verifyCartBadgeZeroAndStableAfterReload = async () => {
        await headerFooterPage.verifyQuantityItemsInCart(CART.empty.badgeCount);
        await page.reload();
        await headerFooterPage.verifyQuantityItemsInCart(CART.empty.badgeCount);
    };

    const navigateQuickLinkVerifyAndBack = async (label: LinkKey, expectedUrl: RegExp) => {
        await headerFooterPage.navigateToQuickLink(label);
        await headerFooterPage.verifyQuickLinkUrl(label);
        await expect(page).toHaveURL(expectedUrl);
        await page.goBack();
    };

    const verifySearchControlVisibleEnabledInTabAndReturnHome = async (tab: string) => {
        await headerFooterPage.navigateToTab(tab);
        await headerFooterPage.verifySearchButtonVisibleEnable();
        await headerFooterPage.clickSearchButton();
        await goHomeAndVerify();
    };

    const verifyLogoReturnHomeFromTab = async (tab: string, expectedUrl: RegExp) => {
        await navigateTabAndVerifyUrl(tab, expectedUrl);
        await expect(page).not.toHaveURL(SITE.baseUrl);
        await goHomeAndVerify();
    };

    const runHeaderTabSanityNo404 = async () => {
        for (const [label] of cases) {
            await headerFooterPage.navigateTabAndSanity(label as any);
        }
    };

    const runQuickLinksSanityNo404 = async () => {
        for (const [label] of quickLinks) {
            await headerFooterPage.navigateQuickLinkAndSanity(label);
        }
    }

    test.beforeEach(async () => {
        browser = await chromium.launch({ channel: "chrome", slowMo: 500 });
        context = await browser.newContext();
        page = await context.newPage();
        await page.goto(SITE.baseUrl);
        headerFooterPage = new HeaderFooterPage(page);
    });

    test.afterEach(async () => {
        await context?.close();
        await page?.close();
    })

    test('TC-001 Header navigation tabs are visible and routable', async () => {
        for (const [tab, expectedUrl] of cases) {
            await navigateTabVerifyAndReturnHome(tab, expectedUrl)
        };
    })

    test('TC-002 Cart badge shows 0 on clean session', async () => {
        for (const [tab] of cases) {
            await headerFooterPage.navigateToTab(tab);
            await verifyCartBadgeZeroAndStableAfterReload();
        };

    })

    test('TC-003 Footer quick links navigate correctly ', async () => {
        for (const [label, expected] of quickLinks) {
            await navigateQuickLinkVerifyAndBack(label, expected);
        };

    })

    test('TC-004 Header search control is visible and enabled', async () => {
        test.setTimeout(60_000);
        for (const [tab] of cases) {
            await verifySearchControlVisibleEnabledInTabAndReturnHome(tab);
        };
    })

    test('TC-005 Negative navigation never returns 404', async () => {
        test.setTimeout(90_000);
        await runHeaderTabSanityNo404();
        await runQuickLinksSanityNo404();
    });

    test('TC-006 Logo click returns to Home', async () => {
        for (const [tab, expectedUrl] of cases) {
            await verifyLogoReturnHomeFromTab(tab, expectedUrl);
        };
    });


    test('TC-007 Header amount is visible', async () => {
        for (const [tab] of cases) {
            await headerFooterPage.navigateToTab(tab);
            await headerFooterPage.verifyTotalItemsInCart(CART.empty.headerAmount);
        };
    });

})

