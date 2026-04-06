/**
 * src/controllers/authController.js
 */

const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const User   = require("../models/User");
const audit  = require("../utils/audit");
const { ConflictError, UnauthorizedError, ForbiddenError } = require("../utils/AppError");

// ── Register ──────────────────────────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const { name, email, password, role = "viewer" } = req.body;

    // Only admins may create elevated accounts
    if (role !== "viewer" && req.user?.role !== "admin")
      throw new ForbiddenError("Only admins can create accounts with elevated roles.");

    if (await User.findOne({ email }))
      throw new ConflictError("An account with this email already exists.");

    const passwordHash = await bcrypt.hash(password, 12);
    const user         = await User.create({ name, email, passwordHash, role });

    audit.log({
      userId:   req.user?._id ?? user._id,
      action:   "REGISTER",
      entity:   "user",
      entityId: user._id,
      details:  { email, role },
      ip:       req.ip,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
}

// ── Login ─────────────────────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Explicitly select passwordHash (excluded by default in schema)
    const user = await User.findOne({ email }).select("+passwordHash");

    // Same error for "not found" and "wrong password" — prevents user enumeration
    if (!user) throw new UnauthorizedError("Invalid email or password.");
    if (user.status === "inactive")
      throw new ForbiddenError("Account is inactive. Contact an administrator.");

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new UnauthorizedError("Invalid email or password.");

    const token = jwt.sign(
      { sub: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    audit.log({ userId: user._id, action: "LOGIN", entity: "user", entityId: user._id, ip: req.ip });

    return res.json({
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
}

// ── Me ────────────────────────────────────────────────────────────────────────
async function me(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    return res.json({ user });
  } catch (err) { next(err); }
}

module.exports = { register, login, me };
