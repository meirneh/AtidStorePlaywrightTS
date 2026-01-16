export const COUPONS = {
    valid: {
        code: 'kuku',
        expectedTotalBeforeDiscount: 110,
        expectedTotalAfterDiscount: 88,
    },
    invalid: {
        code: 'XXXXX',
    },
} as const;
