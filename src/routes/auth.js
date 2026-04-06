const router = require("express").Router();
const { register, login, me }                 = require("../controllers/authController");
const { authenticate }                        = require("../middleware/auth");
const { validate }                            = require("../middleware/validate");
const { authLimiter }                         = require("../middleware/rateLimiter");
const { registerValidators, loginValidators } = require("../validators/authValidators");

router.post("/register", authLimiter, registerValidators, validate, register);
router.post("/login",    authLimiter, loginValidators,    validate, login);
router.get("/me",        authenticate, me);

module.exports = router;
