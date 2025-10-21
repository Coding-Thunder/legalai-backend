// File: backend/server.js
/**
 * Entry point for the backend application.
 * - Sets up Express with security middlewares
 * - Connects to MongoDB via config/db.js
 * - Integrates Socket.io (with a fallback if sockets module not yet present)
 * - Mounts route placeholders (real routes will be added file-by-file)
 *
 * Usage: node server.js
 */

const path = require("path");
const fs = require("fs");
const http = require("http");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const dotenv = require("dotenv");
const { createServer } = require("http");
const { connectDB } = require("./config/db");

dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "*";

async function start() {
  const app = express();

  // Basic security & parsing
  app.use(helmet());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Logging
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  // CORS
  app.use(
    cors({
      origin: CLIENT_URL,
      credentials: true,
    })
  );

  // Rate limiter - apply globally but keep reasonable defaults
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // adjust in production
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });
  app.use(limiter);

  // Connect to DB
  try {
    await connectDB(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Failed to connect to MongoDB on startup", err);
    process.exit(1);
  }

  // Health check
  app.get("/api/health", (req, res) =>
    res.json({ status: "ok", time: new Date() })
  );

  // Load routes if present; otherwise expose placeholders so server is copy-paste ready
  const routesToTry = [
    { path: "/api/auth", file: "./routes/authRoutes" },
    { path: "/api/users", file: "./routes/userRoutes" },
    { path: "/api/cases", file: "./routes/caseRoutes" },
    { path: "/api/drafts", file: "./routes/draftRoutes" },
    { path: "/api/ai", file: "./routes/aiRoutes" },
    { path: "/api/payments", file: "./routes/paymentRoutes" },
  ];

  for (const r of routesToTry) {
    try {
      if (fs.existsSync(path.join(__dirname, r.file + ".js"))) {
        app.use(r.path, require(r.file));
      } else {
        // lightweight placeholder router so endpoints exist until proper implementations are added
        const placeholder = express.Router();
        placeholder.all("*", (req, res) =>
          res.status(501).json({ error: "Not implemented yet", route: r.path })
        );
        app.use(r.path, placeholder);
      }
    } catch (err) {
      console.warn(`Failed to mount route ${r.path}:`, err.message);
    }
  }

  // Centralized error handler (will be replaced by /middleware/errorHandler.js later)
  app.use((err, req, res, next) => {
    console.error("Unhandled error", err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Internal Server Error" });
  });

  // Create HTTP server and attach Socket.IO
  const server = createServer(app);
  let io;
  try {
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 30000,
    });

    // If sockets/index.js exists, load and initialize it with io
    const socketsIndexPath = path.join(__dirname, "sockets", "index.js");
    if (fs.existsSync(socketsIndexPath)) {
      require(socketsIndexPath)(io);
    } else {
      // Minimal default handlers to allow immediate testing
      io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        // Join room for user if they send auth token later (client-side)
        socket.on("join:user", (userId) => {
          if (userId) {
            socket.join(`user:${userId}`);
            console.log(`${socket.id} joined user:${userId}`);
          }
        });

        socket.on("disconnect", (reason) => {
          console.log("Socket disconnected:", socket.id, reason);
        });
      });
    }
  } catch (err) {
    console.warn(
      "Socket.io not available or failed to initialize:",
      err.message
    );
  }

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    if (io) console.log("Socket.IO initialized");
  });
}

start().catch((err) => {
  console.error("Fatal error during startup", err);
  process.exit(1);
});
