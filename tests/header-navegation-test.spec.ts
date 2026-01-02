import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from '../pages/HeaderFooterPage';

// Pares <tab, patrón URL esperado>
const cases: Array<[string, RegExp]> = [
    ['STORE', /atid\.store\/store/i],
    ['MEN', /product-category\/men/i],
    ['WOMEN', /product-category\/women/i],
    ['ACCESSORIES', /product-category\/accessories/i],
    ['ABOUT', /about/i],
    ['CONTACT US', /contact-us/i],
];



let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;


test.describe('test suite tab navegation ', () => {
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
    });

    test('test01', async () => {

        await headerFooterPage.navigateToTab("STORE");
        await headerFooterPage.goToSelectedTab("CONTACT US");
       
        for (const [tab, expectedUrl] of cases) {
            await headerFooterPage.navigateToTab(tab);
            await expect(page).toHaveURL(expectedUrl);
        } 


    })

    test('test02 Cart badge shows 0 on clean session', async () => {
            await headerFooterPage.verifyQuantityItemsInCart("0");
            await page.reload();
            await headerFooterPage.verifyQuantityItemsInCart("0")
            
        })
        

    

})


