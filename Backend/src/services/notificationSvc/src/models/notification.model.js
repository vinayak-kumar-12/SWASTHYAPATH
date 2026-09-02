const mongoose = require("mongoose");
const { Schema } = mongoose;

const NOTIFICATION_TYPES = {
  EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
  PASSWORD_RESET: "PASSWORD_RESET",
  WELCOME_EMAIL: "WELCOME_EMAIL",
};

const NOTIFICATION_CHANNELS = {
  EMAIL: "EMAIL",
};

const NOTIFICATION_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SENT: "SENT",
  FAILED: "FAILED",
  RETRYING: "RETRYING",
};

const notificationSchema = new Schema(
  {
    notificationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventId: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: Object.values(NOTIFICATION_CHANNELS),
      default: NOTIFICATION_CHANNELS.EMAIL,
    },
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
    },
    template: {
      type: String,
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: Object.values(NOTIFICATION_STATUS),
      default: NOTIFICATION_STATUS.PENDING,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    lastAttemptAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    error: {
      type: Schema.Types.Mixed,
    },
    messageId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for analytical queries and performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ status: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = {
  Notification,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_STATUS,
};
