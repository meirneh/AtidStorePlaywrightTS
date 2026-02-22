import { test, expect } from "../utils/fixtures/baseTest";
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
import type HeaderFooterPage from "../pages/HeaderFooterPage";
import type CategoryPage from "../pages/CategoryPage";
import type ProductDetailsPage from "../pages/ProductDetailsPage";
import type CartPage from "../pages/CartPage";

import { NAV } from "../utils/test-data/navigation";
import { PRODUCTS } from "../utils/test-data/products";
import { CART } from "../utils/test-data/cart";
import { BILLING_ISRAEL, CHECKOUT } from "../utils/test-data/checkout";

import { goToStore } from "../utils/helpers/navigation";
import { openCartFromPdp } from "../utils/helpers/pdp";
import { addProductToCartFromStore } from "../utils/helpers/cart-actions";
import { openProductFromStore } from "../utils/helpers/store";

test.describe("Checkout Flow Shipping, Payment and Order Review", () => {
  const goToStoreTab = async (headerFooterPage: HeaderFooterPage) => {
    await goToStore(headerFooterPage, NAV.tabs.store);
  };

  const openProduct = async (headerFooterPage: HeaderFooterPage, categoryPage: CategoryPage, productName: string) => {
    await openProductFromStore(() => goToStoreTab(headerFooterPage), categoryPage, productName);
  };

  const goToCheckoutWithSingleProduct = async (headerFooterPage: HeaderFooterPage, categoryPage: CategoryPage, productDetailsPage: ProductDetailsPage, cartPage: CartPage, productName: string) => {
    await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, productName);
    await openCartFromPdp(productDetailsPage);
    await cartPage.goToCheckout();
  };

  test.beforeEach(async ({ goHome }) => {
    await goHome();
  })


  test("TC-032 [Critical] Guest checkout is accessible and cart is preserved", async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage, checkoutPage, }) => {
    allure.epic('Checkout');
    allure.feature('Guest checkout');
    allure.story("cart preserved when checkout requires login");
    allure.severity(Severity.CRITICAL);
    await test.step('Add product to cart from Store', async () => {
      await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidGreenShoes.name);
    });
    await test.step('Open cart from PDP', async () => {
      await openCartFromPdp(productDetailsPage);
    });
    await test.step('Verify cart lines', async () => {
      await cartPage.verifyCartLines([...CART.lines.greenQtyOne]);
    });
    await test.step('Proceed  to checkout', async () => {
      await cartPage.goToCheckout();
    });
    await test.step('Verify order details in Checkout', async () => {
      await checkoutPage.verifyOrderDetails(
        [{ term: PRODUCTS.atidGreenShoes.name, expectedQty: CHECKOUT.orderExpectations.greenShoes.qty }],
        [{ term: PRODUCTS.atidGreenShoes.name, expectedTotal: CHECKOUT.orderExpectations.greenShoes.lineTotal }],
        CHECKOUT.orderExpectations.greenShoes.subTotal,
        CHECKOUT.orderExpectations.greenShoes.orderTotal
      );
    })
  });

  test("TC-033 [Critical] Shipping address requires mandatory fields", async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage, checkoutPage }) => {
    allure.epic('Checkout');
    allure.feature('Shipping address');
    allure.story("Mandatory fields validation");
    allure.severity(Severity.CRITICAL);
    await test.step('Go to Checkout with a single product', async () => {
      await goToCheckoutWithSingleProduct(headerFooterPage, categoryPage, productDetailsPage, cartPage, PRODUCTS.atidGreenShoes.name);
    });
    await test.step('Submit shipping address with mising fields', async () => {
      await checkoutPage.placeOrder();
    });
    await test.step('Verify validation error messages', async () => {
      await checkoutPage.verifyErrorsMessagesTexts();
    });
  });

  test("TC-034 [Normal] Shipping method selection updates totals", async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage, checkoutPage }) => {
    allure.epic('Checkout');
    allure.feature('Shipping method');
    allure.story('Shipping option updates totals');
    allure.severity(Severity.NORMAL);
    await test.step('Go to Checkout with a single product', async () => {
      await goToCheckoutWithSingleProduct(headerFooterPage, categoryPage, productDetailsPage, cartPage, PRODUCTS.atidGreenShoes.name);
    });
    await test.step('Select Express Delivery and verify totals', async () => {
      await checkoutPage.selectShippingOption(CHECKOUT.shippingOptions.deliveryExpress);
      await checkoutPage.verifyTotalsAfterShippingChange(CHECKOUT.shippingCosts.deliveryExpress);
    });
    await test.step('Select Registered Mail and verify totals ', async () => {
      await checkoutPage.selectShippingOption(CHECKOUT.shippingOptions.registeredMail);
      await checkoutPage.verifyRegisteredMailSelected();
      await checkoutPage.verifyTotalsAfterShippingChange(CHECKOUT.shippingCosts.registeredMail);
    });
    await test.step('Select Local Pickup and verify totals', async () => {
      await checkoutPage.selectShippingOption(CHECKOUT.shippingOptions.localPickup);
      await checkoutPage.verifyTotalsAfterShippingChange(CHECKOUT.shippingCosts.localPickup);
    })
  });

  test("TC-035 [Critical] Payment step accepts valid path", async ({ headerFooterPage, categoryPage, productDetailsPage, cartPage, checkoutPage }) => {
    allure.epic('Checkout');
    allure.feature('Payment');
    allure.story('Submit payment and verify expected outcome');
    allure.severity(Severity.CRITICAL);
    await test.step('Go to Checkout with a single product', async () => {
      await goToCheckoutWithSingleProduct(headerFooterPage, categoryPage, productDetailsPage, cartPage, PRODUCTS.atidGreenShoes.name);
    });
    await test.step('Select shipping method', async () => {
      await checkoutPage.selectShippingOption(CHECKOUT.shippingOptions.deliveryExpress);
    });
    await test.step('Fill billing information', async () => {
      await checkoutPage.fillBillInfo(BILLING_ISRAEL);
    });
    await test.step('Submit order', async () => {
      await checkoutPage.placeOrder();
    });
    await test.step('Verify payment message', async () => {
    await checkoutPage.verifyInvalidPaymentMessage();  
    }) 
  });
});
