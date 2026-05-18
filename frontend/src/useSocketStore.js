import { create } from "zustand";
import io from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const useSocketStore = create((set, get) => {
  let socket = null;

  return {
    socket: null,
    connected: false,
    error: null,

    connect: () => {
      if (socket?.connected) return;

      socket = io(API_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        auth: {
          token: localStorage.getItem("accessToken"),
        },
      });

      socket.on("connect", () => {
        set({ connected: true, socket, error: null });
      });

      socket.on("disconnect", () => {
        set({ connected: false });
      });

      socket.on("error", (error) => {
        set({ error: error.message });
      });

      socket.on("order_created", (data) => {
        // Handle order creation
        window.dispatchEvent(
          new CustomEvent("order_created", { detail: data }),
        );
      });

      socket.on("order_updated", (data) => {
        // Handle order update
        window.dispatchEvent(
          new CustomEvent("order_updated", { detail: data }),
        );
      });

      socket.on("order_ready", (data) => {
        // Handle order ready for pickup
        window.dispatchEvent(new CustomEvent("order_ready", { detail: data }));
      });

      set({ socket });
    },

    disconnect: () => {
      if (socket?.connected) {
        socket.disconnect();
      }
      set({ socket: null, connected: false });
    },

    emit: (event, data) => {
      const currentSocket = get().socket;
      if (currentSocket?.connected) {
        currentSocket.emit(event, data);
      }
    },

    on: (event, callback) => {
      const currentSocket = get().socket;
      if (currentSocket) {
        currentSocket.on(event, callback);
      }
    },

    off: (event, callback) => {
      const currentSocket = get().socket;
      if (currentSocket) {
        currentSocket.off(event, callback);
      }
    },
  };
});

export default useSocketStore;
