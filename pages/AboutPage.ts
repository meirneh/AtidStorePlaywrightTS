import { expect, Locator, Page } from "@playwright/test";
import BasePage from "./BasePage";

export default class AboutPage extends BasePage {
    protected aboutUsTitle: Locator;
    constructor(page: Page) {
        super(page)
        this.aboutUsTitle = page.locator(".elementor-widget-container h1");


    }

    async verifyAboutPageUrl(expectedUrl: string): Promise<void> {
        await this.verifyCurrentUrlIs(expectedUrl);
    }

    async getAboutUsTextTitle(): Promise<string> {
        return await this.getElementText(this.aboutUsTitle);
    }

    async verifyAboutUsTextTitle(): Promise<void> {
        const expectedText = "About Us";
        expect(await this.getAboutUsTextTitle()).toEqual(expectedText);
    }
}