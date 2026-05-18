import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  items: [],
  tableId: null,
  notes: "",

  addItem: (item, quantity = 1) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i,
          ),
        };
      }
      return {
        items: [...state.items, { ...item, quantity }],
      };
    });
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
    }));
  },

  updateItemQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    }));
  },

  clearCart: () => {
    set({ items: [], tableId: null, notes: "" });
  },

  setTableId: (tableId) => {
    set({ tableId });
  },

  setNotes: (notes) => {
    set({ notes });
  },

  getTotal: () => {
    return get().items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));

export default useCartStore;
