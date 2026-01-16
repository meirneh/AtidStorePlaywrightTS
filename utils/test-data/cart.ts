import { PRODUCTS } from './products';

export const CART = {
    empty: {
        badgeCount: '0',
        headerAmount: '0.00',
    },

    quantities: {
        zero: 0,
        one: 1,
        two: 2,
        three: 3,
        invalidNegative: -1,
    },

    header: {
        singleYellow: {
            badgeCount: '1',
            headerAmount: '120.00',
        },
        twoItemsYellowPlusHoodie: {
            badgeCount: '2',
            headerAmount: '270.00',
        },
        yellowQtyTwo: {
            badgeCount: '2',
            headerAmount: '240.00',
        },
        afterRemoveYellowFromYellowPlusHoodie: {
            badgeCount: '1',
            headerAmount: '150.00',
        },
    },

    lines: {
        yellowQtyOne: [
            {
                term: PRODUCTS.atidYellowShoes.name,
                expectedPrice: 120.0,
                expectedQty: 1,
                expectedSubtotal: 120.0,
            },
        ],
        yellowQtyTwo: [
            {
                term: PRODUCTS.atidYellowShoes.name,
                expectedPrice: 120.0,
                expectedQty: 2,
                expectedSubtotal: 240.0,
            },
        ],
        yellowPlusHoodieQtyOne: [
            {
                term: PRODUCTS.atidYellowShoes.name,
                expectedPrice: 120.0,
                expectedQty: 1,
                expectedSubtotal: 120.0,
            },
            {
                term: PRODUCTS.blackHoodie.name,
                expectedPrice: 150.0,
                expectedQty: 1,
                expectedSubtotal: 150.0,
            },
        ],
        hoodieQtyOne: [
            {
                term: PRODUCTS.blackHoodie.name,
                expectedPrice: 150.0,
                expectedQty: 1,
                expectedSubtotal: 150.0,
            },
        ],
        greenQtyOne: [
            {
                term: PRODUCTS.atidGreenShoes.name,
                expectedPrice: 110.0,
                expectedQty: 1,
                expectedSubtotal: 110.0,
            },
        ],

        greenShoesQtyOne: [
            {
                term: PRODUCTS.atidGreenShoes.name,
                expectedPrice: 110.0,
                expectedQty: 1,
                expectedSubtotal: 110.0,
            },
        ],

        greenTshirtQtyThree: [
            {
                term: PRODUCTS.atidGreenTshirt.name,
                expectedPrice: 190.0,
                expectedQty: 3,
                expectedSubtotal: 570.0,
            },
        ],

        greenShoesQtyOnePlusGreenTshirtQtyThree: [
            {
                term: PRODUCTS.atidGreenShoes.name,
                expectedPrice: 110.0,
                expectedQty: 1,
                expectedSubtotal: 110.0,
            },
            {
                term: PRODUCTS.atidGreenTshirt.name,
                expectedPrice: 190.0,
                expectedQty: 3,
                expectedSubtotal: 570.0,
            },
        ],
        greenShoesQtyTwo: [
            {
                term: PRODUCTS.atidGreenShoes.name,
                expectedPrice: 110.0,
                expectedQty: 2,
                expectedSubtotal: 220.0,
            },
        ],
    },
    totals: {
        greenShoesQtyOne: 110.0,
        greenShoesQtyTwo: 220.0,
        greenShoesPlusGreenTshirt: 680.0,
    },
} as const;
