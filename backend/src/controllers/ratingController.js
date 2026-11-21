
const ratingService = require("../services/ratingService");

// Create or update a rating
const createOrUpdateRating = async (req, res, next) => {
  try {
    const { storeId, value } = req.body;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store ID is required",
      });
    }

    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const rating = await ratingService.createOrUpdateRating({
      userId: req.user.id,
      storeId,
      value,
    });

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      rating,
    });
  } catch (error) {
    if (error.message === "Store not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

// Get ratings submitted by logged-in user
const getMyRatings = async (req, res, next) => {
  try {
    const ratings = await ratingService.getMyRatings(req.user.id);

    res.status(200).json({
      success: true,
      ratings,
    });
  } catch (error) {
    next(error);
  }
};

// Get store owner's dashboard
const getOwnerDashboard = async (req, res, next) => {
  try {
    const dashboard = await ratingService.getOwnerDashboard(
      req.user.id
    );

    res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdateRating,
  getMyRatings,
  getOwnerDashboard,
};
