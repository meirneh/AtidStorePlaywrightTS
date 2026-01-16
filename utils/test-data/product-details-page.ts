import { PRODUCTS } from './products';

const yellowShoesPrice = PRODUCTS.atidYellowShoes.price ?? 0;

export const PDP = {
    product: {
        name: PRODUCTS.atidYellowShoes.name,
        unitPrice: yellowShoesPrice,
    },

    cart: {
        qty: {
            zero: "0",
            one: "1",
            two: "2",
            three: "3",
        },
        totals: {
            empty: "0.00",
            oneItem: `${yellowShoesPrice.toFixed(2)}`,
            twoItems: `${(yellowShoesPrice * 2).toFixed(2)}`,
            threeItems: `${(yellowShoesPrice * 3).toFixed(2)}`,
        },
    },

    currency: {
        symbol: "₪",
    },
} as const;