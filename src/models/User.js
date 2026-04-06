/**
 * src/models/User.js
 * ───────────────────
 * Mongoose schema for system users.
 *
 * Fields:
 *   name          — display name
 *   email         — unique login identifier
 *   passwordHash  — bcrypt hash (never returned in API responses)
 *   role          — viewer | analyst | admin
 *   status        — active | inactive
 *   createdAt     — auto-managed by Mongoose timestamps
 *   updatedAt     — auto-managed by Mongoose timestamps
 */

const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      type:     String,
      required: [true, "Name is required."],
      trim:     true,
      maxlength: [100, "Name must not exceed 100 characters."],
    },
    email: {
      type:      String,
      required:  [true, "Email is required."],
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    passwordHash: {
      type:     String,
      required: true,
      select:   false, // never included in query results unless explicitly requested
    },
    role: {
      type:    String,
      enum:    ["viewer", "analyst", "admin"],
      default: "viewer",
    },
    status: {
      type:    String,
      enum:    ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Note: email index is already created by unique:true above.
// Only add the compound index for role+status lookups.
userSchema.index({ role: 1, status: 1 });

module.exports = model("User", userSchema);
