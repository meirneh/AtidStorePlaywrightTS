import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import AboutPage from "../pages/AboutPage";
import ContactUsPage from "../pages/ContacUsPage";
import ProductDetailsPage from '../pages/ProductDetailsPage';

import { SITE } from "../utils/test-data/site";
import { NAV } from "../utils/test-data/navigation";
import { CART } from "../utils/test-data/cart";
import { PRODUCTS } from "../utils/test-data/products";
import { HEADER_FOOTER_COMPONENT_REUSE } from "../utils/test-data/header-footer-component-reuse";

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage;
let aboutPage: AboutPage;
let contactUsPage: ContactUsPage;
let productDetailsPage: ProductDetailsPage;

const cases = HEADER_FOOTER_COMPONENT_REUSE.cases;

test.describe('Header/Footer Component Reuse — cross-page header/footer consistency', () => {
    test.beforeEach(async () => {
        browser = await chromium.launch({ channel: "chrome", slowMo: 500 });
        context = await browser.newContext();
        page = await context.newPage();
        await page.goto(SITE.baseUrl);
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
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await headerFooterPage.goToSelectedTab(NAV.tabs.contactUs);
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
        await headerFooterPage.navigateToTab(NAV.tabs.store);
        await categoryPage.selectProductByName(PRODUCTS.atidGreenShoes.name);
        await productDetailsPage.addToCart();
        for (const c of cases) {
            await headerFooterPage.navigateToTab(c.tab);
            await headerFooterPage.verifyQuantityItemsInCart(String(CART.quantities.one));
        }
    })

    test('TC-062 Negative header actions do not break page state ', async () => {
         await headerFooterPage.navigateToTab(NAV.tabs.store);
        await headerFooterPage.clickSearch();
        await headerFooterPage.verifySearchFieldVisible();
        for (const c of cases) {
            await headerFooterPage.navigateToTab(c.tab);
            await expect(page).toHaveURL(c.url);
            await headerFooterPage.verifySearchBarIsNotVisibleAndDisable();
        }
    })



})
