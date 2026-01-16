import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from '../pages/HeaderFooterPage';

import { SITE } from "../utils/test-data/site";
import { NAV } from "../utils/test-data/navigation";
import { CART } from "../utils/test-data/cart";
import { HEADER_NAVIGATION } from "../utils/test-data/header-navigation";

// Pares <tab, patrón URL esperado>
/* const cases: Array<[string, RegExp]> = [
    ['STORE', /atid\.store\/store/i],
    ['MEN', /product-category\/men/i],
    ['WOMEN', /product-category\/women/i],
    ['ACCESSORIES', /product-category\/accessories/i],
    ['ABOUT', /about/i],
    ['CONTACT US', /contact-us/i],
]; */

const cases = HEADER_NAVIGATION.cases;

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;


test.describe('Header navigation tabs and cart badge ', () => {
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
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        // await headerFooterPage.goToSelectedTab("CONTACT US");
        await headerFooterPage.goToSelectedTab(NAV.tabs.contactUs);

        for (const [tab, expectedUrl] of cases) {
            await headerFooterPage.navigateToTab(tab);
            await expect(page).toHaveURL(expectedUrl);
        }


    })

    test('TC-002 Cart badge shows 0 on clean session', async () => {
        await headerFooterPage.verifyQuantityItemsInCart(CART.empty.badgeCount);
        await page.reload();
        await headerFooterPage.verifyQuantityItemsInCart(CART.empty.badgeCount);

    })




})


