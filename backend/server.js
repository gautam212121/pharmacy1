const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Routes
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const authRoutes = require("./routes/auth");
const labtestRoutes = require("./routes/labtestRoutes");
const searchRoutes = require("./routes/searchRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection (avoid deprecated options)
mongoose.connect("mongodb+srv://pharmacyDB22:pharmacyDB22@pharmacycluster.1wadf64.mongodb.net/?appName=pharmacycluster") 
.then(() => console.log(" MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/lab-tests", labtestRoutes);
// Also expose lab tests as health-products for frontend compatibility
app.use("/api/health-products", labtestRoutes);
app.use("/api/search", searchRoutes);
// Start server with resilient port binding (auto-increment if in use)
const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const MAX_RETRIES = 5;

function startServer(port = DEFAULT_PORT, attempts = 0) {
  // create a fresh server and socket instance for each attempt to avoid stale listeners
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });
  app.set("io", io);

  io.on("connection", (socket) => {
    if (process.env.SOCKET_LOG !== 'false') {
      console.log(`Client connected: ${socket.id}`);
    }

    socket.on("product-updated", () => io.emit("product-updated"));
    socket.on("labtest-updated", () => io.emit("labtest-updated"));
    socket.on("order-updated", () => io.emit("order-updated"));

    socket.on("disconnect", () => {
      if (process.env.SOCKET_LOG !== 'false') {
        console.log(`Client disconnected: ${socket.id}`);
      }
    });
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      if (attempts < MAX_RETRIES) {
        const nextPort = port + 1;
        console.warn(`Port ${port} in use, trying ${nextPort}...`);
        // close this server and retry after a short delay
        try { server.close(); } catch (e) { /* ignore */ }
        setTimeout(() => startServer(nextPort, attempts + 1), 200);
      } else {
        console.error(`All ports ${DEFAULT_PORT}-${DEFAULT_PORT + MAX_RETRIES} are in use. Exiting.`);
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  server.listen(port, '0.0.0.0', () => console.log(`Server running on http://0.0.0.0:${port} (accessible from network)`));
}

startServer();

// Global error handlers
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
