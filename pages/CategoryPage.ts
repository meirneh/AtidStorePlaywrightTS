import { expect, Locator, Page, ConsoleMessage } from "@playwright/test";
import BasePage from "./BasePage";

export default class CategoryPage extends BasePage {

    private searchBar: Locator;
    private searchBarButton: Locator;


    //==== Filter By Price Slide ====
    private slidePriceFilterContainer: Locator;
    private slidePriceFilterTitle: Locator;
    private slidePriceFilter: Locator;
    private priceSliderTrack: Locator;
    private slidePriceFilterMinPrice: Locator;
    private priceSliderMaxHandle: Locator;
    private priceSliderMinHandle: Locator;
    private slidePriceFilterMaxPrice: Locator;


    private slidePriceFilterButton: Locator;

    //===== Categories ====
    private titleCategory: Locator;
    private categoriesContainer: Locator;
    private categoryList: Locator;
    private categoryItems: Locator;
    private categoryCountByIndex: (index: number) => Locator;
    private categoryItemByName: (name: string) => Locator;
    private categoryCountByName: (name: string) => Locator;
    private categoryLinkByIndex: (index: number) => Locator;
    private categoryLinkByName: (name: string) => Locator;
    private getCategoryProductCount: () => Promise<number>;
    private orderBySelect: Locator;
    private breadCrumbCategory: Locator;
    private linkGoHomeButton: Locator;
    private countingTitle: Locator;

    //==== Best Sellers ====
    private bestSellerItem: Locator;
    private bestSellersSection: Locator;
    private bestSellersItems: Locator;
    private bestSellerLinkByIndex: (index: number) => Locator;
    private bestSellerLinkByName: (name: string) => Locator;
    private bestSellerNames: () => Locator;
    private bestSellerPrices: () => Locator;
    private getBestSellersCount: () => Promise<number>;

    //=== Products ====
    private productContainer: Locator;
    private productPrice: Locator;
    private productName: Locator;
    private productCategoryLabels: Locator;


    constructor(page: Page) {
        super(page)
        // ==== Search Products ====
        this.searchBar = page.locator("#wc-block-search__input-1");
        this.searchBarButton = page.locator(".wc-block-product-search__button");

        //==== Filter By Price Slide ====
        this.slidePriceFilterContainer = page.locator("#woocommerce_price_filter-2");
        this.slidePriceFilterTitle = page.locator("#woocommerce_price_filter-2 .widget-title");
        this.slidePriceFilter = page.locator(".price_slider.ui-slider.ui-corner-all.ui-slider-horizontal.ui-widget.ui-widget-content");
        this.priceSliderTrack = page.locator(".ui-widget.ui-widget-content > div");
        this.priceSliderMaxHandle = page.locator(".ui-widget-content > span:nth-child(3)");
        this.priceSliderMinHandle = page.locator(".ui-widget-content > span:nth-child(2)");
        this.slidePriceFilterMinPrice = page.locator(".price_slider_amount .price_label .from");
        this.slidePriceFilterMaxPrice = page.locator(".price_slider_amount .price_label .to")
        this.slidePriceFilterButton = page.locator(".price_slider_amount .button");

        // ==== Categories ====
        this.titleCategory = page.locator(".woocommerce-products-header__title.page-title");
        this.categoryList = page.locator("ul.product-categories")
        this.categoryItems = this.categoryList.locator("li");
        this.categoriesContainer = this.categoryList;
        this.categoryLinkByIndex = (index: number): Locator => this.categoryItems.nth(index).locator('a');
        this.categoryLinkByName = (name: string): Locator => this.categoryItems.filter({ has: this.page.locator("a", { hasText: new RegExp(`^${name}$`) }), }).locator('a');
        this.getCategoryProductCount = async (): Promise<number> => this.categoriesContainer.count();
        this.categoryCountByIndex = (index: number) => this.categoryItems.nth(index).locator(".count");
        this.categoryItemByName = (name: string): Locator => this.categoryItems.filter({ has: this.page.locator("a", { hasText: new RegExp(`^${name}$`) }), });
        this.categoryCountByName = (name: string) => this.categoryItemByName(name).locator(".count");
        this.breadCrumbCategory = page.locator(".woocommerce-breadcrumb");
        this.linkGoHomeButton = page.locator(".woocommerce-breadcrumb > a");
        this.countingTitle = page.locator(".ast-woocommerce-container .woocommerce-result-count");


        // ==== Best Sellers ====
        this.bestSellerItem = page.locator(".product_list_widget li a");
        this.bestSellersSection = page.locator(".widget_top_rated_products, .woocommerce.widget_top_rated_products");
        this.bestSellersItems = this.bestSellersSection.locator(".product_list_widget li");
        this.bestSellerLinkByIndex = (index: number): Locator => this.bestSellersItems.nth(index).locator('a');
        this.bestSellerLinkByName = (name: string): Locator => this.bestSellersSection.locator(".product_list_widget li a").filter({ hasText: name });
        this.bestSellerNames = (): Locator => this.bestSellersSection.locator(".product_list_widget li a");
        this.bestSellerPrices = (): Locator => this.bestSellersSection.locator(".product_list_widget li .amount");
        this.getBestSellersCount = async (): Promise<number> => this.bestSellersItems.count();

        //==== Sorting products ====
        this.orderBySelect = page.locator(".orderby");

        //==== Products =====
        this.productPrice = page.locator(".price .woocommerce-Price-amount");
        this.productContainer = page.locator(".astra-shop-summary-wrap");
        this.productCategoryLabels = page.locator(".ast-woo-product-category");
        this.productName = page.locator(".woocommerce-loop-product__title");

    }

    // ==== Actions and verifications ===

    // ===== Search Bar ====
    async verifySearchBarVisibleAndEnable(): Promise<void> {
        await this.waitForElementVisibility(this.searchBar);
        await this.isElementVisible(this.searchBar);
        await this.isElementEnable(this.searchBar);
    }

    async verifySearchBarButtonVisibleAndEnable(): Promise<void> {
        await this.waitForElementVisibility(this.searchBarButton);
        await this.isElementVisible(this.searchBarButton);
        await this.isElementEnable(this.searchBarButton);
    }

    async verifySearchProductsVisibleAndEnable(): Promise<void> {
        await this.verifySearchBarVisibleAndEnable();
        await this.verifySearchBarButtonVisibleAndEnable();
    }

    // ==== Slide filter price

    async getFilterByPriceTitle(): Promise<string> {
        return await this.getElementText(this.slidePriceFilterTitle);

    }

    async verifySlideFilterByPriceTitleVisible(): Promise<void> {
        await this.waitForElementVisibility(this.slidePriceFilterTitle);
        await this.isElementVisible(this.slidePriceFilterTitle);
    }

    async verifySlideFilterByPriceVisibleAndEnable(): Promise<void> {
        await this.waitForElementVisibility(this.slidePriceFilter);
        await this.isElementVisible(this.slidePriceFilter);
        await this.isElementEnable(this.slidePriceFilter);
    }

    async getSlidePriceFilterMinPrice(): Promise<string> {
        return (await this.getElementText(this.slidePriceFilterMinPrice)).replace("₪", "");
    }

    async verifySlidePriceFilterMinPriceVisible(): Promise<void> {
        await this.waitForElementVisibility(this.slidePriceFilterMinPrice);
        await this.isElementVisible(this.slidePriceFilterMinPrice);
    }

    async verifySlidePriceFilterMinPrice(expectedPrice: string): Promise<void> {
        const actualPrice = ((await this.getSlidePriceFilterMinPrice()).trim());
        expect(actualPrice).toEqual(expectedPrice);
    }

    async getSlidePriceFilterMaxPrice(): Promise<string> {
        return (await this.getElementText(this.slidePriceFilterMaxPrice)).replace("₪", "");
    }

    async verifySlidePriceFilterMaxPriceVisible(): Promise<void> {
        await this.waitForElementVisibility(this.slidePriceFilterMaxPrice);
        await this.isElementVisible(this.slidePriceFilterMaxPrice);
    }

    async verifySlidePriceFilterMaxPrice(expectedPrice: string): Promise<void> {
        const actualPrice = ((await this.getSlidePriceFilterMaxPrice()).trim());
        expect(actualPrice).toEqual(expectedPrice);
    }

    async getSlidePriceFilterButton(): Promise<string> {
        return await this.getElementText(this.slidePriceFilterButton);
    }

    async verifySlidePriceFilterButtonVisibleAndEnable(): Promise<void> {
        await this.waitForElementVisibility(this.slidePriceFilterButton);
        await this.isElementVisible(this.slidePriceFilterButton);
        await this.isElementEnable(this.slidePriceFilter);
    }

    async verifySlidePriceFilterProductsVisible(): Promise<void> {
        await this.verifySlideFilterByPriceTitleVisible();
        await this.verifySlideFilterByPriceVisibleAndEnable();
        await this.verifySlidePriceFilterMinPriceVisible();
        await this.verifySlidePriceFilterMaxPriceVisible();
        await this.verifySlidePriceFilterButtonVisibleAndEnable();
    }

    async setSlideMaxPrice(dx: number): Promise<void> {
        await this.waitForElementVisibility(this.priceSliderTrack, 1000);
        await this.dragElementByOffset(this.priceSliderMaxHandle, dx, 0);
    }

    async setSlideMinPrice(dx: number): Promise<void> {
        await this.waitForElementVisibility(this.priceSliderTrack, 1000);
        await this.dragElementByOffset(this.priceSliderMinHandle, dx, 0);
    }

    async clickFilterButton(): Promise<void> {
        await this.clickElement(this.slidePriceFilterButton);
    }

    async applyPriceRangeFilter(minPrice: number, maxPrice: number): Promise<void> {
        await this.setSlideMaxPrice(maxPrice);
        await this.setSlideMinPrice(minPrice);
        await this.clickFilterButton();
    }


    // ==== Categories ====

    async getCategoryNames(): Promise<string[]> {
        const count = await this.categoryItems.count();
        const names: string[] = [];
        for (let i = 0; i < count; i++) {
            const name = await this.getElementText(this.categoryItems.nth(i).locator('a'));
            names.push(name.trim());
        }
        return names;
    }

    async verifyCategoriesVisible(names: string[]): Promise<void> {
        for (const name of names) {
            const li = this.categoryItems.filter({
                has: this.page.locator("a", { hasText: name }),
            });
            if (await li.count() === 0) {
                throw new Error(`Category not found: "${name}"`);
            }
            const link = li.first().locator("a");
            await this.waitForElementVisibility(link);
            await expect(link, `Category "${name}" should be visible`).toBeVisible();
        }
    }


    async getCategoryName(index: number): Promise<string> {
        return await this.getElementText(this.categoryLinkByIndex(index));
    }

    async selectCategoryByName(name: string): Promise<void> {
        await this.clickElement(this.categoryLinkByName(name));
    }

    async getTitleCategory(): Promise<string> {
        return await this.getElementText(this.titleCategory);
    }

    async verifyTitleCategory(expectedText: string): Promise<void> {
        expect(await this.getTitleCategory()).toEqual(expectedText);
    }

    async getBreadCrumbCategoryText(): Promise<string> {
        const fullText = await this.getElementText(this.breadCrumbCategory);
        const parts = fullText.split("/").map(p => p.trim()).filter(Boolean);
        const category = parts[1]
        return category;
    }

    async verifyBreadCrumbCategoryText(expectedText: string): Promise<void> {
        const actualText = (await this.getBreadCrumbCategoryText()).trim();
        expect(actualText).toBe(expectedText);
    }

    async goToHomePageByBreadCrumb(): Promise<void> {
        await this.clickElement(this.linkGoHomeButton);
    }


    async getCategoryProductCountByIndex(index: number): Promise<number> {
        const item = this.categoryItems.nth(index);
        await this.waitForElementVisibility(item);
        const raw = await this.getElementText(this.categoryCountByIndex(index));
        const count = parseInt(raw.replace(/[^\d]/g, ""), 10);
        return count;
    }

    async getCategoryProductCountByName(name: string): Promise<number> {
        const item = this.categoryItemByName(name)
        await this.waitForElementVisibility(item);
        const raw = await this.getElementText(this.categoryCountByName(name));
        const count = parseInt(raw.replace(/[^\d]/g, ""), 10);
        return count;
    }

    async getCountingTitle(): Promise<string> {
        return await this.getElementText(this.countingTitle)
    }

    private extractTotalFromCountingTitle(text: string): number {
        const matches = text.match(/\d+/g);
        if (!matches || matches.length === 0) {
            throw Error(`Could nt extract total results from counting title: "${text}`)
        }
        const last = matches[matches.length - 1];
        return parseInt(last, 10);
    }

    async verifyCategoryCountMatchesResults(category: string): Promise<void> {
        const countingTitle = await this.getCountingTitle();
        const TotalFromTitle = this.extractTotalFromCountingTitle(countingTitle);
        const TotalFromCategory = await this.getCategoryProductCountByName(category)
        expect(TotalFromTitle).toEqual(TotalFromCategory);
    }

    async verifyCatalogSidebarContentNotPresent(): Promise<void> {
        // ===== Filter By Price (Slider) =====
        const priceFilterCount = await this.slidePriceFilterContainer.count();
        if (priceFilterCount > 0) {
            await expect(
                this.slidePriceFilterContainer,
                'Price filter slider should NOT be visible on non-catalog pages'
            ).not.toBeVisible();
        }

        // ===== Categories =====
        const categoriesCount = await this.categoriesContainer.count();
        if (categoriesCount > 0) {
            await expect(
                this.categoriesContainer,
                'Categories container should NOT be visible on non-catalog pages'
            ).not.toBeVisible();
        }

        // ===== Best Sellers =====
        const bestSellersCount = await this.bestSellersSection.count();
        if (bestSellersCount > 0) {
            await expect(
                this.bestSellersSection,
                'Best Sellers section should NOT be visible on non-catalog pages'
            ).not.toBeVisible();
        }
    }



    async getBestSellerItemByIndex(index: number): Promise<string> {
        return await this.getElementText(this.bestSellerLinkByIndex(index));
    }

    async getBestSellertItemByName(name: string): Promise<string> {
        return await this.getElementText(this.bestSellerLinkByName(name));
    }

    async selectBestSellerByName(name: string): Promise<void> {
        await this.clickElement(this.bestSellerLinkByName(name));
    }

    async getBestSellerPriceByIndex(index: number): Promise<string> {
        const item = this.bestSellersItems.nth(index);
        await this.waitForElementVisibility(item);
        const target = item.locator("span.woocommerce-Price-amount").last();
        const price = (await this.getElementText(target)).replace("₪", "");
        return price.trim();
    }

    async getBestSellerPriceByName(name: string): Promise<string> {
        const item = this.bestSellersItems.filter({
            has: this.page.locator("a", { hasText: name }),
        });
        await this.waitForElementVisibility(item);
        const target = item.locator("span.woocommerce-Price-amount").last();
        const price = (await this.getElementText(target)).replace("₪", "");
        return price.trim();
    }

    async getBestSellersItemsNames(): Promise<string[]> {
        const count = await this.bestSellerItem.count();
        const items: string[] = [];
        for (let i = 0; i < count; i++) {
            const item = await this.getElementText(this.bestSellerItem.nth(i));
            items.push(item.trim());
        }
        return items;
    }

    async verifyBestSellersItemsVisible(items: string[]): Promise<void> {
        await this.waitForElementVisibility(this.bestSellersItems.first());
        for (const item of items) {
            const link = this.bestSellerLinkByName(item).first();
            if (await link.count() === 0) throw new Error(`Best Seller not found: "${item}"`);
            await this.waitForElementVisibility(link);
            await expect(link, `Best Seller "${item}" should be visible`).toBeVisible();
        }
    }

    async sortItems(value: string): Promise<void> {
        await this.selectOption(this.orderBySelect, value)
    }

    async sortItemsWithAllTheValues(values: string[]): Promise<void> {
        for (const value of values) {
            await this.sortItems(value);
        }
    }

    async getUrlStore(): Promise<string> {
        return this.page.url();
    }

    async verifyPriceParamsInUrl(minPrice: number, maxPrice: number): Promise<void> {
        const url = await this.getUrlStore();
        const u = new URL(url);
        const min = u.searchParams.get('min_price');
        const max = u.searchParams.get('max_price');
        expect(min, 'min_price should be in the URL').toBe(String(minPrice));
        expect(max, 'max_price should be in the URL').toBe(String(maxPrice));
    }

    async verifyNotPriceParamsInUrl(): Promise<void> {
        const url = await this.getUrlStore();
        const u = new URL(url);
        expect(u.searchParams.get('min_price')).toBeNull();
        expect(u.searchParams.get('max_price')).toBeNull();
    }


    //==== Products ====

    async getCountPrices(): Promise<number> {
        return this.countElements(this.productPrice);
    }

    async getCountProducts(): Promise<number> {
        return this.countElements(this.productContainer);
    }

    async getProductsPrice(): Promise<number[]> {
        const count = await this.productContainer.count();
        const prices: number[] = [];

        for (let i = 0; i < count; i++) {
            const product = this.productContainer.nth(i);
            // const priceLocator = this.productPrice.last();
            const priceLocator = product
                .locator(".price .woocommerce-Price-amount")
                .last(); // ignora el tachado si hay oferta
            const rawText = await this.getElementText(priceLocator);
            const numeric = parseFloat(rawText.replace(/[^\d.]/g, ""));
            prices.push(numeric);

        }

        return prices;

    }

    async getProductNames(): Promise<string[]> {
        const count = await this.productName.count();
        const names: string[] = [];
        for (let i = 0; i < count; i++) {
            const name = await this.getElementText(this.productName.nth(i));
            names.push(name.trim());
        }
        return names;
    }

    async verifyProductContain(term: string): Promise<void> {
        const names = await this.getProductNames();
        const searchTerm = term.toLowerCase();
        expect(names.length).toBeGreaterThan(0);
        for (const name of names) {
            expect(name.toLowerCase()).toContain(searchTerm)
        }
    }

    async verifyCountProducts(expectedNumber: number): Promise<void> {
        expect(await this.getCountProducts()).toEqual(expectedNumber);
    }



    async verifyProductsPricesInRange(min: number, max: number): Promise<void> {
        const prices = await this.getProductsPrice()
        expect(prices.length, "There should be at least one product after applying price filter").toBeGreaterThan(0);
        for (const price of prices) {
            expect(price, `Price${price} should be >= ${min}`).toBeGreaterThanOrEqual(min);
            expect(price, `Price ${price} should be <= ${max}`).toBeLessThanOrEqual(max)

        }

    }

    async verifyAtLeastOneProductPriceOutOfRange(min: number, max: number): Promise<void> {
        const prices = await this.getProductsPrice();
        expect(prices.length, 'There should be at least one product in the listing').toBeGreaterThan(0);

        const hasOutOfRange = prices.some(p => p < min || p > max);
        expect(
            hasOutOfRange,
            `Expected at least one product price to be outside ${min}-${max}, but got: ${prices.join(', ')}`
        ).toBeTruthy();
    }


    async getProductsCategoryTexts(): Promise<string[]> {
        const count = await this.countElements(this.productCategoryLabels)
        const categories: string[] = [];

        for (let i = 0; i < count; i++) {
            const text = ((await this.getElementText(this.productCategoryLabels.nth(i))).trim());
            categories.push(text);

        }
        return categories
    }

    async verifyAllProductsBelongToCategory(expectedCategory: string): Promise<void> {
        const categories = await this.getProductsCategoryTexts();
        expect(categories.length).toBeGreaterThan(0);
        for (const category of categories) {
            expect(category, `Product category label '${category}' should be '${expectedCategory}'`).toBe(expectedCategory)

        }
    }

    async selectCategoryAndVerifyProducts(category: string): Promise<void> {
        await this.selectCategoryByName(category);
        await this.verifyBreadCrumbCategoryText(category);
        await this.verifyAllProductsBelongToCategory(category);
    }

    async selectProductByName(productName: string): Promise<void> {
        const productTitle = this.productName.filter({ hasText: productName }).first();
        await this.waitForElementVisibility(productTitle);
        await this.clickElement(productTitle);
    }

    async getProductPriceByName(productName: string): Promise<string> {
        const count = await this.productContainer.count();

        for (let i = 0; i < count; i++) {
            const product = this.productContainer.nth(i);

            const name = (await this.getElementText(product.locator(".woocommerce-loop-product__title"))).trim();

            if (name.toLowerCase().includes(productName.trim().toLowerCase())) {
                const priceLocator = product.locator(".price .woocommerce-Price-amount").last();
                const price = (await this.getElementText(priceLocator)).trim();
                return price;
            }
        }

        throw new Error(`Product not found in category/store listing: "${productName}"`);
    }


    //==== Search Bar ====
    async fillSearchValue(value: string): Promise<void> {
        await this.fillText(this.searchBar, value);
    }

    async clickSearchButton(): Promise<void> {
        await this.clickElement(this.searchBarButton);
    }

    async searchValue(value: string): Promise<void> {
        await this.fillSearchValue(value);
        await this.clickSearchButton();
    }




}