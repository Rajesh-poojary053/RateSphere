
const adminService = require("../services/adminService");

const handleError = (res, error) => {
  console.error("Admin API:", error);

  if (error.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Email already exists",
    });
  }

  if (error.code === "P2003" || error.code === "P2014") {
    return res.status(409).json({
      success: false,
      message: "This record is linked to other records and cannot be deleted or changed.",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found",
    });
  }

  const knownErrors = [
    "User not found",
    "Store not found",
    "Name, email, password and address are required",
    "Name, email, address and owner are required",
    "Invalid user role",
    "Invalid user role",
    "Invalid user role",
    "Select a valid store owner",
    "You cannot delete your own administrator account",
    "Administrator accounts cannot be deleted here",
    "Transfer or delete this user's stores before deleting the account",
    "Password must contain at least 8 characters",
    "Email is required",
    "Address is required and must be under 400 characters",
    "Store name must be between 1 and 60 characters",
    "Name must be between 1 and 60 characters",
    "Name or address exceeds the allowed length",
    "Store name or address exceeds the allowed length",
  ];

  if (knownErrors.includes(error.message)) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

const endpoint = (action) => async (req, res) => {
  try {
    const result = await action(req);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getDashboardStats = endpoint(async () => ({
  stats: await adminService.getDashboardStats(),
}));

exports.getUsers = endpoint(async (req) => ({
  ...(await adminService.getUsers(req.query)),
}));

exports.getUserById = endpoint(async (req) => ({
  user: await adminService.getUserById(req.params.id),
}));

exports.createUser = async (req, res) => {
  try {
    const user = await adminService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    res.json({ success: true, message: "User updated", user });
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await adminService.deleteUser(req.params.id, req.user?.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getStores = endpoint(async (req) => ({
  ...(await adminService.getStores(req.query)),
}));

exports.getStoreById = endpoint(async (req) => ({
  store: await adminService.getStoreById(req.params.id),
}));

exports.createStore = async (req, res) => {
  try {
    const store = await adminService.createStore(req.body);
    res.status(201).json({
      success: true,
      message: "Store created successfully",
      store,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateStore = async (req, res) => {
  try {
    const store = await adminService.updateStore(req.params.id, req.body);
    res.json({ success: true, message: "Store updated", store });
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteStore = async (req, res) => {
  try {
    await adminService.deleteStore(req.params.id);
    res.json({ success: true, message: "Store deleted successfully" });
  } catch (error) {
    handleError(res, error);
  }
};
