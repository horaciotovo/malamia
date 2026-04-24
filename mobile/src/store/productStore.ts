import { create } from 'zustand';
import { Product, Category } from '../types';
import { productsApi } from '../services/api';

// Prisma Decimal fields arrive as strings over JSON — coerce them to numbers
function normalizeProduct(p: any): Product {
  return {
    ...p,
    price: parseFloat(p.price),
    compareAtPrice: p.compareAtPrice != null ? parseFloat(p.compareAtPrice) : undefined,
  };
}

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  categories: Category[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

interface ProductActions {
  fetchProducts: (reset?: boolean) => Promise<void>;
  fetchFeatured: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  setCategory: (categoryId: string | null) => void;
  setSearch: (query: string) => void;
  loadMore: () => Promise<void>;
}

const LIMIT = 20;

export const useProductStore = create<ProductState & ProductActions>((set, get) => ({
  products: [],
  featuredProducts: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  isLoading: false,
  isLoadingMore: false,
  error: null,
  page: 1,
  hasMore: true,

  fetchProducts: async (reset = false) => {
    const { selectedCategory, searchQuery } = get();
    set({ isLoading: true, error: null });
    if (reset) set({ products: [], page: 1, hasMore: true });
    try {
      const { data } = await productsApi.list({
        page: 1,
        limit: LIMIT,
        category: selectedCategory ?? undefined,
        search: searchQuery || undefined,
      });
      const result = data.data;
      set({
        products: result.data.map(normalizeProduct),
        page: 1,
        hasMore: result.page < result.totalPages,
      });
    } catch {
      set({ error: 'Failed to load products.' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadMore: async () => {
    const { isLoadingMore, hasMore, page, products, selectedCategory, searchQuery } = get();
    if (isLoadingMore || !hasMore) return;
    set({ isLoadingMore: true });
    const nextPage = page + 1;
    try {
      const { data } = await productsApi.list({
        page: nextPage,
        limit: LIMIT,
        category: selectedCategory ?? undefined,
        search: searchQuery || undefined,
      });
      const result = data.data;
      set({
        products: [...products, ...result.data.map(normalizeProduct)],
        page: nextPage,
        hasMore: nextPage < result.totalPages,
      });
    } catch {
      // ignore pagination errors silently
    } finally {
      set({ isLoadingMore: false });
    }
  },

  fetchFeatured: async () => {
    try {
      const { data } = await productsApi.list({ featured: true, limit: 10 });
      set({ featuredProducts: data.data.data.map(normalizeProduct) });
    } catch {
      // non-critical
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await productsApi.getCategories();
      set({ categories: data.data });
    } catch {
      // non-critical
    }
  },

  setCategory: (categoryId) => {
    set({ selectedCategory: categoryId });
    get().fetchProducts(true);
  },

  setSearch: (query) => {
    set({ searchQuery: query });
    get().fetchProducts(true);
  },
}));
