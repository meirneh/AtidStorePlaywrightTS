import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from '../pages/HeaderFooterPage';

import { LinkKey } from "../pages/HeaderFooterPage";
import { SITE } from "../utils/test-data/site";
import { CART } from "../utils/test-data/cart";

// Local URL helpers for this spec (Stage 1: keep data in test-data, no shared helpers yet).
const BASE_URL = SITE.baseUrl.replace(/\/$/, '');
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const HOME_URL_REGEX = new RegExp(`^${escapeRegExp(BASE_URL)}\\/?$`, 'i')

const cases: Array<[string, RegExp]> = [
    ['STORE', /\/store\/?$/i],
    ['MEN', /product-category\/men/i],
    ['WOMEN', /product-category\/women/i],
    ['ACCESSORIES', /product-category\/accessories/i],
    ['ABOUT', /about/i],
    ['CONTACT US', /contact-us/i],
];

const quickLinks: ReadonlyArray<readonly [LinkKey, RegExp]> = [
    ['CART', /\/cart(-\d+)?\/?$/i],
    ['CONTACT US', /contact-us/i],
    ['ABOUT', /about/i],
] as const;

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;

test.describe('home and global navigations tests', () => {
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
            await headerFooterPage.navigateToTab(tab);
            await expect(page).toHaveURL(expectedUrl);
            await headerFooterPage.backToHomeTab();
            await expect(page).toHaveURL(SITE.baseUrl);

        }
    })

    test('TC-002 Cart badge shows 0 on clean session', async () => {
        for (const [tab] of cases) {
            await headerFooterPage.navigateToTab(tab);
            await headerFooterPage.verifyQuantityItemsInCart(CART.empty.badgeCount);
            await page.reload();
            await headerFooterPage.verifyQuantityItemsInCart(CART.empty.badgeCount);
        }

    })

    test('TC-003 Footer quick links navigate correctly ', async () => {
        for (const [label, expected] of quickLinks) {
            await headerFooterPage.navigateToQuickLink(label);
            await headerFooterPage.verifyQuickLinkUrl(label);
            await expect(page).toHaveURL(expected);
            await page.goBack();

        }

    })

    test('TC-004 Header search control is visible and enabled', async () => {
        test.setTimeout(60_000);
        for (const [tab] of cases) {
            await headerFooterPage.navigateToTab(tab);
            await headerFooterPage.verifySearchButtonVisibleEnable();
            await headerFooterPage.clickSearchButton();
            await headerFooterPage.backToHomeTab();
        }
    })

    test('TC-005 Negative – navigation never returns 404', async () => {
        test.setTimeout(90_000);
        // 1) Header tabs: iterates through all the tabs defined in `cases`
        for (const [label] of cases) {
            await headerFooterPage.navigateTabAndSanity(label as any);
        }

        // 2) (optional) Footer Quick Links: same negative criteria
        for (const [label, expected] of quickLinks) {
            await headerFooterPage.navigateQuickLinkAndSanity(label);
        }
    });


    test('TC-006 Logo click returns to Home', async () => {
        for (const [tab, expectedUrl] of cases) {
            await headerFooterPage.navigateToTab(tab);
            await expect(page).toHaveURL(expectedUrl);
            await expect(page).not.toHaveURL(HOME_URL_REGEX);
            await headerFooterPage.backToHomeTab();
            await expect(page).toHaveURL(SITE.baseUrl);
        }

    });


    test('TC-007 Header amount is visible', async () => {
        for (const [tab] of cases) {
            await headerFooterPage.navigateToTab(tab);
            await headerFooterPage.verifyTotalItemsInCart(CART.empty.headerAmount);
        }


    })

})

