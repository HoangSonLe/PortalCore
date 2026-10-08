import type { Locale, Messages } from '@hoangsonle/portal-core';

export const messages: Partial<Record<Locale, Messages>> = {
  vi: {
    'menu.dashboard': 'Tổng quan',
    'menu.catalog': 'Danh mục',
    'menu.categories': 'Danh mục mẫu',
  },
  en: {
    'menu.dashboard': 'Dashboard',
    'menu.catalog': 'Catalog',
    'menu.categories': 'Categories',
  },
};
