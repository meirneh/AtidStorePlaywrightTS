import ProductDetailsPage from "../../pages/ProductDetailsPage";

type OpenProductLike = (productName: string) => Promise<void>;
type ProductDetailsLike = { addToCart: () => Promise<void> };
type ProductDetailsWithCartLike = {
    addToCart: () => Promise<void>;
    viewCart: ()=> Promise<void>;
};

export const addProductToCartFromStore = async (
  openProduct: OpenProductLike,
  productDetailsPage: ProductDetailsLike,
  productName: string
): Promise<void> => {
  await openProduct(productName);
  await productDetailsPage.addToCart();
};

export const addProductToCartFromStoreAndOpenCart = async (
    openProduct: OpenProductLike,
    productDetailsPage: ProductDetailsWithCartLike,
    productName: string
) => {
    await openProduct(productName);
    await productDetailsPage.addToCart();
    await productDetailsPage.viewCart();   
}