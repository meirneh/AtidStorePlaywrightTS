export const CATALOG = {
  categories: {
    accessories: 'Accessories',
    men: 'Men',
    women: 'Women',
  },

  bestSellersItems: [
    'Boho Bangle Bracelet',
    'Bright Gold Purse With Chain',
    'Buddha Bracelet',
    'Flamingo Tshirt',
    'Blue Hoodie',
  ] as readonly string[],

  priceFilter: {
    defaultRange: { min: 30, max: 250 },

    // Values used in this spec for the slider behavior + URL params
    narrowedRange: {
      min: 30,
      max: 120,
      sliderDrag: { minOffset: 0, maxOffset: -130 },
      expectedMinText: '30',
      expectedMaxText: '120',
    },

    // Expected reset values after selecting Men from sidebar
    afterSelectMenReset: {
      expectedMinText: '80',
      expectedMaxText: '190',
    },
  },
} as const;
