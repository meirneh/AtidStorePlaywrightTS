import { Page} from "@playwright/test";
export const reloadDom = async (page: Page) => {
   await page.reload({ waitUntil: "domcontentloaded"}) 
}