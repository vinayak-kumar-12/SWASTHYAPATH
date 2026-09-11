const mongoose = require("mongoose");

const healthConcernSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: [true, "Patient ID is required"],
      index: true,
      trim: true,
    },
    concern: {
      title: {
        type: String,
        required: [true, "Concern title is required"],
        trim: true,
        maxlength: [200, "Title cannot exceed 200 characters"],
      },
      description: {
        type: String,
        required: [true, "Concern description is required"],
        trim: true,
        maxlength: [3000, "Description cannot exceed 3000 characters"],
      },
      category: {
        type: String,
        default: "General",
        trim: true,
      },
    },
    details: {
      onset: {
        type: String,
        required: [true, "Onset timing is required"],
        trim: true,
      },
      severity: {
        type: Number,
        required: [true, "Severity rating is required"],
        min: [1, "Severity rating must be at least 1"],
        max: [10, "Severity rating cannot exceed 10"],
      },
      frequency: {
        type: String,
        default: "Constant",
        trim: true,
      },
      location: {
        type: String,
        default: "Not specified",
        trim: true,
      },
      triggers: {
        type: String,
        default: "None reported",
        trim: true,
      },
      relievingFactors: {
        type: String,
        default: "None reported",
        trim: true,
      },
    },
    associatedSymptoms: {
      type: [String],
      default: [],
    },
    healthContext: {
      medicalConditions: {
        type: [String],
        default: [],
      },
      medications: {
        type: [String],
        default: [],
      },
      allergies: {
        type: [String],
        default: [],
      },
      previousTreatment: {
        type: String,
        default: "None reported",
        trim: true,
      },
      additionalInformation: {
        type: String,
        default: "",
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ["SUBMITTED", "Awaiting Review", "Doctor Review", "Completed", "CANCELLED", "DELETED"],
      default: "Awaiting Review",
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for efficient patient query filtering
healthConcernSchema.index({ patientId: 1, isDeleted: 1, createdAt: -1 });

const HealthConcern = mongoose.model("HealthConcern", healthConcernSchema);

module.exports = HealthConcern;
