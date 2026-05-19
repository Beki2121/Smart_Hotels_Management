// Auth Store - Zustand
import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
  loading: false,
  error: null,

  setUser: (user) => set({ user }),

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    set({
      token: accessToken,
      refreshToken: refreshToken,
      isAuthenticated: true,
      error: null,
    });
  },

  login: async (credentialsOrEmail, password) => {
    set({ loading: true, error: null });
    try {
      // Support both object and separate parameters
      let credentials;
      if (typeof credentialsOrEmail === "object") {
        credentials = credentialsOrEmail;
      } else {
        credentials = { username: credentialsOrEmail, password };
      }

      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      const { user, accessToken, refreshToken } = data;

      set({
        user,
        token: accessToken,
        refreshToken: refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      return data;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
    });
  },

  refreshAccessToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      set({ isAuthenticated: false });
      return null;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(
        `${API_URL}/auth/refresh`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        },
      );

      if (!response.ok) throw new Error("Token refresh failed");

      const data = await response.json();
      const { accessToken } = data;

      localStorage.setItem("accessToken", accessToken);
      set({ token: accessToken });
      return accessToken;
    } catch (error) {
      set({ isAuthenticated: false });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw error;
    }
  },

  initializeAuth: () => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
        isAuthenticated: true,
      });
    }
  },
}));

export default useAuthStore;
