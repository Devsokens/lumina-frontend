import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  price: number; // centimes, indicatif : le total réel est recalculé par le serveur
  quantity: number;
  notes?: string;
};

type CartState = {
  // Le panier appartient à UNE vitrine : changer de tenant le vide (sinon les
  // articles d'un autre établissement partiraient dans la commande → 404).
  tenantSlug: string | null;
  items: CartItem[];
  tableId: string | null;
  bindTenant: (slug: string) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setTableId: (tableId: string | null) => void;
  clear: () => void;
  total: () => number;
};

const MAX_QUANTITY = 99;

// Panier — données publiques uniquement (pas de token, pas de moyen de
// paiement). Voir LUMINA_FRONTEND_CONTEXT.md 4.6.
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      tenantSlug: null,
      items: [],
      tableId: null,
      bindTenant: (slug) => {
        if (get().tenantSlug !== slug) set({ tenantSlug: slug, items: [], tableId: null });
      },
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: Math.min(MAX_QUANTITY, i.quantity + item.quantity) }
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
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, Math.min(MAX_QUANTITY, quantity)) }
              : i
          ),
        })),
      setTableId: (tableId) => set({ tableId }),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "lumina-cart", version: 2 }
  )
);
