const express = require("express");
const patientController = require("../controllers/patient.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validation.middleware");
const { createPatientSchema, updatePatientSchema } = require("../validators/patient.validator");

const router = express.Router();

// Apply authentication middleware to all patient endpoints
router.use(authenticateToken);

// Create patient profile
router.post("/", validateBody(createPatientSchema), patientController.createPatient);

// Authenticated user self profile endpoints
router.get("/me", patientController.getMyProfile);
router.put("/me", validateBody(updatePatientSchema), patientController.updateMyProfile);

// Specific patient record endpoints with IDOR ownership protection 
router.get("/:patientId", patientController.getPatientById);
router.put("/:patientId", validateBody(updatePatientSchema), patientController.updatePatientById);
router.delete("/:patientId", patientController.deletePatientById);

module.exports = router;
