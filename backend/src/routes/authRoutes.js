
const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");

const {
  registerSchema,
  loginSchema,
} = require("../utils/validators");

// User registration
router.post(
  "/register",
  validate(registerSchema),
  authController.register
);

// User login
router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

// Get logged-in user
router.get(
  "/me",
  authenticate,
  authController.getProfile
);

// Change password for user and store owner
router.put(
  "/change-password",
  authenticate,
  authController.updatePassword
);

module.exports = router;
