import { NAV } from "./navigation";

export const HEADER_NAVIGATION = {
    cases: [
        [NAV.tabs.store, /atid\.store\/store/i],
        [NAV.tabs.men, /product-category\/men/i],
        [NAV.tabs.women, /product-category\/women/i],
        [NAV.tabs.accessories, /product-category\/accessories/i],
        [NAV.tabs.about, /about/i],
        [NAV.tabs.contactUs, /contact-us/i],
    ] as Array<[string, RegExp]>,
} as const;
