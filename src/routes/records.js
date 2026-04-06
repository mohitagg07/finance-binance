const router = require("express").Router();
const ctrl   = require("../controllers/recordController");
const { authenticate } = require("../middleware/auth");
const { authorize }    = require("../middleware/rbac");
const { validate }     = require("../middleware/validate");
const { createRecordValidators, updateRecordValidators, listRecordValidators } = require("../validators/recordValidators");

router.use(authenticate);

// viewer+: read
router.get("/",    listRecordValidators,  validate, ctrl.listRecords);
router.get("/:id", ctrl.getRecord);

// analyst+: write
router.post("/",      authorize("analyst"), createRecordValidators, validate, ctrl.createRecord);
router.put("/:id",    authorize("analyst"), updateRecordValidators, validate, ctrl.updateRecord);
router.delete("/:id", authorize("analyst"), ctrl.deleteRecord);

module.exports = router;
