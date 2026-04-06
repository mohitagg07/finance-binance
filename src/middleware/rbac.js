/**
 * src/middleware/rbac.js
 * Role hierarchy:  viewer (1) < analyst (2) < admin (3)
 */
const { ForbiddenError } = require("../utils/AppError");

const ROLE_LEVELS = Object.freeze({ viewer: 1, analyst: 2, admin: 3 });

function authorize(minimumRole) {
  return (req, _res, next) => {
    const userLevel     = ROLE_LEVELS[req.user?.role]  ?? 0;
    const requiredLevel = ROLE_LEVELS[minimumRole]     ?? Infinity;
    if (userLevel < requiredLevel)
      return next(new ForbiddenError(
        `This action requires the '${minimumRole}' role or higher. Your current role: '${req.user?.role}'.`
      ));
    next();
  };
}

module.exports = { authorize };
