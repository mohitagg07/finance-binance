const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again after 15 minutes." },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

module.exports = { authLimiter, apiLimiter };
