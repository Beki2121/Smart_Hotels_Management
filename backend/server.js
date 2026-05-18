require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./db");
const initSockets = require("./sockets");

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

// Make io accessible in routes via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "SmartHMS API is running",
  });
});

// Routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/menu-items", require("./routes/menu"));
app.use("/api/v1/categories", require("./routes/menu"));
app.use("/api/v1/tables", require("./routes/tables"));
app.use("/api/v1/orders", require("./routes/orders"));
app.use("/api/v1/bills", require("./routes/bills"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/receipts", require("./routes/receipts"));
app.use("/api/v1/rooms", require("./routes/rooms"));
app.use("/api/v1/bookings", require("./routes/bookings"));
app.use("/api/v1/inventory", require("./routes/inventory"));
app.use("/api/v1/suppliers", require("./routes/suppliers"));
app.use("/api/v1/reports", require("./routes/reports"));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Initialize Socket.io event handlers
initSockets(io);

// Start server
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Sync database
    await db.sequelize.authenticate();
    console.log("✓ Database connection established");

    server.listen(PORT, () => {
      console.log(`\n✓ SmartHMS API running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `✓ Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}\n`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();

module.exports = { app, server, io };
