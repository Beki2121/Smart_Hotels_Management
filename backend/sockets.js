// Socket.io initialization and event handlers

module.exports = function initSockets(io) {
  // Middleware for socket authentication (optional)
  io.use((socket, next) => {
    // Token validation can be done here in the future
    next();
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Order events
    socket.on("order:new", (data) => {
      console.log("New order received:", data);
      io.emit("order:new", data);
    });

    socket.on("order:updated", (data) => {
      console.log("Order updated:", data);
      io.emit("order:updated", data);
    });

    // Table status events
    socket.on("table:status", (data) => {
      console.log("Table status changed:", data);
      io.emit("table:status", data);
    });

    // Item status for KDS
    socket.on("item:status", (data) => {
      console.log("Item status changed:", data);
      io.emit("item:status", data);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
