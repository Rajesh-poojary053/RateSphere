
const { prisma } = require("../config/database");

// Create a new rating or update an existing rating
const createOrUpdateRating = async ({ userId, storeId, value }) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  const rating = await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId,
        storeId,
      },
    },
    update: {
      value,
    },
    create: {
      userId,
      storeId,
      value,
    },
  });

  return rating;
};

// Get all ratings submitted by a normal user
const getMyRatings = async (userId) => {
  return await prisma.rating.findMany({
    where: { userId },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

// Get store owner's dashboard
const getOwnerDashboard = async (ownerId) => {
  const stores = await prisma.store.findMany({
    where: { ownerId },
    include: {
      ratings: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
    },
  });

  return stores.map((store) => {
    const totalRatings = store.ratings.length;

    const averageRating =
      totalRatings > 0
        ? Number(
            (
              store.ratings.reduce(
                (sum, rating) => sum + rating.value,
                0
              ) / totalRatings
            ).toFixed(2)
          )
        : 0;

    return {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      averageRating,
      totalRatings,
      ratings: store.ratings.map((rating) => ({
        ratingId: rating.id,
        value: rating.value,
        updatedAt: rating.updatedAt,
        user: rating.user,
      })),
    };
  });
};

module.exports = {
  createOrUpdateRating,
  getMyRatings,
  getOwnerDashboard,
};
