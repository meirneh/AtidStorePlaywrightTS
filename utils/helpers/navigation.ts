import HeaderFoterPage from "../../pages/HeaderFooterPage";

export const goToStore = async (headerFooterPage:HeaderFoterPage, storeTab: string) => {
    await headerFooterPage.navigateToTab(storeTab)
}