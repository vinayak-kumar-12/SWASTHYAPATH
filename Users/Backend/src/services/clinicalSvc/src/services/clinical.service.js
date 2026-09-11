const mongoose = require("mongoose");
const HealthConcern = require("../models/healthConcern.model");
const { NotFoundError, ForbiddenError, BadRequestError } = require("../utils/errors");

class ClinicalService {
  /**
   * Create a new health concern for authenticated patient
   */
  async createHealthConcern(patientId, data) {
    let title = "";
    let description = "";
    let category = data.category || "General";

    if (typeof data.concern === "string") {
      title = data.concern;
      description = data.description || data.concern;
    } else if (typeof data.concern === "object" && data.concern !== null) {
      title = data.concern.title || "";
      description = data.concern.description || data.description || "";
      category = data.concern.category || data.category || "General";
    }

    if (!description && data.description) {
      description = data.description;
    }

    const onset = data.onset || data.details?.onset || "Today";
    const severity = Number(data.severity || data.details?.severity || 5);
    const frequency = data.frequency || data.details?.frequency || "Constant";
    const location = data.location || data.details?.location || "Not specified";
    const triggers = data.triggers || data.details?.triggers || "None reported";
    const relievingFactors = data.relievingFactors || data.details?.relievingFactors || "None reported";

    const associatedSymptoms = Array.isArray(data.associatedSymptoms)
      ? data.associatedSymptoms
      : [];

    // Format Health Context arrays
    const parseArrayField = (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === "string" && val.trim()) {
        return val.split(",").map((s) => s.trim()).filter(Boolean);
      }
      return [];
    };

    const medicalConditions = parseArrayField(data.medicalConditions || data.healthContext?.medicalConditions);
    const medications = parseArrayField(data.medications || data.healthContext?.medications);
    const allergies = parseArrayField(data.allergies || data.healthContext?.allergies);
    const previousTreatment = data.previousTreatment || data.healthContext?.previousTreatment || "None reported";
    const additionalInformation = data.additionalInformation || data.healthContext?.additionalInformation || "";

    const concernDocument = await HealthConcern.create({
      patientId,
      concern: {
        title,
        description,
        category,
      },
      details: {
        onset,
        severity,
        frequency,
        location,
        triggers,
        relievingFactors,
      },
      associatedSymptoms,
      healthContext: {
        medicalConditions,
        medications,
        allergies,
        previousTreatment,
        additionalInformation,
      },
      status: "Awaiting Review",
      isDeleted: false,
    });

    return concernDocument;
  }

  /**
   * Fetch all health concerns for authenticated patient
   */
  async getPatientHealthConcerns(patientId) {
    const concerns = await HealthConcern.find({
      patientId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return concerns;
  }

  /**
   * Fetch single health concern by ID with strict ownership validation (IDOR protection)
   */
  async getHealthConcernById(patientId, concernId) {
    if (!mongoose.Types.ObjectId.isValid(concernId)) {
      throw new NotFoundError("Health concern not found", "NOT_FOUND");
    }

    const concern = await HealthConcern.findOne({
      _id: concernId,
      isDeleted: false,
    });

    if (!concern) {
      throw new NotFoundError("Health concern not found", "NOT_FOUND");
    }

    // IDOR check: ensure record belongs to the authenticated patient
    if (concern.patientId !== patientId) {
      throw new ForbiddenError("You do not have permission to view this health concern", "ACCESS_DENIED");
    }

    return concern;
  }

  /**
   * Update health concern by ID for authenticated patient
   */
  async updateHealthConcern(patientId, concernId, updateData) {
    const concern = await this.getHealthConcernById(patientId, concernId);

    if (updateData.concern) {
      if (typeof updateData.concern === "string") {
        concern.concern.title = updateData.concern;
      } else if (typeof updateData.concern === "object") {
        if (updateData.concern.title) concern.concern.title = updateData.concern.title;
        if (updateData.concern.description) concern.concern.description = updateData.concern.description;
        if (updateData.concern.category) concern.concern.category = updateData.concern.category;
      }
    }
    if (updateData.description) concern.concern.description = updateData.description;
    if (updateData.category) concern.concern.category = updateData.category;

    if (updateData.onset) concern.details.onset = updateData.onset;
    if (updateData.severity !== undefined) concern.details.severity = Number(updateData.severity);
    if (updateData.frequency) concern.details.frequency = updateData.frequency;
    if (updateData.location) concern.details.location = updateData.location;
    if (updateData.triggers) concern.details.triggers = updateData.triggers;
    if (updateData.relievingFactors) concern.details.relievingFactors = updateData.relievingFactors;

    if (Array.isArray(updateData.associatedSymptoms)) {
      concern.associatedSymptoms = updateData.associatedSymptoms;
    }

    await concern.save();
    return concern;
  }

  /**
   * Soft-delete health concern
   */
  async deleteHealthConcern(patientId, concernId) {
    const concern = await this.getHealthConcernById(patientId, concernId);
    concern.isDeleted = true;
    concern.status = "DELETED";
    await concern.save();
    return true;
  }
}

module.exports = new ClinicalService();
