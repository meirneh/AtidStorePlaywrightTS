
import { test, expect } from "../utils/fixtures/baseTest";
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
import type HeaderFooterPage from '../pages/HeaderFooterPage';

import { NAV } from "../utils/test-data/navigation";
import { CART } from "../utils/test-data/cart";
import { HEADER_NAVIGATION } from "../utils/test-data/header-navigation";
import { goToStore } from "../utils/helpers/navigation";

const cases = HEADER_NAVIGATION.cases;

test.describe('Header navigation tabs and cart badge ', () => {
    const warmUpNavigationState = async (headerFooterPage: HeaderFooterPage) => {
        await goToStore(headerFooterPage, NAV.tabs.store);
        await headerFooterPage.goToSelectedTab(NAV.tabs.contactUs);
    };

    const navigateTabAndVerifyUrl = async (page: import("@playwright/test").Page, headerFooterPage: HeaderFooterPage, tab: string, expectedUrl: RegExp) => {
        await headerFooterPage.navigateToTab(tab);
        await expect(page).toHaveURL(expectedUrl);
    };

    const verifyCartBadgeZeroAndStableAfterReload = async (page: import("@playwright/test").Page, headerFooterPage: HeaderFooterPage) => {
        await headerFooterPage.verifyQuantityItemsInCart(CART.empty.badgeCount);
        await page.reload();
        await headerFooterPage.verifyQuantityItemsInCart(CART.empty.badgeCount);
    };

    test.beforeEach(async ({ goHome }) => {
        await goHome();
    })


    test('TC-001 [Normal] Header navigation tabs are routable', async ({ page, headerFooterPage }) => {
        allure.epic('Navigation');
        allure.feature('Header Navigation');
        allure.story('Header tabs are routable');
        allure.severity(Severity.NORMAL);
        await test.step('Warm up navigation state', async () => {
            await warmUpNavigationState(headerFooterPage);
        });
        await test.step('Navigate each header tab and verify URL', async () => {
            for (const [tab, expectedUrl] of cases) {
                await navigateTabAndVerifyUrl(page, headerFooterPage, tab, expectedUrl);
            };
        });
    });

    test('TC-002 [Normal] Cart badge shows 0 on clean session', async ({ page, headerFooterPage }) => {
        allure.epic("Navigation");
        allure.feature('Header cart badge');
        allure.story('Cart badge shows 0 on clean session');
        allure.severity(Severity.NORMAL);
        await test.step('Verify CartBadge shows 0 and remains stable after reload', async () => {
            await verifyCartBadgeZeroAndStableAfterReload(page, headerFooterPage);
        });
    });
})
