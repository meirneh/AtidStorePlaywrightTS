import { test, expect } from "../utils/fixtures/baseTest";
import type HeaderFooterPage from "../pages/HeaderFooterPage";
import type AboutPage from "../pages/AboutPage";
import type ContactUsPage from "../pages/ContacUsPage";

import { STATIC_PAGES } from "../utils/test-data/static-pages";

test.describe("Static pages: About & Contact (footer + contact form)", () => {
  const openAboutFromFooterAndVerify = async (headerFooterPage: HeaderFooterPage, aboutPage: AboutPage ) => {
    await headerFooterPage.navigateToQuickLink(STATIC_PAGES.quickLinks.about);
    await headerFooterPage.verifyQuickLinkUrl(STATIC_PAGES.quickLinks.about);
    await aboutPage.verifyAboutPageUrl(STATIC_PAGES.urls.about);
    await aboutPage.verifyAboutUsTextTitle();
  };

  const openContactFromFooter = async (headerFooterPage: HeaderFooterPage) => {
    await headerFooterPage.navigateToQuickLink(STATIC_PAGES.quickLinks.contactUs);
    await headerFooterPage.verifyQuickLinkUrl(STATIC_PAGES.quickLinks.contactUs);
  };

  const verifyContactFormFieldsVisible = async (contactUsPage: ContactUsPage) => {
    const checks = [
      () => contactUsPage.verifyNameFieldIsVisible(),
      () => contactUsPage.verifySubjectFieldIsVisible(),
      () => contactUsPage.verifyEmailFieldIsVisible(),
      () => contactUsPage.verifyMessageFieldIsVisible(),
    ];

    for (const check of checks) {
      await check();
    }
  };

  const submitEmptyContactFormAndVerifyRequiredErrors = async (page: import("@playwright/test").Page,contactUsPage: ContactUsPage ) => {
    await verifyContactFormFieldsVisible(contactUsPage);
    const sendButton = page.locator("#wpforms-submit-15");
    await sendButton.scrollIntoViewIfNeeded();
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeEnabled();
    await sendButton.click();
    await expect(page.locator("#wpforms-15-field_0-error")).toBeVisible({ timeout: 10_000 });

    const verifications = [
      () => contactUsPage.verifyNameFieldErrorMessage(),
      () => contactUsPage.verifyEmailFieldErrorMessage(),
      () => contactUsPage.verifyMessageFieldErrorMessage(),
    ];

    for (const verification of verifications) {
      await verification();
    }
  };

  const submitValidContactFormAndVerifySuccess = async (contactUsPage: ContactUsPage) => {
    await contactUsPage.sendMessage(
      STATIC_PAGES.contactForm.valid.name,
      STATIC_PAGES.contactForm.valid.subject,
      STATIC_PAGES.contactForm.valid.email,
      STATIC_PAGES.contactForm.valid.message
    );
    await contactUsPage.verifyConfirmationMessage();
  };

  test.beforeEach(async ({ goHome }) => {
   await goHome(); 
  })
  
  test("TC-049 About page opens from footer", async ({headerFooterPage, aboutPage}) => {
    await openAboutFromFooterAndVerify(headerFooterPage, aboutPage);
  });

  test("TC-050 Contact page opens from footer", async ({headerFooterPage, contactUsPage}) => {
    await openContactFromFooter(headerFooterPage);
    await contactUsPage.verifyContactUsTextTitle();
    await verifyContactFormFieldsVisible(contactUsPage);
  });

  test("TC-051 Negative: Contact submit with empty required fields", async ({page,headerFooterPage, contactUsPage}) => {
    await openContactFromFooter(headerFooterPage);
    await submitEmptyContactFormAndVerifyRequiredErrors(page, contactUsPage);
  });

  test("TC-052 Contact form successful submit", async ({headerFooterPage, contactUsPage}) => {
    await openContactFromFooter(headerFooterPage);
    await submitValidContactFormAndVerifySuccess(contactUsPage);
  });
});

