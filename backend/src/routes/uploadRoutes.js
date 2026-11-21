
const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { uploadStoreImage } = require("../controllers/uploadController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post(
  "/store-image",
  protect,
  authorize("SYSTEM_ADMIN", "STORE_OWNER"),
  upload.single("image"),
  (req, res, next) => {
    console.log("UPLOAD REQUEST RECEIVED");
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);

    next();
  },
  uploadStoreImage
);

module.exports = router;
