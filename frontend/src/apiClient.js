import useAuthStore from "./useAuthStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

// Create axios-like wrapper
export const api = {
  async request(endpoint, options = {}) {
    const { token } = useAuthStore.getState();
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await useAuthStore.getState().refreshAccessToken();
        if (refreshed) {
          headers.Authorization = `Bearer ${refreshed}`;
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
          return retryResponse;
        } else {
          useAuthStore.getState().logout();
          throw new Error("Unauthorized");
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: "GET" });
  },

  post(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  patch(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  },
};

export default api;
