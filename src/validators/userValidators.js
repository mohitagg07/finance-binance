const { body, param } = require("express-validator");

const createUserValidators = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 100 }),
  body("email").isEmail().withMessage("A valid email address is required.").normalizeEmail(),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/).withMessage("Must contain at least one uppercase letter.")
    .matches(/[a-z]/).withMessage("Must contain at least one lowercase letter.")
    .matches(/[0-9]/).withMessage("Must contain at least one digit."),
  body("role").isIn(["viewer", "analyst", "admin"]).withMessage("Role must be: viewer, analyst, or admin."),
];

const updateUserValidators = [
  param("id").isMongoId().withMessage("Invalid user ID."),
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty.").isLength({ max: 100 }),
  body("email").optional().isEmail().withMessage("Must be a valid email address.").normalizeEmail(),
  body("role").optional().isIn(["viewer", "analyst", "admin"]).withMessage("Role must be: viewer, analyst, or admin."),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Status must be 'active' or 'inactive'."),
  body("password").optional()
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/).withMessage("Must contain at least one uppercase letter.")
    .matches(/[0-9]/).withMessage("Must contain at least one digit."),
];

module.exports = { createUserValidators, updateUserValidators };
