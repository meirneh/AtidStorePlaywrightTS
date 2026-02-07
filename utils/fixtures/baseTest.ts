import { test as base, expect } from "@playwright/test";
import { SITE } from "../test-data/site";
import HeaderFooterPage from "../../pages/HeaderFooterPage";
import CategoryPage from '../../pages/CategoryPage';
import ProductDetailsPage from '../../pages/ProductDetailsPage';
import CartPage from '../../pages/CartPage';
import CheckoutPage from "../../pages/CheckoutPage";
import AboutPage from "../../pages/AboutPage";
import ContactUsPage from "../../pages/ContacUsPage";
import SearchResultPage from "../../pages/SearchResultPage";

type Fixtures = {
  headerFooterPage: HeaderFooterPage;
  categoryPage: CategoryPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  aboutPage: AboutPage;
  contactUsPage: ContactUsPage;
  searchResultPage: SearchResultPage; 
  goHome: () => Promise<void>;
};


export const test = base.extend<Fixtures>({
  headerFooterPage: async ({ page }, use) => {
    await use(new HeaderFooterPage(page));
  },

  categoryPage: async ({ page }, use) => {
    await use(new CategoryPage(page));
  },

  productDetailsPage: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => { 
    await use(new CheckoutPage(page)); 
  },
  aboutPage: async ({ page }, use) => { 
    await use(new AboutPage(page)); 
  },
  contactUsPage: async ({ page }, use) => { 
    await use(new ContactUsPage(page)); 
  },
  searchResultPage: async ({ page }, use) => { 
    await use(new SearchResultPage(page)); 
  }, 

  goHome: async ({ page }, use) => {
    await use(async () => {
      await page.goto(SITE.baseUrl, { waitUntil: "domcontentloaded" });
    });
  },
});

export { expect };
