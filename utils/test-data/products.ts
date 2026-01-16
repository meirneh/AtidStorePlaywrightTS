export type ProductData = {
    name: string;
    price?: number;
}
export const PRODUCTS = {
    atidYellowShoes: { name: 'ATID Yellow Shoes', price: 120 },
    atidGreenShoes: { name: 'ATID Green Shoes', price: 110 },
    atidBlueShoes: { name: 'ATID Blue Shoes' }, // If there is no fixed price in assertions, we leave it without a price.
    blackHoodie: { name: 'Black Hoodie', price: 150 },
    atidGreenTshirt: { name: 'ATID Green Tshirt', price: 190 },

    // Best sellers (appear as items in the sidebar)
    bohoBangleBracelet: { name: 'Boho Bangle Bracelet' },
    brightGoldPurseWithChain: { name: 'Bright Gold Purse With Chain' },
    buddhaBracelet: { name: 'Buddha Bracelet' },
    flamingoTshirt: { name: 'Flamingo Tshirt' },
    blueHoodie: { name: 'Blue Hoodie', price: 150 },
} as const;