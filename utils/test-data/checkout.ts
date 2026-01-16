export type BillingInfo = {
    firstName: string;
    lastName: string;
    company?: string;
    country: string;
    address: string;
    appartment?: string;
    postcode: string;
    city: string;
    phone: string;
    email: string;
};

export const BILLING_ISRAEL: BillingInfo = {
    firstName: "Haim",
    lastName: "Cohen",
    company: "Cohen LTD.", // optional
    country: "Israel",
    address: "Ha Jasmin 8",
    appartment: "floor 1", // optional
    postcode: "1234567",
    city: "Tel Aviv",
    phone: "050-1234567",
    email: "cohen@gmail.com",
};

export const CHECKOUT = {
    shippingOptions: {
        deliveryExpress: "deliveryExpress",
        registeredMail: "registeredMail",
        localPickup: "localPickup",
    },

    shippingCosts: {
        deliveryExpress: 12.5,
        registeredMail: 5.9,
        localPickup: 0,
    },
    orderExpectations: {
        greenShoes: {
            qty: 1,
            lineTotal: 110.0,
            subTotal: 110.0,
            orderTotal: 110.0,
        },
    },

} as const;
