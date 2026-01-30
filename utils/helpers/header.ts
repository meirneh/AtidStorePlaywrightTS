import { expect } from "@playwright/test";

type HeaderFooterLike = {
  getQuantityItemsInCartCount: () => Promise<number>;
  verifyTotalItemsInCart: (headerAmount: any) => Promise<void>;
};

export const verifyHeaderCartBadgeAndTotal = async (
  headerFooterPage: HeaderFooterLike,
  expectedBadgeCount: number,
  expectedHeaderAmount: any,
  timeout = 1000
): Promise<void> => {
  await expect
    .poll(async () => await headerFooterPage.getQuantityItemsInCartCount(), { timeout })
    .toBe(expectedBadgeCount);

  await headerFooterPage.verifyTotalItemsInCart(expectedHeaderAmount);
};
