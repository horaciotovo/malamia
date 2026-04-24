import { create } from 'zustand';
import { CartItem, Product } from '../types';
import { cartApi } from '../services/api';

function normalizeCartItem(item: any): CartItem {
  if (!item.product) return item;
  return {
    ...item,
    product: {
      ...item.product,
      price: parseFloat(item.product.price),
      compareAtPrice: item.product.compareAtPrice != null ? parseFloat(item.product.compareAtPrice) : undefined,
    },
  };
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

interface CartActions {
  fetchCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState & CartActions>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await cartApi.getCart();
      set({ items: (data.data.items ?? []).map(normalizeCartItem) });
    } catch {
      set({ error: 'Failed to load cart.' });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (product, quantity = 1) => {
    // Optimistic update
    const { items } = get();
    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i,
        ),
      });
    } else {
      set({
        items: [...items, { id: `temp-${product.id}`, productId: product.id, product, quantity }],
      });
    }

    try {
      await cartApi.addItem(product.id, quantity);
      // Refetch to get server state (with real IDs)
      const { data } = await cartApi.getCart();
      set({ items: (data.data.items ?? []).map(normalizeCartItem) });
    } catch {
      // Revert optimistic update
      set({ items });
      throw new Error('Failed to add item to cart.');
    }
  },

  updateItem: async (itemId, quantity) => {
    const prev = get().items;
    set({
      items: prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    });
    try {
      await cartApi.updateItem(itemId, quantity);
    } catch {
      set({ items: prev });
      throw new Error('Failed to update item.');
    }
  },

  removeItem: async (itemId) => {
    const prev = get().items;
    set({ items: prev.filter((i) => i.id !== itemId) });
    try {
      await cartApi.removeItem(itemId);
    } catch {
      set({ items: prev });
      throw new Error('Failed to remove item.');
    }
  },

  clearCart: async () => {
    const prev = get().items;
    set({ items: [] });
    try {
      await cartApi.clearCart();
    } catch {
      set({ items: prev });
    }
  },

  getTotal: () => {
    return get().items.reduce((sum, item) => {
      const price = item.product?.price ?? 0;
      return sum + price * item.quantity;
    }, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
