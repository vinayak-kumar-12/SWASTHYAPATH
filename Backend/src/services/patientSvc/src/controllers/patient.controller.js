const patientService = require("../services/patient.service");

const createPatient = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const patient = await patientService.createPatientProfile(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Patient profile created successfully",
      data: patient,
    });
  } catch (err) {
    next(err);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const patient = await patientService.getPatientByUserId(userId);

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (err) {
    next(err);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updatedPatient = await patientService.updatePatientByUserId(
      userId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Patient profile updated successfully",
      data: updatedPatient,
    });
  } catch (err) {
    next(err);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const authenticatedUserId = req.user.userId;
    const role = req.user.role;

    const patient = await patientService.getPatientById(
      authenticatedUserId,
      patientId,
      role,
    );

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (err) {
    next(err);
  }
};

const updatePatientById = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const authenticatedUserId = req.user.userId;
    const role = req.user.role;

    const updatedPatient = await patientService.updatePatientById(
      authenticatedUserId,
      patientId,
      req.body,
      role,
    );

    res.status(200).json({
      success: true,
      message: "Patient profile updated successfully",
      data: updatedPatient,
    });
  } catch (err) {
    next(err);
  }
};

const deletePatientById = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const authenticatedUserId = req.user.userId;
    const role = req.user.role;

    await patientService.softDeletePatientById(
      authenticatedUserId,
      patientId,
      role,
    );

    res.status(200).json({
      success: true,
      message: "Patient profile deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPatient,
  getMyProfile,
  updateMyProfile,
  getPatientById,
  updatePatientById,
  deletePatientById,
};
