
const express = require("express");
const router = express.Router();

const storeController = require("../controllers/storeController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// All store routes require authentication
router.use(protect);

// Create store (System Admin only)
router.post(
  "/",
  authorize("SYSTEM_ADMIN"),
  storeController.createStore
);

// Get all stores (All logged-in users)
router.get(
  "/",
  storeController.getStores
);

// Get store by ID (All logged-in users)
router.get(
  "/:id",
  storeController.getStoreById
);

module.exports = router;
