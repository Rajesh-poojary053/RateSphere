
require("dotenv").config();

const bcrypt = require("bcryptjs");
const { prisma } = require("../config/database");

const resetStoreOwner = async () => {
  try {
    const email = process.env.OWNER_EMAIL?.toLowerCase();
    const password = process.env.OWNER_PASSWORD;

    if (!email || !password) {
      throw new Error("OWNER_EMAIL and OWNER_PASSWORD are required");
    }

    if (
      password.length < 8 ||
      password.length > 16 ||
      !/[A-Z]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      throw new Error(
        "Password must be 8-16 characters with uppercase and special character"
      );
    }

    const owner = await prisma.user.findUnique({
      where: { email },
    });

    if (!owner || owner.role !== "STORE_OWNER") {
      throw new Error("Store owner account not found");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const updatedOwner = await prisma.user.update({
      where: { email },
      data: { passwordHash },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log("--------------------------------");
    console.log("STORE OWNER PASSWORD RESET");
    console.log("--------------------------------");
    console.log(updatedOwner);
  } catch (error) {
    console.error("Password reset failed:", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

resetStoreOwner();
