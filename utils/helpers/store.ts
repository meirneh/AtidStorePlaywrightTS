import { goToStore } from './navigation';
type CategoryLike = {
    selectProductByName: (productName: string) => Promise<void>;
};

export const openProductFromStore = async (
    goToStore: () => Promise<void>,
    categoryPage: CategoryLike,
    productName: string
): Promise<void> => {
    await goToStore();
    await categoryPage.selectProductByName(productName);
}