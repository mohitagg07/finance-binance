const { body } = require("express-validator");

const registerValidators = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 100 }),
  body("email").isEmail().withMessage("A valid email address is required.").normalizeEmail(),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/).withMessage("Must contain at least one uppercase letter.")
    .matches(/[a-z]/).withMessage("Must contain at least one lowercase letter.")
    .matches(/[0-9]/).withMessage("Must contain at least one digit."),
  body("role").optional().isIn(["viewer", "analyst", "admin"]).withMessage("Role must be: viewer, analyst, or admin."),
];

const loginValidators = [
  body("email").isEmail().withMessage("A valid email address is required.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

module.exports = { registerValidators, loginValidators };
