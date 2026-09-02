const logger = require("../utils/logger");
const { getUserNotificationHistory } = require("../services/notification.service");


const getUserNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_USER_ID",
          message: "A valid userId parameter is required",
        },
      });
    }

    const data = await getUserNotificationHistory(userId.trim(), page, limit);

    return res.status(200).json({
      success: true,
      data: data.notifications,
      pagination: data.pagination,
    });
  } catch (error) {
    logger.error({ err: error.message }, "Error in getUserNotifications controller");
    next(error);
  }
};

module.exports = {
  getUserNotifications,
};
