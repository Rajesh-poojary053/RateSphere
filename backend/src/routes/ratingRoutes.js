
const express = require("express");
const router = express.Router();

const ratingController = require("../controllers/ratingController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// All rating routes require authentication
router.use(protect);

// Normal users can submit or update ratings
router.post("/", authorize("NORMAL_USER"), ratingController.createOrUpdateRating);

// Normal users can view their submitted ratings
router.get("/my-ratings", authorize("NORMAL_USER"), ratingController.getMyRatings);

// Store owners can view their dashboard
router.get(
  "/owner-dashboard",
  authorize("STORE_OWNER"),
  ratingController.getOwnerDashboard
);

module.exports = router;
