import HeaderFooterPage from "../../pages/HeaderFooterPage";

export const goToStore = async (headerFooterPage:HeaderFooterPage, storeTab: string) => {
    await headerFooterPage.navigateToTab(storeTab)
}