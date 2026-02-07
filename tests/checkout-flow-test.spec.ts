import { test, expect } from "../utils/fixtures/baseTest";
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

  const openProduct = async (headerFooterPage: HeaderFooterPage,categoryPage: CategoryPage,productName: string) => {
    await openProductFromStore(() => goToStoreTab(headerFooterPage), categoryPage, productName);
  };

  const goToCheckoutWithSingleProduct = async (headerFooterPage: HeaderFooterPage, categoryPage: CategoryPage, productDetailsPage: ProductDetailsPage, cartPage: CartPage, productName: string) => {
    await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn),productDetailsPage, productName);
    await openCartFromPdp(productDetailsPage);
    await cartPage.goToCheckout();
  };

  test.beforeEach(async ({ goHome }) => {
    await goHome();
  })
  

  test("TC-032 Guest checkout is accessible and cart is preserved", async ({ headerFooterPage,categoryPage, productDetailsPage, cartPage, checkoutPage, }) => {
    await addProductToCartFromStore((pn: string) => openProduct(headerFooterPage, categoryPage, pn), productDetailsPage, PRODUCTS.atidGreenShoes.name);
    await openCartFromPdp(productDetailsPage);

    await cartPage.verifyCartLines([...CART.lines.greenQtyOne]);
    await cartPage.goToCheckout();

    await checkoutPage.verifyOrderDetails(
      [{ term: PRODUCTS.atidGreenShoes.name, expectedQty: CHECKOUT.orderExpectations.greenShoes.qty }],
      [{ term: PRODUCTS.atidGreenShoes.name, expectedTotal: CHECKOUT.orderExpectations.greenShoes.lineTotal }],
      CHECKOUT.orderExpectations.greenShoes.subTotal,
      CHECKOUT.orderExpectations.greenShoes.orderTotal
    );
  });

  test("TC-033 Shipping address requires mandatory fields", async ({headerFooterPage, categoryPage, productDetailsPage, cartPage, checkoutPage}) => {
    await goToCheckoutWithSingleProduct(headerFooterPage, categoryPage, productDetailsPage, cartPage,PRODUCTS.atidGreenShoes.name);
    await checkoutPage.placeOrder();
    await checkoutPage.verifyErrorsMessagesTexts();
  });

  test("TC-034 Shipping method selection updates totals", async ({headerFooterPage, categoryPage, productDetailsPage, cartPage, checkoutPage}) => {
    await goToCheckoutWithSingleProduct(headerFooterPage, categoryPage, productDetailsPage, cartPage, PRODUCTS.atidGreenShoes.name);

    await checkoutPage.selectShippingOption(CHECKOUT.shippingOptions.deliveryExpress);
    await checkoutPage.verifyTotalsAfterShippingChange(CHECKOUT.shippingCosts.deliveryExpress);

    await checkoutPage.selectShippingOption(CHECKOUT.shippingOptions.registeredMail);
    await checkoutPage.verifyRegisteredMailSelected();
    await checkoutPage.verifyTotalsAfterShippingChange(CHECKOUT.shippingCosts.registeredMail);

    await checkoutPage.selectShippingOption(CHECKOUT.shippingOptions.localPickup);
    await checkoutPage.verifyTotalsAfterShippingChange(CHECKOUT.shippingCosts.localPickup);
  });

  test("TC-035 Payment step accepts valid path", async ({headerFooterPage, categoryPage, productDetailsPage, cartPage, checkoutPage}) => {
    await goToCheckoutWithSingleProduct(headerFooterPage, categoryPage, productDetailsPage, cartPage, PRODUCTS.atidGreenShoes.name);
    await checkoutPage.selectShippingOption(CHECKOUT.shippingOptions.deliveryExpress);
    await checkoutPage.fillBillInfo(BILLING_ISRAEL);
    await checkoutPage.placeOrder();
    await checkoutPage.verifyInvalidPaymentMessage();
  });
});
