/**
 * src/middleware/auth.js
 */
const jwt  = require("jsonwebtoken");
const User = require("../models/User");
const { UnauthorizedError, ForbiddenError } = require("../utils/AppError");

async function authenticate(req, _res, next) {
  try {
    const header = req.headers["authorization"];
    if (!header || !header.startsWith("Bearer "))
      return next(new UnauthorizedError("Authentication token missing or malformed."));

    const token   = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Re-fetch from DB so role/status changes take effect immediately
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user)                   return next(new UnauthorizedError("User account no longer exists."));
    if (user.status === "inactive") return next(new ForbiddenError("Your account has been deactivated. Contact an administrator."));

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") return next(new UnauthorizedError("Token has expired. Please log in again."));
    if (err.name === "JsonWebTokenError") return next(new UnauthorizedError("Invalid authentication token."));
    next(err);
  }
}

module.exports = { authenticate };
