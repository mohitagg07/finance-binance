const { body, param, query } = require("express-validator");

const createRecordValidators = [
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be a positive number."),
  body("type").isIn(["income", "expense"]).withMessage("Type must be 'income' or 'expense'."),
  body("category").trim().notEmpty().withMessage("Category is required.").isLength({ max: 100 }),
  body("date").isISO8601().withMessage("Date must be a valid ISO 8601 date (e.g. 2025-04-01)."),
  body("notes").optional({ nullable: true }).trim().isLength({ max: 500 }).withMessage("Notes must not exceed 500 characters."),
];

const updateRecordValidators = [
  param("id").isMongoId().withMessage("Invalid record ID."),
  body("amount").optional().isFloat({ gt: 0 }).withMessage("Amount must be a positive number."),
  body("type").optional().isIn(["income", "expense"]).withMessage("Type must be 'income' or 'expense'."),
  body("category").optional().trim().notEmpty().withMessage("Category cannot be empty.").isLength({ max: 100 }),
  body("date").optional().isISO8601().withMessage("Date must be a valid ISO 8601 date."),
  body("notes").optional({ nullable: true }).trim().isLength({ max: 500 }).withMessage("Notes must not exceed 500 characters."),
];

const listRecordValidators = [
  query("type").optional().isIn(["income", "expense"]).withMessage("Type must be 'income' or 'expense'."),
  query("start_date").optional().isISO8601().withMessage("start_date must be a valid date."),
  query("end_date").optional().isISO8601().withMessage("end_date must be a valid date."),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer."),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100."),
];

module.exports = { createRecordValidators, updateRecordValidators, listRecordValidators };
