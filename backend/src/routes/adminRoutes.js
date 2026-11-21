
const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorize("SYSTEM_ADMIN"));

router.get("/dashboard", adminController.getDashboardStats);

router.route("/users")
  .get(adminController.getUsers)
  .post(adminController.createUser);

router.route("/users/:id")
  .get(adminController.getUserById)
  .put(adminController.updateUser)
  .delete(adminController.deleteUser);

router.route("/stores")
  .get(adminController.getStores)
  .post(adminController.createStore);

router.route("/stores/:id")
  .get(adminController.getStoreById)
  .put(adminController.updateStore)
  .delete(adminController.deleteStore);

module.exports = router;
