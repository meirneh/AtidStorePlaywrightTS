import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import AboutPage from "../pages/AboutPage";
import ContactUsPage from '../pages/ContacUsPage';

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


test.describe('About / Contact / Static Pages Footer Navigation and Contact Form', () => {
    test.beforeEach(async () => {
        browser = await chromium.launch({ channel: "chrome", slowMo: 500 });
        context = await browser.newContext();
        page = await context.newPage();
        await page.goto("https://atid.store/");
        headerFooterPage = new HeaderFooterPage(page);
        aboutPage = new AboutPage(page);
        contactUsPage = new ContactUsPage(page);
    });

    test.afterAll(async () => {
        await context?.close();
        await page?.close();
    })

    test('TC-049 About page opens from footer', async () => {
        await headerFooterPage.navigateToQuickLink("ABOUT");
        await headerFooterPage.verifyQuickLinkUrl("ABOUT");
        await aboutPage.verifyAboutPageUrl("https://atid.store/about/");
        await aboutPage.verifyAboutUsTextTitle();
    })

    test('TC-050 Contact page opens from footer', async () => {
        await headerFooterPage.navigateToQuickLink("CONTACT US");
        await headerFooterPage.verifyQuickLinkUrl("CONTACT US");
        await contactUsPage.verifyContactUsTextTitle();
        for (const check of checks) {
            await check();
        }

    })

    test('TC-051 Negative: Contact submit with empty required fields', async () => {
        await headerFooterPage.navigateToQuickLink("CONTACT US");
        await contactUsPage.clickSendMessageButton();
        for (const verification of verifications) {
            await verification();
        }
    })

    test('TC-052 Contact form successful submit', async () => {
         await headerFooterPage.navigateToQuickLink("CONTACT US");
         await contactUsPage.sendMessage("Haim","Test subject","haim@gmail.com","test message");
         await contactUsPage.verifyConfirmationMessage();
        
    })
    
})
