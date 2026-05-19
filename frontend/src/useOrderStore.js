import { create } from "zustand";

const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,

  setOrders: (orders) => set({ orders }),
  setCurrentOrder: (order) => set({ currentOrder: order }),

  createOrder: async (orderData, token) => {
    set({ loading: true, error: null });
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Failed to create order");

      const data = await response.json();
      const { orders } = get();
      set({ orders: [data, ...orders], loading: false });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  fetchOrders: async (token) => {
    set({ loading: true, error: null });
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();
      set({ orders: data, loading: false });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status, token) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(
        `${API_URL}/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) throw new Error("Failed to update order");

      const data = await response.json();
      const { orders } = get();
      const updated = orders.map((o) => (o.id === orderId ? data : o));
      set({ orders: updated });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

export default useOrderStore;
