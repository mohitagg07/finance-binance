/**
 * src/app.js
 * ───────────
 * Express application — middleware stack, route mounting, error handling.
 */

const express = require("express");
const helmet  = require("helmet");
const morgan  = require("morgan");

const { requestId }  = require("./middleware/requestId");
const { apiLimiter } = require("./middleware/rateLimiter");
const { AppError }   = require("./utils/AppError");

const authRoutes      = require("./routes/auth");
const userRoutes      = require("./routes/users");
const recordRoutes    = require("./routes/records");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── Request ID (X-Request-Id header on every response) ───────────────────────
app.use(requestId);

// ── HTTP Request Logger ───────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Body Parsing (50 KB cap) ──────────────────────────────────────────────────
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: false, limit: "50kb" }));

// ── General API Rate Limiter ──────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ status: "ok", uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString() })
);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/records",   recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({
    error:     "Route not found.",
    path:      req.originalUrl,
    requestId: req.requestId,
  })
);

// ── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  // Handle Mongoose CastError (invalid ObjectId) as 400
  if (err.name === "CastError" && err.kind === "ObjectId")
    return res.status(400).json({ error: "Invalid ID format.", requestId: req.requestId });

  // Handle Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({ error: `Duplicate value for '${field}'.`, requestId: req.requestId });
  }

  // Operational AppError subclasses — safe to send to client
  if (err instanceof AppError) {
    const body = { error: err.message, requestId: req.requestId };
    if (err.details?.length) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  // Unexpected errors — log fully, hide details in production
  console.error(`[${req.requestId}] Unhandled error:`, err);
  return res.status(500).json({
    error:     process.env.NODE_ENV === "production"
                 ? "An unexpected error occurred."
                 : err.message,
    requestId: req.requestId,
  });
});

module.exports = app;
