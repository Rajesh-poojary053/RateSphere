
const express = require("express");
const router = express.Router();

const { changePassword } = require("../controllers/passwordController");
const { protect } = require("../middleware/authMiddleware");

router.put("/change", protect, changePassword);

module.exports = router;
