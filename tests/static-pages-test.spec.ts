import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import AboutPage from "../pages/AboutPage";
import ContactUsPage from '../pages/ContacUsPage';

import { SITE } from "../utils/test-data/site";
import { STATIC_PAGES } from "../utils/test-data/static-pages";

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let aboutPage: AboutPage;
let contactUsPage: ContactUsPage;

const checks = [
    () => contactUsPage.verifyNameFieldIsVisible(),
    () => contactUsPage.verifySubjectFieldIsVisible(),
    () => contactUsPage.verifyEmailFieldIsVisible(),
    () => contactUsPage.verifyMessageFieldIsVisible(),
];

const verifications = [
    () => contactUsPage.verifyNameFieldErrorMessage(),
    () => contactUsPage.verifyEmailFieldErrorMessage(),
    () => contactUsPage.verifyMessageFieldErrorMessage(),
];


test.describe('Static pages: About & Contact (footer + contact form)', () => {
    test.beforeEach(async () => {
        browser = await chromium.launch({ channel: "chrome", slowMo: 500 });
        context = await browser.newContext();
        page = await context.newPage();
        await page.goto(SITE.baseUrl);
        headerFooterPage = new HeaderFooterPage(page);
        aboutPage = new AboutPage(page);
        contactUsPage = new ContactUsPage(page);
    });

    test.afterAll(async () => {
        await context?.close();
        await page?.close();
    })

    test('TC-049 About page opens from footer', async () => {
        await headerFooterPage.navigateToQuickLink(STATIC_PAGES.quickLinks.about);
        await headerFooterPage.verifyQuickLinkUrl(STATIC_PAGES.quickLinks.about);
        await aboutPage.verifyAboutPageUrl(STATIC_PAGES.urls.about);
        await aboutPage.verifyAboutUsTextTitle();
    })

    test('TC-050 Contact page opens from footer', async () => {
        await headerFooterPage.navigateToQuickLink(STATIC_PAGES.quickLinks.contactUs);
        await headerFooterPage.verifyQuickLinkUrl(STATIC_PAGES.quickLinks.contactUs);
        await contactUsPage.verifyContactUsTextTitle();
        for (const check of checks) {
            await check();
        }

    })

    test('TC-051 Negative: Contact submit with empty required fields', async () => {
        await headerFooterPage.navigateToQuickLink(STATIC_PAGES.quickLinks.contactUs);
        await contactUsPage.clickSendMessageButton();
        for (const verification of verifications) {
            await verification();
        }
    })

    test('TC-052 Contact form successful submit', async () => {
        await headerFooterPage.navigateToQuickLink(STATIC_PAGES.quickLinks.contactUs);;
        await contactUsPage.sendMessage(
            STATIC_PAGES.contactForm.valid.name,
            STATIC_PAGES.contactForm.valid.subject,
            STATIC_PAGES.contactForm.valid.email,
            STATIC_PAGES.contactForm.valid.message
        );
        await contactUsPage.verifyConfirmationMessage();

    })

})
