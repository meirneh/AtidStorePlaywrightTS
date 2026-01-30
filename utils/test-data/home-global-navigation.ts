import { NAV } from "./navigation";
import type { LinkKey } from "../../pages/HeaderFooterPage";

export const HOME_GLOBAL_NAVIGATION = {
  cases: [
    [NAV.tabs.store, /\/store\/?$/i],
    [NAV.tabs.men, /\/product-category\/men\/?$/i],
    [NAV.tabs.women, /\/product-category\/women\/?$/i],
    [NAV.tabs.accessories, /\/product-category\/accessories\/?$/i],
    [NAV.tabs.about, /\/about\/?$/i],
    [NAV.tabs.contactUs, /\/contact-us\/?$/i],
  ] as Array<[string, RegExp]>,

  quickLinks: [
    ["CART", /\/cart(-\d+)?\/?$/i],
    ["CONTACT US", /\/contact-us\/?$/i],
    ["ABOUT", /\/about\/?$/i],
  ] as ReadonlyArray<readonly [LinkKey, RegExp]>,
} as const;
