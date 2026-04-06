const { validationResult } = require("express-validator");
const { ValidationError }  = require("../utils/AppError");

function validate(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const details = result.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new ValidationError("Validation failed.", details));
  }
  next();
}

module.exports = { validate };
