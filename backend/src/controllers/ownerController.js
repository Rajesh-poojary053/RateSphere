
const { prisma } = require("../config/database");

// GET /api/owner/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

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
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const allRatings = stores.flatMap((store) => store.ratings);

    const totalRatings = allRatings.length;

    const averageRating = totalRatings
      ? allRatings.reduce((sum, rating) => sum + rating.value, 0) /
        totalRatings
      : 0;

    const recentRatings = stores
      .flatMap((store) =>
        store.ratings.map((rating) => ({
          id: rating.id,
          value: rating.value,
          createdAt: rating.createdAt,
          user: rating.user,
          store: {
            id: store.id,
            name: store.name,
          },
        }))
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
      )
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      stats: {
        totalStores: stores.length,
        totalRatings,
        averageRating: Number(averageRating.toFixed(2)),
      },
      stores: stores.map((store) => {
        const storeAverage = store.ratings.length
          ? store.ratings.reduce(
              (sum, rating) => sum + rating.value,
              0
            ) / store.ratings.length
          : 0;

        return {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          imageUrl: store.imageUrl,
          imagePublicId: store.imagePublicId,
          averageRating: Number(storeAverage.toFixed(2)),
          totalRatings: store.ratings.length,
        };
      }),
      recentRatings,
    });
  } catch (error) {
    console.error("Owner dashboard error:", error);
    next(error);
  }
};

// PUT /api/owner/stores/:id
const updateStore = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    const { name, email, address, imageUrl, imagePublicId } =
      req.body;

    const store = await prisma.store.findFirst({
      where: {
        id,
        ownerId,
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or access denied.",
      });
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof address !== "string" ||
      !address.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and address are required.",
      });
    }

    const updateData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
    };

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl || null;
    }

    if (imagePublicId !== undefined) {
      updateData.imagePublicId = imagePublicId || null;
    }

    const updatedStore = await prisma.store.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Store updated successfully.",
      store: updatedStore,
    });
  } catch (error) {
    console.error("Owner store update error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Store email already exists.",
      });
    }

    next(error);
  }
};

// IMPORTANT: These exports must match ownerRoutes.js
module.exports = {
  getDashboard,
  updateStore,
};
