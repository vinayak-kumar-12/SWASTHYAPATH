const patientModel = require("../models/patient.model");
const { publishPatientEvent } = require("./rabbitmq.service");
const {
  ConflictError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/errors");

const createPatientProfile = async (userId, data) => {
  const exists = await patientModel.existsByUserId(userId);
  if (exists) {
    throw new ConflictError("Patient profile already exists for this user", "PATIENT_ALREADY_EXISTS");
  }

  const patientData = {
    ...data,
    user_id: userId,
  };

  const newPatient = await patientModel.createPatient(patientData);

  // Publish domain event over RabbitMQ (non-blocking)
  publishPatientEvent("patient.created", "PATIENT_CREATED", {
    patientId: newPatient.patientId,
    userId: newPatient.userId,
    status: newPatient.status,
  });

  return newPatient;
};

const getPatientByUserId = async (userId) => {
  const patient = await patientModel.findPatientByUserId(userId);
  if (!patient) {
    throw new NotFoundError("Patient profile not found for this user", "PATIENT_NOT_FOUND");
  }
  return patient;
};

const updatePatientByUserId = async (userId, data) => {
  const existing = await patientModel.findPatientByUserId(userId);
  if (!existing) {
    throw new NotFoundError("Patient profile not found for this user", "PATIENT_NOT_FOUND");
  }

  const updatedPatient = await patientModel.updatePatient(existing.patientId, data);

  publishPatientEvent("patient.updated", "PATIENT_UPDATED", {
    patientId: updatedPatient.patientId,
    userId: updatedPatient.userId,
  });

  return updatedPatient;
};

const getPatientById = async (authenticatedUserId, patientId, role = "PATIENT") => {
  const patient = await patientModel.findPatientById(patientId);
  if (!patient) {
    throw new NotFoundError("Patient record not found", "PATIENT_NOT_FOUND");
  }

  // IDOR Authorization guard: User must own the profile or be an authorized provider/admin
  if (patient.userId !== authenticatedUserId && role !== "ADMIN" && role !== "DOCTOR") {
    throw new ForbiddenError("You do not have permission to access this patient profile", "ACCESS_DENIED");
  }

  return patient;
};

const updatePatientById = async (authenticatedUserId, patientId, data, role = "PATIENT") => {
  const patient = await patientModel.findPatientById(patientId);
  if (!patient) {
    throw new NotFoundError("Patient record not found", "PATIENT_NOT_FOUND");
  }

  if (patient.userId !== authenticatedUserId && role !== "ADMIN") {
    throw new ForbiddenError("You do not have permission to modify this patient profile", "ACCESS_DENIED");
  }

  const updatedPatient = await patientModel.updatePatient(patientId, data);

  publishPatientEvent("patient.updated", "PATIENT_UPDATED", {
    patientId: updatedPatient.patientId,
    userId: updatedPatient.userId,
  });

  return updatedPatient;
};

const softDeletePatientById = async (authenticatedUserId, patientId, role = "PATIENT") => {
  const patient = await patientModel.findPatientById(patientId);
  if (!patient) {
    throw new NotFoundError("Patient record not found", "PATIENT_NOT_FOUND");
  }

  if (patient.userId !== authenticatedUserId && role !== "ADMIN") {
    throw new ForbiddenError("You do not have permission to delete this patient profile", "ACCESS_DENIED");
  }

  const deletedPatient = await patientModel.softDeletePatient(patientId);

  publishPatientEvent("patient.deactivated", "PATIENT_DEACTIVATED", {
    patientId: patientId,
    userId: patient.userId,
  });

  return deletedPatient;
};

module.exports = {
  createPatientProfile,
  getPatientByUserId,
  updatePatientByUserId,
  getPatientById,
  updatePatientById,
  softDeletePatientById,
};
