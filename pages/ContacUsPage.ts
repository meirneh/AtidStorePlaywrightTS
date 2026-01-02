import { expect, Locator, Page } from "@playwright/test";
import BasePage from "./BasePage";

export default class ContactUsPage extends BasePage {
    protected contactUsTitle: Locator;
    protected nameField: Locator;
    protected subjectField: Locator;
    protected emailField: Locator;
    protected messageField: Locator;
    protected sendMessageButton: Locator;
    protected nameFieldError: Locator;
    protected emailFieldError: Locator;
    protected messageFieldError: Locator;
    protected confirmationSendedMessage: Locator;

    constructor(page: Page) {
        super(page)
        this.contactUsTitle = page.locator(".elementor-widget-container h1");
        this.nameField = page.locator("#wpforms-15-field_0");
        this.subjectField = page.locator("#wpforms-15-field_5");
        this.emailField = page.locator("#wpforms-15-field_4");
        this.messageField = page.locator("#wpforms-15-field_2");
        this.sendMessageButton = page.locator("#wpforms-submit-15");
        this.nameFieldError = page.locator("#wpforms-15-field_0-error");
        this.emailFieldError = page.locator("#wpforms-15-field_4-error");
        this.messageFieldError = page.locator("#wpforms-15-field_2-error");
        this.confirmationSendedMessage = page.locator("#wpforms-confirmation-15");
    }

    async verifyContactUsPageUrl(expectedUrl: string): Promise<void> {
        await this.verifyCurrentUrlIs(expectedUrl);
    }

    async getContactUsTextTitle(): Promise<string> {
        return await this.getElementText(this.contactUsTitle);
    }

    async verifyContactUsTextTitle(): Promise<void> {
        const expectedText = "Contact Us";
        expect(await this.getContactUsTextTitle()).toEqual(expectedText);
    }

    async verifyNameFieldIsVisible(): Promise<void> {
        await this.isElementVisible(this.nameField)
    }
    async verifySubjectFieldIsVisible(): Promise<void> {
        await this.isElementVisible(this.subjectField)
    }
    async verifyEmailFieldIsVisible(): Promise<void> {
        await this.isElementVisible(this.emailField)
    }

    async verifyMessageFieldIsVisible(): Promise<void> {
        await this.isElementVisible(this.messageField)
    }

    async verifyFieldIsVisible(field: Locator): Promise<void> {
        await expect(field).toBeVisible();
    }

    async fillNameField(name: string): Promise<void> {
        await this.fillText(this.nameField, name);
    }

    async fillSubjectField(subject: string): Promise<void> {
        await this.fillText(this.subjectField, subject);
    }

    async fillEmailField(email: string): Promise<void> {
        await this.fillText(this.emailField, email);
    }

    async fillMessageField(message: string): Promise<void> {
        await this.fillText(this.messageField, message);
    }

    async clickSendMessageButton(): Promise<void> {
        await this.clickElement(this.sendMessageButton);
    }

    async sendMessage(name: string, subject: string, email: string, message: string): Promise<void> {
        await this.fillNameField(name);
        await this.fillSubjectField(subject);
        await this.fillEmailField(email);
        await this.fillMessageField(message);
        await this.clickSendMessageButton();
    }

    private async verifyRequiredFieldError(errorLocator: Locator): Promise<void> {
        await expect(errorLocator).toHaveText('This field is required.');
    }

    async verifyNameFieldErrorMessage(): Promise<void> {
        await this.verifyRequiredFieldError(this.nameFieldError);
    }

    async verifyEmailFieldErrorMessage(): Promise<void> {
        await this.verifyRequiredFieldError(this.emailFieldError);
    }

    async verifyMessageFieldErrorMessage(): Promise<void> {
        await this.verifyRequiredFieldError(this.messageFieldError);
    }

    async getConfirmationMessage(): Promise<string> {
        return await this.getElementText(this.confirmationSendedMessage);
    }

    async verifyConfirmationMessage(): Promise<void> {
        const actualMessage = await this.getConfirmationMessage();
        const expectedMessage = "Thanks for contacting us! We will be in touch with you shortly."
        expect (actualMessage).toEqual(expectedMessage);
    }


}