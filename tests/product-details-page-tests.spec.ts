import { test, expect, chromium, Browser, Page, BrowserContext } from "@playwright/test";
import HeaderFooterPage from "../pages/HeaderFooterPage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";

let browser: Browser;
let context: BrowserContext;
let page: Page;
let headerFooterPage: HeaderFooterPage;
let categoryPage: CategoryPage;
let productDetailsPage: ProductDetailsPage;

test.describe('Product Details Page Info and Cart Behavior', () => {
    test.beforeEach(async () => {
        browser = await chromium.launch({ channel: "chrome", slowMo: 500 });
        context = await browser.newContext();
        page = await context.newPage();
        await page.goto("https://atid.store/");
        headerFooterPage = new HeaderFooterPage(page);
        categoryPage = new CategoryPage(page);
        productDetailsPage = new ProductDetailsPage(page);
    });

    test.afterAll(async () => {
        await context?.close();
        await page?.close();
    })


    test('018 Product Details (PDP)', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Yellow Shoes");
        await productDetailsPage.verifyProductDetailsInfo("ATID Yellow Shoes", 120);
        await productDetailsPage.verifyAddToCartButtonEnableAndVisible();
    })

    test('TC-019 Add to cart updates CartBadge and header amount', async () => {
        await headerFooterPage.verifyQuantityItemsInCart("0");
        await headerFooterPage.verifyTotalItemsInCart("0.00");
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Yellow Shoes");
        await productDetailsPage.addToCart();
        await headerFooterPage.verifyQuantityItemsInCart("1");
        await headerFooterPage.verifyTotalItemsInCart("120.00")
        await productDetailsPage.verifyNoticeMessageText("ATID Yellow Shoes");
        await headerFooterPage.showItemsInCart();
    });

    test('TC-020 Re-adding same product increments quantity', async () => {
        await headerFooterPage.verifyQuantityItemsInCart("0");
        await headerFooterPage.verifyTotalItemsInCart("0.00");
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Yellow Shoes");
        await productDetailsPage.incrementQuantity(1);
        await productDetailsPage.addToCart();
        await headerFooterPage.verifyQuantityItemsInCart("2");
        await headerFooterPage.verifyTotalItemsInCart("240.00");

    });

    test('TC-021 Quantity control affects add amount', async () => {
        await headerFooterPage.verifyQuantityItemsInCart("0");
        await headerFooterPage.verifyTotalItemsInCart("0.00");
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Yellow Shoes");
        await productDetailsPage.incrementQuantity(2);
        await productDetailsPage.addToCart();
        await headerFooterPage.verifyQuantityItemsInCart("3");
        await headerFooterPage.verifyTotalItemsInCart("360.00");
    });

    test('TC-022 Negative – invalid qty blocked ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Yellow Shoes");
        await productDetailsPage.decrementQuantity(1);
        await productDetailsPage.verifyQuantityText("1")
    })

    test('TC-023 Price format consistency ', async () => {
        await headerFooterPage.navigateToTab("STORE");
        await categoryPage.selectProductByName("ATID Yellow Shoes");
        await productDetailsPage.verifyPriceFormat("₪");

    })








})

