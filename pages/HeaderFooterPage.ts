import { expect, Locator, Page, ConsoleMessage } from "@playwright/test";
import BasePage from "./BasePage";

export type TabKey =
    | 'HOME'
    | 'STORE'
    | 'MEN'
    | 'WOMEN'
    | 'ACCESSORIES'
    | 'ABOUT'
    | 'CONTACT US';



export type LinkKey =
    | 'HOME'
    | 'ABOUT'
    | 'CART'
    | 'CONTACT US';

export default class HeaderFooterPage extends BasePage {
    private tabMap!: Record<TabKey, Locator>;
    private quickLinksNav: Locator;
    private quickLinkMap!: Record<LinkKey, Locator>;

    private homeTab: Locator;
    private storeTab: Locator;
    private menTab: Locator;
    private womenTab: Locator;
    private accessoriesTab: Locator;
    private aboutTab: Locator;
    private contactusTab: Locator;
    private logoButton: Locator;
    private cartContainer: Locator;
    private countCart: Locator;
    private totalCart: Locator;
    private removeButton: Locator;
    private searchButton: Locator;
    private pageErrors: Error[] = [];
    private severeConsole: string[] = [];
    private onPageError = (e: Error) => this.pageErrors.push(e);
    private onConsole = (msg: ConsoleMessage) => {
        if (['error', 'assert'].includes(msg.type())) this.severeConsole.push(msg.text());
    }
    private searchField: Locator;

    constructor(page: Page) {
        super(page)
        this.homeTab = page.locator("#menu-item-381");
        this.storeTab = page.locator("#menu-item-45");
        this.menTab = page.locator("#menu-item-266");
        this.womenTab = page.locator("#menu-item-267");
        this.accessoriesTab = page.locator("#menu-item-671");
        this.aboutTab = page.locator("#menu-item-828");
        this.contactusTab = page.locator("#menu-item-829");
        this.logoButton = page.locator(".ast-main-header-wrap.main-header-bar-wrap > div > div > div > .site-header-primary-section-left");
        this.countCart = page.locator(".ast-site-header-cart-li .count");
        this.totalCart = page.locator(".ast-woo-header-cart-total");
        this.removeButton = page.locator(".ast-site-header-cart-data ul li .remove.remove_from_cart_button");
        this.quickLinksNav = this.page.locator('nav.menu-quick-links-container');
        this.searchButton = this.page.locator('.ast-search-menu-icon.slide-search');
        this.searchField = this.page.locator(".ast-header-search input");
        this.cartContainer = this.page.locator(".cart-container");


        this.tabMap = {
            'HOME': this.homeTab,
            'STORE': this.storeTab,
            'MEN': this.menTab,
            'WOMEN': this.womenTab,
            'ACCESSORIES': this.accessoriesTab,
            'ABOUT': this.aboutTab,
            'CONTACT US': this.contactusTab,
        };

        this.quickLinksNav = this.page.locator('nav.menu-quick-links-container');

        this.quickLinkMap = {
            'HOME': this.quickLinksNav.getByRole('link', { name: /^Home$/i }),
            'ABOUT': this.quickLinksNav.getByRole('link', { name: /^About$/i }),
            'CART': this.quickLinksNav.getByRole('link', { name: /^Cart$/i }),
            'CONTACT US': this.quickLinksNav.getByRole('link', { name: /^Contact Us$/i }),
        }

    }

    private normalize(name: string): TabKey | null {
        const n = name.trim().toUpperCase();
        // I accept common variants (e.g. "CONTACTUS" → "CONTACTUS")
        const alias: Record<string, TabKey> = {
            'HOME': 'HOME',
            'STORE': 'STORE',
            'MEN': 'MEN',
            'WOMEN': 'WOMEN',
            'ACCESSORIES': 'ACCESSORIES',
            'ABOUT': 'ABOUT',
            'CONTACT US': 'CONTACT US',
            'CONTACTUS': 'CONTACT US',
            'CONTACT': 'CONTACT US',
        };
        return (alias[n] as TabKey) ?? null;
    }

    private getTabLocatorByName(name: string): Locator {
        const key = this.normalize(name);
        if (key && this.tabMap[key]) return this.tabMap[key];

        // Fallback: for accesible name (Avoid breaking if the ID changed)
        return this.page.getByRole('link', { name: new RegExp(`^${name.trim()}$`, 'i') });
    }

    async navigateToTab(tab: TabKey | string): Promise<void> {
        const locator = typeof tab === 'string' ? this.getTabLocatorByName(tab) : this.tabMap[tab];
        await this.clickElement(locator);              
        await this.page.waitForLoadState('networkidle'); 
    }

    // Semantic Alias if you prefer this name
    async goToSelectedTab(tab: TabKey | string): Promise<void> {
        await this.navigateToTab(tab);
    }



    async navigateToQuickLink(label: LinkKey): Promise<void> {
        await this.quickLinksNav.scrollIntoViewIfNeeded();
        const link = this.quickLinkMap[label];
        await this.waitForElementVisibility(link, 5000);
        await this.clickElement(link);
    }

    async verifyQuickLinkUrl(label: LinkKey): Promise<void> {
        const expected: Record<LinkKey, RegExp> = {
            HOME: /atid\.store\/?$/i,
            ABOUT: /\/about/i,
            'CONTACT US': /\/contact-us/i,
            CART: /atid\.store\/cart/i,
        };
        await expect(this.page).toHaveURL(expected[label]);
    }

    async verifyHomePageUrl(expectedUrl: string): Promise<void> {
        await this.verifyCurrentUrlIs(expectedUrl);
    }

    async verifyAboutPageUrl(expectedUrl: string): Promise<void> {
        await this.verifyCurrentUrlIs(expectedUrl);
    }

    async backToHomeTab(): Promise<void> {
        await this.clickElement(this.logoButton);

    }

    async getQuantityItemsInCart(): Promise<string> {
        return this.getElementText(this.countCart);
    }


    async verifyQuantityItemsInCart(expectedQuantity: string): Promise<void> {
        await this.waitForTextContains(this.countCart, expectedQuantity, 2000);
    }

    async getQuantityItemsInCartCount(): Promise<number> {
        const text = (await this.getQuantityItemsInCart()).trim();
        return parseInt(text, 10);
    }

    async getTotalItemsInCart(): Promise<string> {
        return (await this.getElementText(this.totalCart)).replace("₪", "").trim();
    }

    async getTotalItemsPriceInCart(): Promise<string> {
        return (await this.getElementText(this.totalCart));
    }

    async verifyTotalItemsInCart(expectedTotal: string): Promise<void> {
        expect(await this.getTotalItemsInCart()).toEqual(expectedTotal);
    }

    async showItemsInCart(): Promise<void> {
        await this.hoverElement(this.totalCart);
    }

    async clickRemoveButton(): Promise<void> {
        await this.clickElement(this.removeButton);
    }

    async clickSearchButton(): Promise<void> {
        await this.clickElement(this.searchButton)
    }

    async verifySearchButtonEnable(): Promise<void> {
        await expect(this.searchButton).toBeEnabled()
    }

    async verifySearchButtonVisible(): Promise<void> {
        await expect(this.searchButton).toBeVisible()
    }

    async verifySearchButtonVisibleEnable(): Promise<void> {
        await this.verifySearchButtonVisible();
        await this.verifySearchButtonEnable();
    }

    async startRecoverabilityWatch(): Promise<void> {
        this.pageErrors = [];
        this.severeConsole = [];
        this.page.on('pageerror', this.onPageError);
        this.page.on('console', this.onConsole);
    }

    async assertRecoverableAndDetach(): Promise<void> {
        this.page.off('pageerror', this.onPageError);
        this.page.off('console', this.onConsole);
        expect(this.pageErrors.length, `pageerror(s):\n${this.pageErrors.map(e => e.message).join('\n')}`).toBe(0);
        expect(this.severeConsole.length, `console errors:\n${this.severeConsole.join('\n')}`).toBe(0);
    }

    async assertNo404NoBlank(): Promise<void> {
        await expect(this.page).not.toHaveURL(/404/i);

        // NEW: Wait for the DOM to be ready and for any meaningful content container to be visible
        await this.page.waitForLoadState("domcontentloaded");
        await expect(this.page.locator("main")).toBeVisible({ timeout: 5000 });

        const title = await this.page.title();
        expect(title).not.toMatch(/404/i);

        const isBlank = await this.page.evaluate(() => {
            const t = document.body?.innerText?.trim() ?? "";
            return t.length === 0;
        });

        expect(isBlank).toBeFalsy();
    }

    async navigateTabAndSanity(tab: TabKey): Promise<void> {
        await this.startRecoverabilityWatch();
        await this.navigateToTab(tab);
        await this.assertNo404NoBlank();
        await this.assertRecoverableAndDetach();
        await this.backToHomeTab();
    }

    async navigateQuickLinkAndSanity(link: LinkKey): Promise<void> {
        await this.startRecoverabilityWatch();
        await this.navigateToQuickLink(link);
        await this.assertNo404NoBlank();
        await this.assertRecoverableAndDetach();
        // You can choose to return with back or to the Home screen.
        await this.backToHomeTab();
    }

    async clickSearch(): Promise<void> {
        await this.clickElement(this.searchButton);
    }

    async fillInputValueToSearch(value: string): Promise<void> {
        await this.fillText(this.searchField, value)
    }

    async verifySearchFieldVisible(): Promise<void> {
        await this.isElementVisible(this.searchField);
    }

    async searchValue(value: string): Promise<void> {
        await this.clickSearch();
        await this.fillInputValueToSearch(value);
        await this.clickSearch();
    }

    async verifySearchBarIsNotVisible(): Promise<void> {
        await this.isElementHidden(this.searchField);
    }

    async verifySearchBarIsDisable(): Promise<void> {
        await (this.isElementDisable(this.searchField))
    }

    async verifySearchBarIsNotVisibleAndDisable(): Promise<void> {
        await this.verifySearchBarIsNotVisible();
        await this.verifySearchBarIsDisable();
    }

    async clickCart(): Promise<void> {
        await this.clickElement(this.cartContainer);
    }




}