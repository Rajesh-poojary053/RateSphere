
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = {
  prisma,
  connectDB,
};
