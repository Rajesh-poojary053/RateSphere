
const storeService = require("../services/storeService");

// Create Store (Admin only)
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Validate store name
    if (
      !name ||
      typeof name !== "string" ||
      name.trim().length < 20 ||
      name.trim().length > 60
    ) {
      return res.status(400).json({
        success: false,
        message: "Store name must contain 20-60 characters",
      });
    }

    // Validate email
    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    // Validate address
    if (
      !address ||
      typeof address !== "string" ||
      !address.trim() ||
      address.trim().length > 400
    ) {
      return res.status(400).json({
        success: false,
        message: "Address is required and cannot exceed 400 characters",
      });
    }

    // Validate owner
    if (!ownerId || typeof ownerId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Store owner ID is required",
      });
    }

    const store = await storeService.createStore({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      ownerId,
    });

    return res.status(201).json({
      success: true,
      message: "Store created successfully",
      store,
    });

  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Store email already exists",
      });
    }

    if (error.message === "Valid store owner not found") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

// Get All Stores
const getStores = async (req, res, next) => {
  try {
    const result = await storeService.getStores(req.query);

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    next(error);
  }
};

// Get Store By ID
const getStoreById = async (req, res, next) => {
  try {
    const store = await storeService.getStoreById(req.params.id);

    return res.status(200).json({
      success: true,
      store,
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

module.exports = {
  createStore,
  getStores,
  getStoreById,
};
