import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from '../pages/HeaderFooterPage';

import { SITE } from "../utils/test-data/site";
import { NAV } from "../utils/test-data/navigation";
import { CART } from "../utils/test-data/cart";
import { HEADER_NAVIGATION } from "../utils/test-data/header-navigation";
import { goToStore } from "../utils/helpers/navigation";

const cases = HEADER_NAVIGATION.cases;

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;


test.describe('Header navigation tabs and cart badge ', () => {
    const warmUpNavigationState = async () => {
        await goToStore(headerFooterPage, NAV.tabs.store);
        await headerFooterPage.goToSelectedTab(NAV.tabs.contactUs);
    };

    const navigateTabAndVerifyUrl = async (tab: string, expectedUrl: RegExp) => {
        await headerFooterPage.navigateToTab(tab);
        await expect(page).toHaveURL(expectedUrl);
    };

    const verifyCartBadgeZeroAndStableAfterReload = async () => {
        await headerFooterPage.verifyQuantityItemsInCart(CART.empty.badgeCount);
        await page.reload();
        await headerFooterPage.verifyQuantityItemsInCart(CART.empty.badgeCount);
    };

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
    });

    test('TC-001 Header navigation tabs are routable', async () => {
        await warmUpNavigationState();
        for (const [tab, expectedUrl] of cases) {
            await navigateTabAndVerifyUrl(tab, expectedUrl);
        }

    })

    test('TC-002 Cart badge shows 0 on clean session', async () => {
        await verifyCartBadgeZeroAndStableAfterReload();
    })
})


