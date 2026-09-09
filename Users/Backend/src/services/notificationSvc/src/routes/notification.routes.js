const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notification.controller");

// Notification history for a user
router.get("/:userId", notificationController.getUserNotifications);

module.exports = router;
