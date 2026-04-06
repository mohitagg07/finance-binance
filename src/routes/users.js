const router = require("express").Router();
const ctrl   = require("../controllers/userController");
const { authenticate }                           = require("../middleware/auth");
const { authorize }                              = require("../middleware/rbac");
const { validate }                               = require("../middleware/validate");
const { createUserValidators, updateUserValidators } = require("../validators/userValidators");

router.use(authenticate);

router.get("/",             authorize("admin"), ctrl.listUsers);
router.post("/",            authorize("admin"), createUserValidators, validate, ctrl.createUser);
router.put("/:id",          authorize("admin"), updateUserValidators,  validate, ctrl.updateUser);
router.patch("/:id/status", authorize("admin"), ctrl.updateStatus);
router.delete("/:id",       authorize("admin"), ctrl.deleteUser);

// Any authenticated user (controller restricts non-admins to own profile)
router.get("/:id", ctrl.getUser);

module.exports = router;
