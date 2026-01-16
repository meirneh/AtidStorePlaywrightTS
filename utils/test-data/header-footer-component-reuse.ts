import { NAV } from "./navigation";
import { CATALOG } from "./catalog";

export type HeaderFooterCase = {
    tab: string;
    url: RegExp;
    pageType: "category" | "about" | "contact";
    breadcrumb?: string;
};

export const HEADER_FOOTER_COMPONENT_REUSE = {
    cases: [
        { tab: NAV.tabs.store, url: /\/store\/?$/, pageType: "category", breadcrumb: "Store" },
        { tab: NAV.tabs.men, url: /\/product-category\/men\/?$/, pageType: "category", breadcrumb: CATALOG.categories.men },
        { tab: NAV.tabs.women, url: /\/product-category\/women\/?$/, pageType: "category", breadcrumb: CATALOG.categories.women },
        {
            tab: NAV.tabs.accessories,
            url: /\/product-category\/accessories\/?$/,
            pageType: "category",
            breadcrumb: CATALOG.categories.accessories,
        },
        { tab: NAV.tabs.about, url: /\/about\/?$/, pageType: "about" },
        { tab: NAV.tabs.contactUs, url: /\/contact-us\/?$/, pageType: "contact" },
    ] as HeaderFooterCase[],
} as const;