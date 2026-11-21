
require("dotenv").config();

const bcrypt = require("bcryptjs");
const { prisma } = require("../config/database");

const createAdmin = async () => {
  try {
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const address = process.env.ADMIN_ADDRESS || "Administration";

    if (!name || !email || !password) {
      throw new Error("ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required in .env");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
        address,
        role: "SYSTEM_ADMIN",
      },
      create: {
        name,
        email,
        passwordHash,
        address,
        role: "SYSTEM_ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log("--------------------------------");
    console.log("SYSTEM ADMIN CREATED SUCCESSFULLY");
    console.log("--------------------------------");
    console.log(admin);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin();
