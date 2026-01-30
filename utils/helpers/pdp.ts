type ProductsDetailsLike = {
    viewCart: () => Promise<void>;
}

export const openCartFromPdp = async (productDetailsPage:ProductsDetailsLike) => {
   await productDetailsPage.viewCart(); 
}