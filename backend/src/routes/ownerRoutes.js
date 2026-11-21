
const express = require("express");
const router = express.Router();

const ownerController = require("../controllers/ownerController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Verify controller functions
if (typeof ownerController.getDashboard !== "function") {
  throw new Error("ownerController.getDashboard is not exported correctly");
}

if (typeof ownerController.updateStore !== "function") {
  throw new Error("ownerController.updateStore is not exported correctly");
}

if (typeof protect !== "function" || typeof authorize !== "function") {
  throw new Error("Authentication middleware import failed");
}

// All owner routes require authentication
router.use(protect);

// Only STORE_OWNER can access these routes
router.use(authorize("STORE_OWNER"));

// Owner dashboard
router.get("/dashboard", ownerController.getDashboard);

// Update store details and image information
router.put("/stores/:id", ownerController.updateStore);

module.exports = router;
