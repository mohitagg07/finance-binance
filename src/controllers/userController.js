/**
 * src/controllers/userController.js
 */

const bcrypt = require("bcryptjs");
const User   = require("../models/User");
const audit  = require("../utils/audit");
const { parsePagination, buildPaginationMeta } = require("../utils/paginate");
const { NotFoundError, ConflictError, ForbiddenError } = require("../utils/AppError");

// Fields to return in all user responses (never expose passwordHash)
const USER_FIELDS = "-passwordHash";

// ── List Users ────────────────────────────────────────────────────────────────
async function listUsers(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [users, total] = await Promise.all([
      User.find().select(USER_FIELDS).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);
    return res.json({ data: users, pagination: buildPaginationMeta(page, limit, total) });
  } catch (err) { next(err); }
}

// ── Get User ──────────────────────────────────────────────────────────────────
async function getUser(req, res, next) {
  try {
    const { id } = req.params;

    // Non-admins can only view their own profile
    if (req.user.role !== "admin" && req.user._id.toString() !== id)
      throw new ForbiddenError("You can only view your own profile.");

    const user = await User.findById(id).select(USER_FIELDS);
    if (!user) throw new NotFoundError("User");
    return res.json({ user });
  } catch (err) { next(err); }
}

// ── Create User ───────────────────────────────────────────────────────────────
async function createUser(req, res, next) {
  try {
    const { name, email, password, role = "viewer" } = req.body;

    if (await User.findOne({ email }))
      throw new ConflictError("An account with this email already exists.");

    const passwordHash = await bcrypt.hash(password, 12);
    const user         = await User.create({ name, email, passwordHash, role });

    audit.log({
      userId:   req.user._id,
      action:   "CREATE_USER",
      entity:   "user",
      entityId: user._id,
      details:  { email, role },
      ip:       req.ip,
    });

    return res.status(201).json({
      message: "User created successfully.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
}

// ── Update User ───────────────────────────────────────────────────────────────
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const user   = await User.findById(id);
    if (!user) throw new NotFoundError("User");

    const { name, email, role, status, password } = req.body;

    // Guard: cannot demote the last active admin
    if (role && role !== "admin" && user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin", status: "active" });
      if (adminCount <= 1) throw new ConflictError("Cannot demote the last active admin.");
    }

    // Guard: email uniqueness
    if (email && email !== user.email) {
      if (await User.findOne({ email, _id: { $ne: id } }))
        throw new ConflictError("Email is already in use by another account.");
      user.email = email;
    }

    if (name)   user.name   = name;
    if (role)   user.role   = role;
    if (status) user.status = status;
    if (password) user.passwordHash = await bcrypt.hash(password, 12);

    await user.save();

    audit.log({
      userId:   req.user._id,
      action:   "UPDATE_USER",
      entity:   "user",
      entityId: user._id,
      details:  { fields: Object.keys(req.body) },
      ip:       req.ip,
    });

    const updated = await User.findById(id).select(USER_FIELDS);
    return res.json({ message: "User updated.", user: updated });
  } catch (err) { next(err); }
}

// ── Update Status ─────────────────────────────────────────────────────────────
async function updateStatus(req, res, next) {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status))
      return res.status(422).json({ error: "Status must be 'active' or 'inactive'." });

    const user = await User.findById(id);
    if (!user) throw new NotFoundError("User");

    // Guard: cannot deactivate the last admin
    if (status === "inactive" && user.role === "admin") {
      const count = await User.countDocuments({ role: "admin", status: "active" });
      if (count <= 1) throw new ConflictError("Cannot deactivate the last active admin.");
    }

    user.status = status;
    await user.save();

    audit.log({
      userId:   req.user._id,
      action:   "UPDATE_STATUS",
      entity:   "user",
      entityId: user._id,
      details:  { status },
      ip:       req.ip,
    });

    return res.json({ message: `User status updated to '${status}'.` });
  } catch (err) { next(err); }
}

// ── Delete User ───────────────────────────────────────────────────────────────
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id)
      return res.status(400).json({ error: "You cannot delete your own account." });

    const user = await User.findByIdAndDelete(id);
    if (!user) throw new NotFoundError("User");

    audit.log({
      userId:   req.user._id,
      action:   "DELETE_USER",
      entity:   "user",
      entityId: id,
      ip:       req.ip,
    });

    return res.json({ message: "User deleted." });
  } catch (err) { next(err); }
}

module.exports = { listUsers, getUser, createUser, updateUser, updateStatus, deleteUser };
