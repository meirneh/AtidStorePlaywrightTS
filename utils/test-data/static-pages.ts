import { SITE } from "./site";
import { NAV } from "./navigation";

export const STATIC_PAGES = {
    quickLinks: {
        about: NAV.tabs.about,
        contactUs: NAV.tabs.contactUs
    },
    urls: {
        about: new URL(SITE.aboutPath, SITE.baseUrl).toString(),
        contactUs: new URL(SITE.contactPath, SITE.baseUrl).toString(),
    },
    contactForm: {
        valid: {
            name: "Haim",
            subject: "Test subject",
            email: "haim@gmail.com",
            message: "test message",
        },
    },

} as const;