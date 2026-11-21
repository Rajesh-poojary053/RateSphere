
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/database");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};

// Register normal user
const registerUser = async (data) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email.toLowerCase(),
    },
  });

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      address: data.address,
      passwordHash,
      role: "NORMAL_USER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
    },
  });

  return {
    user,
    token: generateToken(user),
  };
};

// Login all user roles
const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const validPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!validPassword) {
    throw new Error("Invalid email or password");
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
  };

  return {
    user: safeUser,
    token: generateToken(safeUser),
  };
};

// Get logged-in user's profile
const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Change password
const changePassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  const samePassword = await bcrypt.compare(
    newPassword,
    user.passwordHash
  );

  if (samePassword) {
    throw new Error("New password must be different");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash,
    },
  });

  return true;
};

module.exports = {
  registerUser,
  loginUser,
  generateToken,
  getUserProfile,
  changePassword,
};
