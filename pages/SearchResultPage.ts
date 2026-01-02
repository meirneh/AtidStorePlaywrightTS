import { expect, Locator, Page, ConsoleMessage } from "@playwright/test";
import BasePage from "./BasePage";


export default class SearchResultPage extends BasePage {

    private resultsTitle: Locator;
    private containerItemResult: Locator;
    private errorMessage: Locator;
    private searchField: Locator;
    private searchButton: Locator;

    constructor(page: Page) {
        super(page)
        this.resultsTitle = page.locator(".page-title.ast-archive-title");
        this.containerItemResult = page.locator(".post-content.ast-col-md-12");
        this.errorMessage = page.locator(".page-content p");
        this.searchField = page.locator(".page-content .search-field");
        this.searchButton = page.locator(".page-content .search-submit");

        
    }

    async getResultsTitleText(): Promise<string> {
        return await this.getElementText(this.resultsTitle);
    }

    async verifyResultsTitleText(expectedText: string): Promise<void> {
        const expectedResult = `Search Results for: ${expectedText}`;
        expect(await this.getResultsTitleText()).toEqual(expectedResult);
    }

    async getCountResults(): Promise<number> {
        return await this.countElements(this.containerItemResult);
    }

    async verifyCountResults(expectedNumber: number): Promise<void> {
        expect (await this.getCountResults()).toEqual(expectedNumber);

    }

    async getErrorMessage(): Promise<string> {
        return await this.getElementText(this.errorMessage);
    }

    async verifyErrorMessage(): Promise<void> {
        const expectedMessage = "Sorry, but nothing matched your search terms. Please try again with some different keywords.";
        const actualMessage = await this.getErrorMessage();
        expect(actualMessage).toEqual(expectedMessage);

    }

    async fillSearchInputValue(searchValue: string): Promise<void> {
        await this.fillText(this.searchField, searchValue);
    }

    async clickSearchButton(): Promise<void> {
        await this.clickElement(this.searchButton);
    }

    async searchValue(searchValue: string): Promise<void> {
        await this.fillSearchInputValue(searchValue);
        await this.clickSearchButton();
    }


}