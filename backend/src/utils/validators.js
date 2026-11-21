
const { z } = require("zod");

// Password validation
const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(16, "Password cannot exceed 16 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

// Registration validation
const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(20, "Name must contain at least 20 characters")
    .max(60, "Name cannot exceed 60 characters"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),

  address: z
    .string()
    .trim()
    .min(1, "Address is required")
    .max(400, "Address cannot exceed 400 characters"),

  password: passwordSchema,
});

// Login validation
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),

  password: z.string().min(1, "Password is required"),
});

// Change password validation
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

module.exports = {
  registerSchema,
  loginSchema,
  passwordSchema,
  changePasswordSchema,
};
