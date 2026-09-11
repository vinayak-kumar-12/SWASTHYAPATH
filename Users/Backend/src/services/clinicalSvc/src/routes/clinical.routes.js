const express = require("express");
const router = express.Router();
const clinicalController = require("../controllers/clinical.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  validateCreateHealthConcern,
  validateUpdateHealthConcern,
} = require("../validators/clinical.validator");

// Protect all clinical health concern routes with authentication token
router.use(authenticateToken);

router
  .route("/health-concerns")
  .post(validateCreateHealthConcern, clinicalController.createHealthConcern)
  .get(clinicalController.getHealthConcerns);

router
  .route("/health-concerns/:id")
  .get(clinicalController.getHealthConcernById)
  .put(validateUpdateHealthConcern, clinicalController.updateHealthConcern)
  .delete(clinicalController.deleteHealthConcern);

module.exports = router;
