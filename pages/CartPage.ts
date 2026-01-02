import { expect, Locator, Page } from "@playwright/test";
import BasePage from "./BasePage";
type ExpectedPrice = { term: string; expectedPrice: number };
type ExpectedQty = { term: string; expectedQty: number };
type ExpectedSubtotal = { term: string; expectedSubtotal: number };
type ExpectedCartItem = ExpectedPrice & ExpectedQty & ExpectedSubtotal;

export default class CartPage extends BasePage {
    protected cartItemContainer: Locator;
    protected productName: Locator;
    protected productPrice: Locator;
    protected inputQtyText: Locator;
    protected productSubTotal: Locator;
    protected updateCartButton: Locator;
    protected removeProductButton: Locator;
    protected cartSubTotal: Locator;
    protected shipingLocalPickupButton: Locator;
    protected shippingExpressButton: Locator;
    protected shippingRegisteredMailButton: Locator;
    protected total: Locator;
    protected checkoutButton: Locator;
    protected emptyCartMessage: Locator;
    protected couponCodeField: Locator;
    protected applyCouponButton: Locator;
    protected cartDiscountCoupon: Locator;
    protected errorMessageCouponNotExist: Locator;
    protected removeCouponButton: Locator;

    constructor(page: Page) {
        super(page)
        this.cartItemContainer = page.locator(".woocommerce-cart-form__cart-item.cart_item")
        this.productName = page.locator(".product-name a");
        this.productPrice = page.locator("td.product-price .woocommerce-Price-amount");
        this.inputQtyText = page.locator(".input-text.qty.text");
        this.productSubTotal = page.locator("td.product-subtotal .woocommerce-Price-amount");
        this.updateCartButton = page.locator("button[name='update_cart']");
        this.removeProductButton = page.locator("td.product-remove");
        this.cartSubTotal = page.locator(".cart-subtotal td >span");
        this.shipingLocalPickupButton = page.locator("#shipping_method_0_local_pickup1");
        this.shippingExpressButton = page.locator("#shipping_method_0_flat_rate3");
        this.shippingRegisteredMailButton = page.locator("#shipping_method_0_flat_rate3");
        this.total = page.locator("tr.order-total  td > strong >span");
        this.checkoutButton = page.locator(".wc-proceed-to-checkout");
        this.emptyCartMessage = page.locator(".cart-empty.woocommerce-info");
        this.couponCodeField = page.locator("#coupon_code");
        this.applyCouponButton = page.locator("[name='apply_coupon']");
        this.cartDiscountCoupon = page.locator("tr.cart-discount.coupon-kuku > td > span");
        this.errorMessageCouponNotExist = page.locator("ul.woocommerce-error");
        this.removeCouponButton = page.locator(".woocommerce-remove-coupon");
    }

    async getCountProducts(): Promise<number> {
        await this.waitForElementVisibility(this.cartItemContainer.first());
        return this.countElements(this.cartItemContainer);
    }

    async getProductNames(): Promise<string[]> {
        await this.waitForElementVisibility(this.productName.first(), 2000);
        const count = await this.productName.count();
        const names: string[] = [];
        for (let i = 0; i < count; i++) {
            const name = await this.getElementText(this.productName.nth(i));
            names.push(name.trim());
        }
        return names;
    }

    async selectProductByName(productName: string): Promise<void> {
        const productTitle = this.productName.filter({ hasText: productName }).first();
        await this.waitForElementVisibility(productTitle, 2000);
        await this.clickElement(productTitle);
    }

    async verifyProductContain(term: string | string[]): Promise<void> {
        const names = await this.getProductNames();
        expect(names.length).toBeGreaterThan(0);
        const terms = Array.isArray(term) ? term : [term];
        for (const t of terms) {
            const searchTerm = t.toLowerCase();
            const found = names.some(n => n.toLowerCase().includes(searchTerm));
            expect(found).toBeTruthy();
        }
    }

    async getProductsPrice(): Promise<number[]> {
        const count = await this.cartItemContainer.count();
        const prices: number[] = [];

        for (let i = 0; i < count; i++) {
            const product = this.cartItemContainer.nth(i);
            const priceLocator = product
                .locator("td.product-price")
                .last(); // ignora el tachado si hay oferta
            const rawText = await this.getElementText(priceLocator);
            const numeric = parseFloat(rawText.replace(/[^\d.]/g, ""));
            prices.push(numeric);

        }

        return prices;

    }

    private parsePrice(text: string): number {
        const normalized = text.replace(/[^\d.,]/g, "").replace(/,/g, "");
        const value = Number(normalized);
        if (Number.isNaN(value)) throw new Error(`Could not parse price from: "${text}"`);
        return value;
    }

    async getCartNameToUnitPriceMap(): Promise<Record<string, number>> {
        await this.waitForElementVisibility(this.cartItemContainer.first(), 5000);

        const rowsCount = await this.cartItemContainer.count();
        const map: Record<string, number> = {};

        for (let i = 0; i < rowsCount; i++) {
            const row = this.cartItemContainer.nth(i);

            const nameText = (await row.locator(".product-name a").innerText()).trim();
            const priceText = (await row.locator("td.product-price .woocommerce-Price-amount").innerText()).trim();

            map[nameText] = this.parsePrice(priceText);
        }

        return map;
    }
    async getCartUnitPriceTextByName(productName: string): Promise<string> {
        await this.waitForElementVisibility(this.cartItemContainer.first(), 5000);

        const rowsCount = await this.cartItemContainer.count();

        for (let i = 0; i < rowsCount; i++) {
            const row = this.cartItemContainer.nth(i);

            const nameText = (await row.locator(".product-name a").innerText()).trim();

            if (nameText.toLowerCase().includes(productName.trim().toLowerCase())) {
                const raw = (await row.locator("td.product-price .woocommerce-Price-amount").innerText()).trim();
                const normalized = raw.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
                if (normalized.includes("₪")) {
                    const amount = normalized.replace(/[^\d.,]/g, "").replace(/,/g, "");
                    return `${amount} ₪`;
                }

                return normalized;
            }
        }

        throw new Error(`Product not found in cart: "${productName}"`);
    }


    async verifyUnitPrices(input: ExpectedPrice | ExpectedPrice[]): Promise<void> {
        const expectedList = Array.isArray(input) ? input : [input];

        const nameToPrice = await this.getCartNameToUnitPriceMap();
        const names = Object.keys(nameToPrice);

        expect(names.length).toBeGreaterThan(0);

        for (const { term, expectedPrice } of expectedList) {
            const matchedName = names.find(n => n.toLowerCase().includes(term.toLowerCase()));
            expect(matchedName, `No product found in cart containing term: "${term}"`).toBeTruthy();

            const actual = nameToPrice[matchedName!];

            // ✅ force numeric expected (handles accidental string inputs)
            const expected = typeof expectedPrice === "string" ? Number(expectedPrice) : expectedPrice;

            expect(
                Number.isFinite(actual),
                `Actual unit price is not a finite number for "${matchedName}". Got: ${actual}`
            ).toBeTruthy();

            expect(
                Number.isFinite(expected),
                `Expected unit price is not a finite number for "${matchedName}". Got: ${expectedPrice}`
            ).toBeTruthy();

            expect(actual, `Price mismatch for "${matchedName}"`).toBeCloseTo(expected, 2);
        }
    }


    async getCartNameToQtyMap(): Promise<Record<string, number>> {
        await this.waitForElementVisibility(this.cartItemContainer.first(), 2000);

        const rowsCount = await this.cartItemContainer.count();
        const map: Record<string, number> = {};

        for (let i = 0; i < rowsCount; i++) {
            const row = this.cartItemContainer.nth(i);

            const nameText = (await row.locator(".product-name a").innerText()).trim();
            const qtyValue = await row.locator(".input-text.qty.text").inputValue();

            map[nameText] = Number(qtyValue);
        }

        return map;
    }

    async verifyQuantities(input: ExpectedQty | ExpectedQty[]): Promise<void> {
        const expectedList = Array.isArray(input) ? input : [input];

        const nameToQty = await this.getCartNameToQtyMap();
        const names = Object.keys(nameToQty);

        expect(names.length).toBeGreaterThan(0);

        for (const { term, expectedQty } of expectedList) {
            const matchedName = names.find(n => n.toLowerCase().includes(term.toLowerCase()));
            expect(matchedName, `No product found in cart containing term: "${term}"`).toBeTruthy();

            const actualQty = nameToQty[matchedName!];
            expect(actualQty, `Qty mismatch for "${matchedName}"`).toBe(expectedQty);
        }
    }

    async getTotalQuantityInCart(): Promise<number> {
        const nameToQty = await this.getCartNameToQtyMap();
        return Object.values(nameToQty).reduce((sum, qty) => sum + qty, 0);
    }


    async verifyLineSubtotals(input: ExpectedSubtotal | ExpectedSubtotal[]): Promise<void> {
        const expectedList = Array.isArray(input) ? input : [input];

        await this.waitForElementVisibility(this.cartItemContainer.first(), 5000);

        const rowsCount = await this.cartItemContainer.count();
        expect(rowsCount).toBeGreaterThan(0);

        for (const { term, expectedSubtotal } of expectedList) {
            let found = false;

            for (let i = 0; i < rowsCount; i++) {
                const row = this.cartItemContainer.nth(i);

                const name = (await row.locator(".product-name a").innerText()).trim();
                if (!name.toLowerCase().includes(term.toLowerCase())) continue;

                const subtotalText = (await row
                    .locator("td.product-subtotal .woocommerce-Price-amount")
                    .innerText()).trim();

                const actualSubtotal = this.parsePrice(subtotalText);

                expect(actualSubtotal, `Subtotal mismatch for "${name}"`)
                    .toBeCloseTo(expectedSubtotal, 2);

                found = true;
                break;
            }

            expect(found, `Product not found in cart containing term: "${term}"`).toBeTruthy();
        }
    }

    async getCartTotalsSubtotalText(): Promise<string> {
        return (await this.getElementText(this.cartSubTotal)).trim();
    }


    async verifyCartTotalsSubtotalText(expected: string): Promise<void> {
        const normalize = (s: string): string =>
            s
                .replace(/\u00A0/g, " ")
                .replace(/[\u200E\u200F]/g, "")
                .replace(/\s+/g, " ")
                .trim();

        const actual = await this.getCartTotalsSubtotalText();
        expect(normalize(actual)).toBe(normalize(expected));
    }

    async verifyCartTotalsSubtotal(expected: number): Promise<void> {
        const normalize = (s: string): string =>
            s
                .replace(/\u00A0/g, " ")
                .replace(/[\u200E\u200F]/g, "")
                .replace(/^₪+/g, "")
                .trim();

        const toNumber = (s: string): number => {
            const cleaned = normalize(s).replace(/,/g, ""); //in case a thousands separator appears 
            // Leave only digits and decimal point
            const numeric = cleaned.replace(/[^\d.]/g, "");
            return Number(numeric);
        };

        const actualText = await this.getCartTotalsSubtotalText();
        const actual = toNumber(actualText);

        expect(actual).toBeCloseTo(expected, 2);
    }



    async verifyCartLines(items: ExpectedCartItem[]): Promise<void> {
        await this.verifyProductContain(items.map(i => i.term));
        await this.verifyUnitPrices(items);
        await this.verifyQuantities(items);
        await this.verifyLineSubtotals(items);
    }

    async incrementQuantity(quantity: number): Promise<void> {
        await this.hoverElement(this.inputQtyText);
        for (let index = 0; index < quantity; index++) {
            await this.inputQtyText.press("ArrowUp")
        }
    }

    async setQtyForProduct(term: string, qty: number): Promise<void> {
        await this.waitForElementVisibility(this.cartItemContainer.first());

        const rowsCount = await this.cartItemContainer.count();

        for (let i = 0; i < rowsCount; i++) {
            const row = this.cartItemContainer.nth(i);

            const name = (await row.locator(".product-name a").innerText()).trim();
            if (!name.toLowerCase().includes(term.toLowerCase())) continue;

            const qtyInput = row.locator("input.input-text.qty.text");

            // 1) Set the qty reliably
            await qtyInput.click();
            await qtyInput.fill(String(qty));

            // 2) Make sure the value is really updated in the DOM
            await expect(qtyInput).toHaveValue(String(qty), { timeout: 250 });

            // 3) Trigger WooCommerce change detection (enables Update cart)
            await qtyInput.blur();

            // 4) Wait until Update cart becomes enabled
            await expect(
                this.updateCartButton,
                'Update cart button did not become enabled after qty change'
            ).toBeEnabled();

            return;
        }

        throw new Error(`Product not found in cart containing term: "${term}"`);
    }

    async updateCart(): Promise<void> {
        await this.clickElement(this.updateCartButton)
    }


    async setAndUpdateQty(term: string, quantity: number): Promise<void> {
        const row = this.cartItemContainer.filter({
            has: this.page.locator(".product-name a", { hasText: term }),
        }).first();

        const lineSubtotal = row.locator("td.product-subtotal .woocommerce-Price-amount");
        const beforeSubtotal = (await lineSubtotal.innerText()).trim();
        await this.setQtyForProduct(term, quantity);
        await this.updateCart();
        await expect(lineSubtotal).not.toHaveText(beforeSubtotal);
    }

    async setAndTryUpdateInvalidQty(term: string, quantity: number | string): Promise<void> {
        const row = this.cartItemContainer.filter({
            has: this.page.locator(".product-name a", { hasText: term }),
        }).first();
        const lineSubtotal = row.locator("td.product-subtotal .woocommerce-Price-amount");
        const beforeSubtotal = (await lineSubtotal.innerText()).trim();
        await this.setQtyForProduct(term, Number(quantity));
        await this.updateCart();
        await expect(lineSubtotal).toHaveText(beforeSubtotal);
    }




    async removeProductByName(productName: string | string[]): Promise<void> {
        const products = Array.isArray(productName) ? productName : [productName];
        for (const name of products) {
            const row = this.page.locator("tr.cart_item", { hasText: name }).first();
            await this.waitForElementVisibility(row);
            const removeLink = row.locator("a.remove").first();
            await this.clickElement(removeLink);
            await row.waitFor({ state: "detached", timeout: 5000 });
        }

    }

    async verifyNoCartItems(): Promise<void> {
        await expect(this.page.locator("tr.cart_item")).toHaveCount(0);
    }

    async getEmptyCartMessageText(): Promise<string> {
        return await this.getElementText(this.emptyCartMessage);
    }

    async verifyEmptyCartMessageText(): Promise<void> {
        const actualText = await this.getEmptyCartMessageText();
        const expectedText = "Your cart is currently empty.";
        expect(actualText).toEqual(expectedText);
    }

    async goToCheckout(): Promise<void> {
        await this.checkoutButton.click();
    }

    async fillCouponCode(couponCode: string): Promise<void> {
        await this.fillText(this.couponCodeField, couponCode);
    }

    async clickApplyCouponButton(): Promise<void> {
        await this.clickElement(this.applyCouponButton);
    }

    async applyCoupon(couponCode: string): Promise<void> {
        await this.fillCouponCode(couponCode);
        await this.clickApplyCouponButton();
    }

    async getTotal(): Promise<string> {
        await this.waitForElementVisibility(this.total);
        return await this.getElementText(this.total);
    }

    async getTotalValue(): Promise<number> {
        const raw = await this.getTotal();
        return this.parsePrice(raw);
    }

    async getDiscount(): Promise<string> {
        return await this.getElementText(this.cartDiscountCoupon);
    }

    async getDiscountValue(): Promise<number> {
        const raw = await this.getDiscount();
        return this.parsePrice(raw);
    }

    async verifyDiscountIsVisible(): Promise<void> {
        await expect(this.cartDiscountCoupon).toBeVisible();
    }

    async verifyDiscountIsNotVisible(): Promise<void> {
        await expect(this.cartDiscountCoupon).not.toBeVisible();
    }

    async verifyTotalValue(expectedValue: number): Promise<void> {
        await expect.poll(
            async () => await this.getTotalValue(),
            { message: `Expected cart total to become ${expectedValue} after AJAX update` }
        ).toBeCloseTo(expectedValue, 2);
    }

    async getErrorMessageCoupnNotExist(): Promise<string> {
        await this.waitForElementVisibility(this.errorMessageCouponNotExist)
        return await this.getElementText(this.errorMessageCouponNotExist);
    }

    async verifyErrorMessageCoupnNotExist(text: string): Promise<void> {
        const expectedMessage = `Coupon "${text.toLowerCase()}" does not exist!`;
        const actualMessage = await this.getErrorMessageCoupnNotExist();
        expect(actualMessage).toEqual(expectedMessage);
    }

    async removeCoupon(): Promise<void> {
        await this.clickElement(this.removeCouponButton);
    }










}