
const authService = require("../services/authService");

// Register
const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// Get logged-in user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user.id);

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Change password
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
      return res.status(400).json({
        success: false,
        message: "New password must be 8-16 characters long.",
      });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least one uppercase letter.",
      });
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least one special character.",
      });
    }

    await authService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updatePassword,
};
