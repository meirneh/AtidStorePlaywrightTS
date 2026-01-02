import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import AboutPage from "../pages/AboutPage";
import ContactUsPage from "../pages/ContacUsPage";
import ProductDetailsPage from '../pages/ProductDetailsPage';

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage;
let aboutPage: AboutPage;
let contactUsPage: ContactUsPage;
let productDetailsPage: ProductDetailsPage;

// Pares <tab, patrón URL esperado>
type Case = {
    tab: string;
    url: RegExp;
    pageType: "category" | "about" | "contact";
    // heading?: string;
    breadcrumb?: string;
};

const cases: Case[] = [
    { tab: "STORE", url: /\/store\/?$/, pageType: "category", breadcrumb: "Store" },
    { tab: "MEN", url: /\/product-category\/men\/?$/, pageType: "category", breadcrumb: "Men" },
    { tab: "WOMEN", url: /\/product-category\/women\/?$/, pageType: "category", breadcrumb: "Women" },
    { tab: "ACCESSORIES", url: /\/product-category\/accessories\/?$/, pageType: "category", breadcrumb: "Accessories" },
    { tab: "ABOUT", url: /\/about\/?$/, pageType: "about" },
    { tab: "CONTACT US", url: /\/contact-us\/?$/, pageType: "contact" },
];

test.describe('Header/Footer Component Reuse — cross-page header/footer consistency', () => {
    test.beforeEach(async () => {
        browser = await chromium.launch({ channel: "chrome", slowMo: 500 });
        context = await browser.newContext();
        page = await context.newPage();
        await page.goto("https://atid.store/");
        headerFooterPage = new HeaderFooterPage(page);
        categoryPage = new CategoryPage(page);
        aboutPage = new AboutPage(page);
        contactUsPage = new ContactUsPage(page);
        productDetailsPage = new ProductDetailsPage(page);
    });

    test.afterAll(async () => {
        await context?.close();
        await page?.close();
    })

    test('TC-059 Header appears on all main pages', async () => {

        await headerFooterPage.navigateToTab("STORE");
        await headerFooterPage.goToSelectedTab("CONTACT US");
        for (const c of cases) {
            await headerFooterPage.navigateToTab(c.tab);
            await expect(page).toHaveURL(c.url);
            if (c.breadcrumb) {
                await categoryPage.verifyBreadCrumbCategoryText(c.breadcrumb)
            }

            if (c.pageType === "about") {
                await aboutPage.verifyAboutUsTextTitle();
            }

            if (c.pageType === "contact") {
                await contactUsPage.verifyContactUsTextTitle();
            }
        }

    })

    test('TC-061 CartBadge/amount present across pages ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Green Shoes");
        await productDetailsPage.addToCart();
        for (const c of cases) {
            await headerFooterPage.navigateToTab(c.tab);
            await headerFooterPage.verifyQuantityItemsInCart("1");
        }
    })

    test('TC-062 Negative header actions do not break page state ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await headerFooterPage.clickSearch();
        await headerFooterPage.verifySearchFieldVisible();
        for (const c of cases) {
            await headerFooterPage.navigateToTab(c.tab);
            await expect(page).toHaveURL(c.url);
            await headerFooterPage.verifySearchBarIsNotVisibleAndDisable();
        }
    })



})
