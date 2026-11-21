
const { prisma } = require("../config/database");

const createStore = async (data) => {
  const owner = await prisma.user.findUnique({
    where: { id: data.ownerId },
  });

  if (!owner || !["STORE_OWNER", "SYSTEM_ADMIN"].includes(owner.role)) {
    throw new Error("Valid store owner not found");
  }

  return prisma.store.create({
    data: {
      name: data.name,
      email: data.email,
      address: data.address,
      ownerId: data.ownerId,
      imageUrl: data.imageUrl || null,
      imagePublicId: data.imagePublicId || null,
    },
  });
};

const getStores = async (query = {}) => {
  const {
    search,
    name,
    address,
    sortBy = "name",
    order = "asc",
    page = "1",
    limit = "10",
  } = query;

  const allowedSortFields = [
    "name",
    "email",
    "address",
    "createdAt",
  ];

  const safeSort = allowedSortFields.includes(sortBy)
    ? sortBy
    : "name";

  const safeOrder = order === "desc" ? "desc" : "asc";

  const currentPage = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 10));

  const conditions = [];

  if (search) {
    conditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (name) {
    conditions.push({
      name: { contains: name, mode: "insensitive" },
    });
  }

  if (address) {
    conditions.push({
      address: { contains: address, mode: "insensitive" },
    });
  }

  const where = conditions.length ? { AND: conditions } : {};

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          select: { value: true },
        },
      },
      orderBy: { [safeSort]: safeOrder },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),

    prisma.store.count({ where }),
  ]);

  const formattedStores = stores.map((store) => {
    const totalRatings = store.ratings.length;

    const averageRating = totalRatings
      ? store.ratings.reduce(
          (sum, rating) => sum + rating.value,
          0
        ) / totalRatings
      : 0;

    const { ratings, ...storeData } = store;

    return {
      ...storeData,
      averageRating: Number(averageRating.toFixed(2)),
      totalRatings,
    };
  });

  return {
    stores: formattedStores,
    pagination: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

const getStoreById = async (id) => {
  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      ratings: {
        select: { value: true },
      },
    },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  const totalRatings = store.ratings.length;

  const averageRating = totalRatings
    ? store.ratings.reduce(
        (sum, rating) => sum + rating.value,
        0
      ) / totalRatings
    : 0;

  const { ratings, ...storeData } = store;

  return {
    ...storeData,
    averageRating: Number(averageRating.toFixed(2)),
    totalRatings,
  };
};

module.exports = {
  createStore,
  getStores,
  getStoreById,
};
