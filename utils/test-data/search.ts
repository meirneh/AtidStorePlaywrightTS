export const SEARCH = {
  header: {
    term: 'shirt',
    expectedResultsCount: 8,
  },

  sidebarCatalog: {
    initialProductsCount: 12,
    term: 'Shirt',
    filteredProductsCount: 7,
    expectedContains: 'Shirt',
  },

  negative: {
    empty: '',
    noMatch: 'pizza',
  },

  echo: {
    term: 'men',
  },
} as const;
