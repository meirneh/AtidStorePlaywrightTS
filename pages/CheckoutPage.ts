import { expect, Locator, Page } from "@playwright/test";
import BasePage from "./BasePage";
type ExpectedQty = { term: string; expectedQty: number };
type ExpectedTotal = { term: string; expectedTotal: number };
type ShippingOption = 'localPickup' | 'deliveryExpress' | 'registeredMail';
export type BillingInfo = {
    // Required fields (based on your validation list)
    firstName: string;
    lastName: string;
    address: string;
    postcode: string;
    city: string;
    phone: string;
    email: string;

    // Optional fields
    company?: string;
    appartment?: string;

    // Select2 fields
    country?: string;
    province?: string; // Only relevant when the state/province control is present for selected country
};

export default class CheckoutPage extends BasePage {

    protected productName: Locator;
    protected productTotal: Locator;
    protected cartSubTotal: Locator;
    protected orderTotal: Locator;
    protected placeOrderButton: Locator;
    protected errorMessageContainer: Locator;
    protected deliveryExpressOptionButton: Locator;
    protected registeredMailOptionButton: Locator;
    protected localPickupOptionButton: Locator;
    protected shippingRow: Locator;
    protected shippingAmount: Locator;
    protected firstNameField: Locator;
    protected lastNameField: Locator;
    protected companyField: Locator;
    protected countryField: Locator;
    protected addressField: Locator;
    protected appartmentField: Locator;
    protected postcodeField: Locator;
    protected cityField: Locator;
    protected provinceField: Locator;
    protected phoneField: Locator;
    protected emailField: Locator;
    protected invalidPayMethodMessage: Locator;

    constructor(page: Page) {
        super(page)
        this.productName = page.locator("tr.cart_item td.product-name");
        this.productTotal = page.locator("tr.cart_item td.product-total");
        this.cartSubTotal = page.locator(".cart-subtotal");
        this.orderTotal = page.locator(".order-total");
        this.placeOrderButton = page.locator("#place_order");
        this.errorMessageContainer = page.locator("ul.woocommerce-error");
        this.localPickupOptionButton = page.locator("#shipping_method_0_local_pickup1");
        this.deliveryExpressOptionButton = page.locator("#shipping_method_0_flat_rate3");
        this.registeredMailOptionButton = page.locator("#shipping_method_0_flat_rate4");
        this.shippingRow = page.locator('tr.shipping');
        this.shippingAmount = page.locator('tr.shipping .woocommerce-Price-amount');
        this.firstNameField = page.locator("#billing_first_name");
        this.lastNameField = page.locator("#billing_last_name");
        this.companyField = page.locator("#billing_company");
        this.countryField = page.locator("#select2-billing_country-container");
        this.addressField = page.locator("#billing_address_1");
        this.appartmentField = page.locator("#billing_address_2");
        this.postcodeField = page.locator("#billing_postcode");
        this.cityField = page.locator("#billing_city");
        this.provinceField = page.locator("#select2-billing_state-container")
        this.phoneField = page.locator("#billing_phone");
        this.emailField = page.locator("#billing_email");
        this.invalidPayMethodMessage = page.locator(".woocommerce-NoticeGroup-checkout li");
    }

    async getProductNames(): Promise<string[]> {
        await this.waitForElementVisibility(this.productName.first(), 2000);

        const count = await this.productName.count();
        const names: string[] = [];

        for (let i = 0; i < count; i++) {
            const name = await this.getElementText(this.productName.nth(i));

            names.push(
                name
                    .replace(/\u00a0/g, ' ')   // NBSP -> space
                    .replace(/\s+/g, ' ')     // colapsa whitespace
                    .trim()
            );
        }

        return names;
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

    async verifyProductQuantities(input: ExpectedQty | ExpectedQty[]): Promise<void> {
        const expectedList = Array.isArray(input) ? input : [input];

        const rows = this.page.locator('tr.cart_item');
        const rowCount = await rows.count();
        expect(rowCount, 'No cart items found in "Your order"').toBeGreaterThan(0);

        // We created a map: visibleName -> quantity
        const nameToQty: Record<string, number> = {};

        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);

            const nameCell = row.locator('td.product-name');
            const rawName = await this.getElementText(nameCell);

            const qtyText = await this.getElementText(row.locator('td.product-name .product-quantity'));
            const qty = parseInt(qtyText.replace(/[^\d]/g, ''), 10); // "× 2" -> 2

            // We normalized it a bit to avoid NBSP
            const normalizedName = rawName.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
            nameToQty[normalizedName] = qty;
        }

        // We verify each expected by "term" (same as your verifyProductContain)
        const actualNames = Object.keys(nameToQty);

        for (const { term, expectedQty } of expectedList) {
            const search = term.toLowerCase().trim();
            const matchedName = actualNames.find(n => n.toLowerCase().includes(search));

            expect(
                matchedName,
                `Product not found for qty check. term="${term}". Actual: ${actualNames.join(' | ')}`
            ).toBeTruthy();

            const actualQty = nameToQty[matchedName!];
            expect(
                actualQty,
                `Qty mismatch for "${matchedName}". Expected ${expectedQty}, got ${actualQty}`
            ).toBe(expectedQty);
        }
    }

    private parsePrice(text: string): number {
        // Normalizes NBSP and space
        const normalized = text.replace(/\u00a0/g, ' ').trim();

        // Extract the first decimal number (it works for "300.00 ₪", "₪300.00", etc.)
        const match = normalized.match(/-?\d+(?:[.,]\d+)?/);
        if (!match) throw new Error(`Could not parse price from: "${text}"`);

        // Convert decimal comma to period if necessary
        return Number(match[0].replace(',', '.'));
    }

    async getProductTotals(): Promise<number[]> {
        await this.waitForElementVisibility(this.productTotal.first(), 2000);
        const rows = this.page.locator('tr.cart_item');
        const count = await rows.count();
        const subtotals: number[] = [];
        for (let i = 0; i < count; i++) {
            const raw = await this.getElementText(rows.nth(i).locator('td.product-total'));
            subtotals.push(this.parsePrice(raw));
        }

        return subtotals;
    }

    async verifyProductTotals(input: ExpectedTotal | ExpectedTotal[]): Promise<void> {
        const expectedList = Array.isArray(input) ? input : [input];

        const rows = this.page.locator('tr.cart_item');
        const rowCount = await rows.count();
        expect(rowCount, 'No cart items found in "Your order"').toBeGreaterThan(0);

        //Map: visibleName -> totalLine
        const nameToTotal: Record<string, number> = {};

        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);

            const rawName = await this.getElementText(row.locator('td.product-name'));
            const normalizedName = rawName.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

            const rawTotal = await this.getElementText(row.locator('td.product-total'));
            const total = this.parsePrice(rawTotal); // Use your helper that removes the currency symbol.

            nameToTotal[normalizedName] = total;
        }

        const actualNames = Object.keys(nameToTotal);

        for (const { term, expectedTotal } of expectedList) {
            const search = term.toLowerCase().trim();
            const matchedName = actualNames.find(n => n.toLowerCase().includes(search));

            expect(
                matchedName,
                `Product not found for total check. term="${term}". Actual: ${actualNames.join(' | ')}`
            ).toBeTruthy();

            const actualTotal = nameToTotal[matchedName!];
            expect(
                actualTotal,
                `Total mismatch for "${matchedName}". Expected ${expectedTotal}, got ${actualTotal}`
            ).toBe(expectedTotal);
        }
    }

    async getSubTotal(): Promise<number> {
        const raw = await this.getElementText(this.cartSubTotal);
        return (this.parsePrice(raw))
    }

    async verifySubTotal(expectedSubTotal: number): Promise<void> {
        const actualNumber = await this.getSubTotal();
        expect(actualNumber).toEqual(expectedSubTotal);
    }

    async getOrderTotal(): Promise<number> {
        const raw = await this.getElementText(this.orderTotal);
        return (this.parsePrice(raw))
    }

    async verifyOrderTotal(expectedTotal: number): Promise<void> {
        const actualNumber = await this.getOrderTotal();
        expect(actualNumber).toEqual(expectedTotal);
    }



    async verifyOrderDetails(
        inputQty: ExpectedQty | ExpectedQty[],
        inputTotal: ExpectedTotal | ExpectedTotal[],
        expectedSubTotal: number,
        expectedTotal: number
    ): Promise<void> {
        await this.verifyProductQuantities(inputQty);
        await this.verifyProductTotals(inputTotal)
        await this.verifySubTotal(expectedSubTotal);
        await this.verifyOrderTotal(expectedTotal);
    }

    async placeOrder(): Promise<void> {
        await this.clickElement(this.placeOrderButton);
    }

    async getErrorsMessagesTexts(): Promise<string> {
        return await this.getElementText(this.errorMessageContainer);
    }

    async verifyErrorsMessagesTexts(): Promise<void> {
        const expectedErrors = `
Billing First name is a required field.
Billing Last name is a required field.
Billing Street address is a required field.
Billing Postcode / ZIP is a required field.
Billing Town / City is a required field.
Billing Phone is a required field.
Billing Email address is a required field.
Invalid payment method.
`.trim();
        const actualErrors = await this.getErrorsMessagesTexts();
        expect(expectedErrors).toEqual(actualErrors);
    }

    async selectShippingOption(option: ShippingOption): Promise<void> {
        const map: Record<ShippingOption, Locator> = {
            localPickup: this.localPickupOptionButton,
            deliveryExpress: this.deliveryExpressOptionButton,
            registeredMail: this.registeredMailOptionButton,
        };

        await this.clickElement(map[option]);
    }

    async verifyRegisteredMailSelected(): Promise<void> {
        await expect(this.registeredMailOptionButton).toBeChecked();
    }

    async verifyDeliveryExpressSelected(): Promise<void> {
        await expect(this.deliveryExpressOptionButton).toBeChecked();
    }

    async selectDeliveryExpress(): Promise<void> {
        await this.clickElement(this.deliveryExpressOptionButton);
    }

    async selectRegisteredMail(): Promise<void> {
        await this.clickElement(this.registeredMailOptionButton);
    }

    async selectLocalPickup(): Promise<void> {
        await this.clickElement(this.localPickupOptionButton);
    }

    async verifyTotalsAfterShippingChange(expectedShipping: number): Promise<void> {
        const subtotal = await this.getSubTotal();

        // Wait for the shipping information for the selected method to update.
        await expect.poll(async () => {
            return await this.getSelectedShippingCost();
        }, { timeout: 6000 }).toBeCloseTo(expectedShipping, 2);

        const expectedTotal = subtotal + expectedShipping;

        // Wait for total recalculation
        await expect.poll(async () => {
            return await this.getOrderTotal();
        }, { timeout: 6000 }).toBeCloseTo(expectedTotal, 2);
    }
    private async getSelectedShippingCost(): Promise<number> {
        const checked = this.page.locator('tr.shipping input[type="radio"]:checked');

        // We climbed onto the container (usually the adjacent label/li)
        const container = checked.locator('..');

        const amount = container.locator('.woocommerce-Price-amount');

        // If there is no amount (e.g., local pickup), we return 0
        if (await amount.count() === 0) return 0;

        const raw = await amount.first().innerText();
        return this.parsePrice(raw);
    }

    async fillFirstName(firstName: string): Promise<void> {
        await this.fillText(this.firstNameField, firstName);

    }

    async fillLastName(lastName: string): Promise<void> {
        await this.fillText(this.lastNameField, lastName);

    }

    async fillCompany(companyName: string): Promise<void> {
        await this.fillText(this.companyField, companyName);

    }

    async selectCountry(country: string): Promise<void> {
        //1) Click to open select2 (the visible span)
        const select2Rendered = this.page.locator("#select2-billing_country-container");
        await select2Rendered.locator("..").click(); // parent: .select2-selection
        // 2) Type in the dropdown search input
        const searchInput = this.page.locator(".select2-container--open .select2-search__field");
        await searchInput.fill(country);
        //3) Select the result (click or Enter)
        const option = this.page.locator(".select2-container--open .select2-results__option", { hasText: country });
        await option.first().click();
        //4) Verify that it has been set (the visible text changes)
        await select2Rendered.waitFor();
        await expect(select2Rendered).toHaveText(country);
    }

    async fillAddress(addressName: string): Promise<void> {
        await this.fillText(this.addressField, addressName);
    }

    async fillAppartment(appartmentNumber: string): Promise<void> {
        await this.fillText(this.appartmentField, appartmentNumber);
    }


    async fillPostcode(postcodeNumber: string): Promise<void> {
        await this.fillText(this.postcodeField, postcodeNumber);
    }

    async fillCity(cityName: string): Promise<void> {
        await this.fillText(this.cityField, cityName);
    }

    async selectProvince(province: string): Promise<void> {
        // 1) Click to open select2 (the visible span)
        const select2Rendered = this.page.locator("#select2-billing_state-container");
        await select2Rendered.locator("..").click(); // parent: .select2-selection

        // 2) Type in the dropdown search input
        const searchInput = this.page.locator(".select2-container--open .select2-search__field");
        await searchInput.fill(province);

        // 3) Select the result
        const option = this.page.locator(".select2-container--open .select2-results__option", { hasText: province });
        await option.first().click();

        // 4) Verify that it has been set (the visible text changes)
        await expect(select2Rendered).toHaveText(province);
    }

    async fillPhone(phoneNumber: string): Promise<void> {
        await this.fillText(this.phoneField, phoneNumber);
    }

    async fillEmail(emailName: string): Promise<void> {
        await this.fillText(this.emailField, emailName);
    }


    async fillBillInfo(info: BillingInfo): Promise<void> {
        // Fill required identity fields
        await this.fillFirstName(info.firstName);
        await this.fillLastName(info.lastName);

        // Optional company
        if (info.company) {
            await this.fillCompany(info.company);
        }

        // Country (Select2) - only if provided
        if (info.country) {
            await this.selectCountry(info.country);

            // Province/State (Select2) - appears only for some countries
            if (info.province && await this.isElementVisible(this.provinceField)) {
                await this.selectProvince(info.province);
            }
        }

        // Address fields
        await this.fillAddress(info.address);

        // Optional apartment
        if (info.appartment) {
            await this.fillAppartment(info.appartment);
        }

        // Fill remaining required fields
        await this.fillPostcode(info.postcode);
        await this.fillCity(info.city);
        await this.fillPhone(info.phone);
        await this.fillEmail(info.email);
    }

    async getInvalidPaymentMessage(): Promise<string> {
        return this.getElementText(this.invalidPayMethodMessage);
    }

    async verifyInvalidPaymentMessage(): Promise<void> {
        const expectedText = "Invalid payment method."
        const actualText = await this.getInvalidPaymentMessage();
        expect(actualText).toEqual(expectedText);
    }















}