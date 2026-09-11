const clinicalService = require("../services/clinical.service");

const createHealthConcern = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const body = req.validatedBody || req.body;

    const concern = await clinicalService.createHealthConcern(userId, body);

    res.status(201).json({
      success: true,
      message: "Health concern created successfully",
      data: concern,
    });
  } catch (error) {
    next(error);
  }
};

const getHealthConcerns = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const concerns = await clinicalService.getPatientHealthConcerns(userId);

    res.status(200).json({
      success: true,
      data: concerns,
    });
  } catch (error) {
    next(error);
  }
};

const getHealthConcernById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const concern = await clinicalService.getHealthConcernById(userId, id);

    res.status(200).json({
      success: true,
      data: concern,
    });
  } catch (error) {
    next(error);
  }
};

const updateHealthConcern = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const body = req.validatedBody || req.body;

    const updatedConcern = await clinicalService.updateHealthConcern(userId, id, body);

    res.status(200).json({
      success: true,
      message: "Health concern updated successfully",
      data: updatedConcern,
    });
  } catch (error) {
    next(error);
  }
};

const deleteHealthConcern = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    await clinicalService.deleteHealthConcern(userId, id);

    res.status(200).json({
      success: true,
      message: "Health concern deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHealthConcern,
  getHealthConcerns,
  getHealthConcernById,
  updateHealthConcern,
  deleteHealthConcern,
};
