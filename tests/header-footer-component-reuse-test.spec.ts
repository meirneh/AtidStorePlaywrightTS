
import { test, expect } from "../utils/fixtures/baseTest";
import type HeaderFooterPage from "../pages/HeaderFooterPage";
import type CategoryPage from "../pages/CategoryPage";
import type AboutPage from "../pages/AboutPage";
import type ContactUsPage from "../pages/ContacUsPage";
import type ProductDetailsPage from '../pages/ProductDetailsPage';

import { NAV } from "../utils/test-data/navigation";
import { CART } from "../utils/test-data/cart";
import { PRODUCTS } from "../utils/test-data/products";
import { HEADER_FOOTER_COMPONENT_REUSE } from "../utils/test-data/header-footer-component-reuse";
import { goToStore } from "../utils/helpers/navigation";
import { openProductFromStore } from '../utils/helpers/store';
import { addProductToCartFromStore } from "../utils/helpers/cart-actions";

const cases = HEADER_FOOTER_COMPONENT_REUSE.cases;
type HeaderFooterCase = (typeof cases)[number];

test.describe('Header/Footer Component Reuse — cross-page header/footer consistency', () => {

    const goToStoreTab = async (headerFooterPage: HeaderFooterPage) => {
        await goToStore(headerFooterPage, NAV.tabs.store);
    };

    const openProduct = async (headerFooterPage: HeaderFooterPage, categoryPage: CategoryPage, productName: string) => {
        await openProductFromStore(() => goToStoreTab(headerFooterPage), categoryPage, productName);
    };

    const warmUpNavState = async (headerFooterPage: HeaderFooterPage) => {
        await goToStore(headerFooterPage, NAV.tabs.store);
        await headerFooterPage.goToSelectedTab(NAV.tabs.contactUs);
    }

    const verifyCaseLanding = async ( 
        page: import("@playwright/test").Page, 
        headerFooterPage: HeaderFooterPage, 
        categoryPage: CategoryPage, 
        aboutPage: AboutPage, 
        contactUsPage: ContactUsPage, 
        c: HeaderFooterCase 
    ) => { 
        await headerFooterPage.navigateToTab(c.tab); 
        await expect(page).toHaveURL(c.url); 

        if (c.breadcrumb) {
            await categoryPage.verifyBreadCrumbCategoryText(c.breadcrumb);
        }

        if (c.pageType === "about") {
            await aboutPage.verifyAboutUsTextTitle();
        }

        if (c.pageType === "contact") {
            await contactUsPage.verifyContactUsTextTitle();
        }
    };

    const verifyHeaderAcrossCases = async (page: import("@playwright/test").Page, headerFooterPage: HeaderFooterPage, categoryPage: CategoryPage, aboutPage: AboutPage, contactUsPage: ContactUsPage) => {
        for (const c of cases) {
            await verifyCaseLanding(page, headerFooterPage, categoryPage, aboutPage, contactUsPage, c);
        }
    }

    const addOneProductToCartFromStore = async (headerFooterPage: HeaderFooterPage, categoryPage: CategoryPage, productDetailsPage: ProductDetailsPage) => {
        await addProductToCartFromStore(
            (pn: string) => openProduct(headerFooterPage, categoryPage, pn),
            productDetailsPage,
            PRODUCTS.atidGreenShoes.name
        );
    };


    const verifyCartBadgeAcrossCases = async (headerFooterPage: HeaderFooterPage, expectedQty: string) => {
        for (const c of cases) {
            await headerFooterPage.navigateToTab(c.tab);
            await headerFooterPage.verifyQuantityItemsInCart(expectedQty);
        }
    };

    const openSearchAndVerifyFieldVisible = async (headerFooterPage: HeaderFooterPage) => {
        await goToStore(headerFooterPage, NAV.tabs.store);
        await headerFooterPage.clickSearch();
        await headerFooterPage.verifySearchFieldVisible();
    };

    const verifySearchBarDisabledAcrossCases = async (page: import("@playwright/test").Page, headerFooterPage: HeaderFooterPage) => {
        for (const c of cases) {
            await headerFooterPage.navigateToTab(c.tab);
            await expect(page).toHaveURL(c.url);
            await headerFooterPage.verifySearchBarIsNotVisibleAndDisable();
        }
    }

    test.beforeEach(async ({ goHome }) => {
        await goHome();
    })


    test('TC-059 Header appears on all main pages', async ({ page, headerFooterPage, categoryPage, aboutPage, contactUsPage }) => {
        await warmUpNavState(headerFooterPage);
        await verifyHeaderAcrossCases(page, headerFooterPage, categoryPage, aboutPage, contactUsPage);
    })

    test('TC-061 CartBadge/amount present across pages ', async ({headerFooterPage, categoryPage, productDetailsPage}) => {
        await addOneProductToCartFromStore(headerFooterPage, categoryPage, productDetailsPage);
        await verifyCartBadgeAcrossCases(headerFooterPage, String(CART.quantities.one));
    })

    test('TC-062 Negative header actions do not break page state ', async ({page, headerFooterPage}) => {
        await openSearchAndVerifyFieldVisible(headerFooterPage);
        await verifySearchBarDisabledAcrossCases(page, headerFooterPage);
    })
})
