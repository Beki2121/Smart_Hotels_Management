import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../apiClient";

const QUERY_KEYS = {
  auth: ["auth"],
  user: ["user"],
  users: ["users"],
  tables: ["tables"],
  orders: ["orders"],
  items: ["items"],
  rooms: ["rooms"],
  bookings: ["bookings"],
  bills: ["bills"],
  reports: ["reports"],
  inventory: ["inventory"],
};

// Auth Hooks
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useRefreshTokenMutation = () => {
  return useMutation({
    mutationFn: async (refreshToken) => {
      const response = await api.post("/auth/refresh", { refreshToken });
      return response.data;
    },
  });
};

// User Hooks
export const useUser = (userId) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.user, userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useUsers = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.users, filters],
    queryFn: async () => {
      const response = await api.get("/users", { params: filters });
      return response.data;
    },
  });
};

// Table Hooks
export const useTables = () => {
  return useQuery({
    queryKey: QUERY_KEYS.tables,
    queryFn: async () => {
      const response = await api.get("/tables");
      return response.data;
    },
    refetchInterval: 5000,
  });
};

export const useTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tableId, data }) => {
      const response = await api.put(`/tables/${tableId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables });
    },
  });
};

// Order Hooks
export const useOrders = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.orders, filters],
    queryFn: async () => {
      const response = await api.get("/orders", { params: filters });
      return response.data;
    },
    refetchInterval: 5000,
  });
};

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData) => {
      const response = await api.post("/orders", orderData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables });
    },
  });
};

export const useUpdateOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, data }) => {
      const response = await api.put(`/orders/${orderId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
};

// Menu Items Hooks
export const useMenuItems = (category = null) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.items, category],
    queryFn: async () => {
      const params = category ? { category } : {};
      const response = await api.get("/menu-items", { params });
      return response.data;
    },
  });
};

// Room Hooks
export const useRooms = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.rooms, filters],
    queryFn: async () => {
      const response = await api.get("/rooms", { params: filters });
      return response.data;
    },
  });
};

export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingData) => {
      const response = await api.post("/bookings", bookingData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rooms });
    },
  });
};

// Bill Hooks
export const useBills = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.bills, filters],
    queryFn: async () => {
      const response = await api.get("/bills", { params: filters });
      return response.data;
    },
  });
};

export const useCreateBillMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (billData) => {
      const response = await api.post("/bills", billData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bills });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
};

// Inventory Hooks
export const useInventory = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.inventory, filters],
    queryFn: async () => {
      const response = await api.get("/inventory", { params: filters });
      return response.data;
    },
  });
};

export const useUpdateInventoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, data }) => {
      const response = await api.put(`/inventory/${itemId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory });
    },
  });
};

// Reports Hooks
export const useReports = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.reports, filters],
    queryFn: async () => {
      const response = await api.get("/reports", { params: filters });
      return response.data;
    },
  });
};

export const useCloseDayMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/reports/close-day", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
};

export { QUERY_KEYS };
