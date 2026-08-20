import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  price: number; // centimes
  quantity: number;
  notes?: string;
};

type CartState = {
  items: CartItem[];
  tableId: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setTableId: (tableId: string | null) => void;
  clear: () => void;
  total: () => number;
};

// Panier — données publiques uniquement (pas de token, pas de moyen de
// paiement). Voir LUMINA_FRONTEND_CONTEXT.md 4.6.
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableId: null,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        })),
      setTableId: (tableId) => set({ tableId }),
      clear: () => set({ items: [], tableId: null }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "lumina-cart" }
  )
);
