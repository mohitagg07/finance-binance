const router = require("express").Router();
const ctrl   = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/auth");
const { authorize }    = require("../middleware/rbac");

router.use(authenticate);

// viewer+
router.get("/summary",         ctrl.summary);
router.get("/recent",          ctrl.recentActivity);

// analyst+
router.get("/categories",      authorize("analyst"), ctrl.byCategory);
router.get("/trends/monthly",  authorize("analyst"), ctrl.monthlyTrends);
router.get("/trends/weekly",   authorize("analyst"), ctrl.weeklyTrends);
router.get("/top-categories",  authorize("analyst"), ctrl.topCategories);

// admin only
router.get("/audit-logs",      authorize("admin"),   ctrl.auditLogs);

module.exports = router;
