import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from '../pages/HeaderFooterPage';
import { LinkKey } from "../pages/HeaderFooterPage";

const cases: Array<[string, RegExp]> = [
    ['STORE', /atid\.store\/store/i],
    ['MEN', /product-category\/men/i],
    ['WOMEN', /product-category\/women/i],
    ['ACCESSORIES', /product-category\/accessories/i],
    ['ABOUT', /about/i],
    ['CONTACT US', /contact-us/i],
];

const quickLinks: ReadonlyArray<readonly [LinkKey, RegExp]> = [
    ['CART', /atid\.store\/cart/i],
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
        await page.goto("https://atid.store/");
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
            await expect(page).toHaveURL("https://atid.store/");

        }
    })

    test('TC-002 Cart badge shows 0 on clean session', async () => {
        for (const [tab] of cases) {
            await headerFooterPage.navigateToTab(tab);
            await headerFooterPage.verifyQuantityItemsInCart("0");
            await page.reload();
            await headerFooterPage.verifyQuantityItemsInCart("0")
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
            await expect(page).not.toHaveURL(/atid\.store\/?$/i);
            await headerFooterPage.backToHomeTab();
            await expect(page).toHaveURL("https://atid.store/");
        }

    });


    test('TC-007 Header amount is visible', async () => {
        for (const [tab] of cases) {
            await headerFooterPage.navigateToTab(tab);
            await headerFooterPage.verifyTotalItemsInCart("0.00");
        }


    })

})

