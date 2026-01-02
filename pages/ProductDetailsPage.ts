import { expect, Locator, Page } from "@playwright/test";
import BasePage from "./BasePage";

export default class ProductDetailsPage extends BasePage {

    private productBreadCrumb: Locator;
    private productTitle: Locator;
    private productPrice: Locator;
    private salePrice: Locator;
    private regularPrice: Locator
    private addToCartButton: Locator;
    private noticeMessage: Locator;
    private quantityField: Locator;
    private viewCartButton: Locator;
    private linkCategoryButton: Locator;

    constructor(page: Page) {
        super(page)
        this.productBreadCrumb = page.locator(".woocommerce-breadcrumb");
        this.productTitle = page.locator(".product_title.entry-title");
        this.productPrice = page.locator(".summary.entry-summary p.price ins .woocommerce-Price-amount");
        this.salePrice = page.locator(".summary.entry-summary p.price ins .woocommerce-Price-amount");
        this.regularPrice = page.locator(".summary.entry-summary p.price .woocommerce-Price-amount");
        this.addToCartButton = page.locator(".single_add_to_cart_button.button.alt");
        this.quantityField = page.locator(".input-text.qty.text");
        this.noticeMessage = page.locator(".woocommerce-notices-wrapper");
        this.viewCartButton = page.locator(".woocommerce-notices-wrapper .button.wc-forward");
        this.linkCategoryButton = page.locator(".entry-summary > nav > a:nth-child(2)");
    }

    async getProductTitleText(): Promise<string> {
        return await this.getElementText(this.productTitle);
    }

    async verifyProductTitleText(expectedTitle: string): Promise<void> {
        const actualTitle = await this.getProductTitleText();
        expect(actualTitle).toEqual(expectedTitle);
    }

    async getProductBreadCrumbText(): Promise<string> {
        return await this.getElementText(this.productBreadCrumb);
    }

    async verifyProductBreadCrumbText(expectedTitleText: string): Promise<void> {
        const expectedBreadCrumbText = `Home / Men / ${expectedTitleText}`;
        const actualBreadCrumbText = await this.getProductBreadCrumbText();
        const normalize = (text: string) =>
            text
                .replace(/\u00A0/g, ' ')   // converts non-breaking space in normal space
                .replace(/\s+/g, ' ')      // colapses multiple spaces
                .trim();
        expect(normalize(actualBreadCrumbText)).toBe(normalize(expectedBreadCrumbText));
    }

    async getProductCurrentPriceText(): Promise<string> {
        const saleCount = await this.salePrice.count();

        if (saleCount > 0) {
            return (await this.getElementText(this.salePrice.first())).trim();
        }
        return (await this.getElementText(this.regularPrice.first())).trim();
    }


    async verifyPriceFormat(currencySymbol: string = "₪"): Promise<void> {
        const priceText = (await this.getProductCurrentPriceText()).trim();

        // 1) currency symbol exists
        expect(priceText).toContain(currencySymbol);

        // 2) consistent decimals (example: 61.00)
        expect(priceText).toMatch(/\d+\.\d{2}/);
    }


    async getProductCurrentPriceValue(): Promise<number> {
        const text = await this.getProductCurrentPriceText(); // "120.00 ₪"
        const numeric = text.replace(/[^\d.,]/g, '').replace(',', '');
        return Number(numeric); // 120
    }

    async verifyProductCurrentPriceValue(expectedValue: number): Promise<void> {
        const actualValue = await this.getProductCurrentPriceValue();
        expect(actualValue).toEqual(expectedValue);
    }

    async verifyProductDetailsInfo(expectedTitle: string, expectedValue: number): Promise<void> {
        await this.verifyProductTitleText(expectedTitle);
        await this.verifyProductBreadCrumbText(expectedTitle);
        await this.verifyProductCurrentPriceValue(expectedValue);
    }

    async verifyAddToCartButtonVisible(): Promise<void> {
        await this.isElementVisible(this.addToCartButton)
    }

    async verifyAddToCartButtonEnable(): Promise<void> {
        await this.isElementEnable(this.addToCartButton)
    }

    async verifyAddToCartButtonEnableAndVisible(): Promise<void> {
        await this.verifyAddToCartButtonVisible();
        await this.verifyAddToCartButtonEnable();
    }

    async addToCart(): Promise<void> {
        await this.clickElement(this.addToCartButton);
    }

    async getNoticeMessageText(): Promise<string> {
        return await this.getElementText(this.noticeMessage);
    }

    async verifyNoticeMessageText(expectedText: string): Promise<void> {
        const expectedNoticeMessage = `VIEW CART\n“${expectedText}” has been added to your cart.`
        const actualNoticeMessage = await this.getNoticeMessageText();
        expect(actualNoticeMessage).toContain(expectedNoticeMessage);
    }

    async incrementQuantity(quantity: number): Promise<void> {
        await this.hoverElement(this.quantityField);
        for (let index = 0; index < quantity; index++) {
            await this.quantityField.press("ArrowUp")
        }
    }

    async decrementQuantity(quantity: number): Promise<void> {
        await this.hoverElement(this.quantityField);
        for (let index = 0; index < quantity; index++) {
            await this.quantityField.press("ArrowDown")
        }
    }

    async getQuantityText(): Promise<string> {
        return this.getElementInputValue(this.quantityField);
    }

    async verifyQuantityText(expectedQuantity: string): Promise<void> {
        const actualQuantity = await this.getQuantityText();
        expect(actualQuantity).toEqual(expectedQuantity);
    }

    async viewCart(): Promise<void> {
        await this.clickElement(this.viewCartButton);
    }

    async goToCategoryByBreadCrumb(): Promise<void> {
        await this.clickElement(this.linkCategoryButton);
    }




}