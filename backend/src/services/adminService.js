
const { prisma } = require("../config/database");
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");

const ROLES = ["SYSTEM_ADMIN", "NORMAL_USER", "STORE_OWNER"];

// ================= VALIDATION =================

const validateEmail = (email) =>
  typeof email === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());


const validateName = (name, field = "Name") => {
  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 60
  ) {
    throw new Error(`${field} must contain 2-60 characters`);
  }
};


const validateAddress = (address) => {
  if (
    typeof address !== "string" ||
    !address.trim() ||
    address.trim().length > 400
  ) {
    throw new Error(
      "Address is required and cannot exceed 400 characters"
    );
  }
};

const validatePassword = (password) => {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 16 ||
    !/[A-Z]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    throw new Error(
      "Password must be 8-16 characters with an uppercase letter and special character"
    );
  }
};

const getPagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(query.limit, 10) || 10)
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// ================= DASHBOARD =================

const getDashboardStats = async () => {
  const [totalUsers, totalStores, totalRatings] =
    await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

  return { totalUsers, totalStores, totalRatings };
};

// ================= USERS =================

const getUsers = async (query = {}) => {
  const {
    search,
    name,
    email,
    address,
    role,
    sortBy = "name",
    order = "asc",
  } = query;

  const allowedSort = [
    "name",
    "email",
    "address",
    "role",
    "createdAt",
  ];

  const { page, limit, skip } = getPagination(query);

  const conditions = [];

  if (search) {
    conditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (name) {
    conditions.push({
      name: { contains: name, mode: "insensitive" },
    });
  }

  if (email) {
    conditions.push({
      email: { contains: email, mode: "insensitive" },
    });
  }

  if (address) {
    conditions.push({
      address: { contains: address, mode: "insensitive" },
    });
  }

  if (role) {
    if (!ROLES.includes(role)) {
      throw new Error("Invalid role filter");
    }
    conditions.push({ role });
  }

  const where = conditions.length ? { AND: conditions } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        ownedStores: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: { value: true },
            },
          },
        },
      },
      orderBy: {
        [allowedSort.includes(sortBy) ? sortBy : "name"]:
          order === "desc" ? "desc" : "asc",
      },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const formattedUsers = users.map((user) => {
    const { ownedStores, ...userData } = user;

    return {
      ...userData,
      ownedStores: ownedStores.map((store) => {
        const totalRatings = store.ratings.length;

        const averageRating = totalRatings
          ? store.ratings.reduce(
              (sum, rating) => sum + rating.value,
              0
            ) / totalRatings
          : 0;

        return {
          id: store.id,
          name: store.name,
          averageRating: Number(averageRating.toFixed(2)),
          totalRatings,
        };
      }),
    };
  });

  return {
    users: formattedUsers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      ownedStores: {
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
          },
        },
      },
    },
  });

  if (!user) throw new Error("User not found");

  return {
    ...user,
    ownedStores: user.ownedStores.map((store) => {
      const totalRatings = store.ratings.length;

      const averageRating = totalRatings
        ? store.ratings.reduce(
            (sum, rating) => sum + rating.value,
            0
          ) / totalRatings
        : 0;

      return {
        ...store,
        averageRating: Number(averageRating.toFixed(2)),
        totalRatings,
      };
    }),
  };
};

const createUser = async (data) => {
  const { name, email, address, password, role } = data;

  validateName(name);
  validateAddress(address);

  if (!validateEmail(email)) {
    throw new Error("Valid email is required");
  }

  validatePassword(password);

  const userRole = role || "NORMAL_USER";

  if (!ROLES.includes(userRole)) {
    throw new Error("Invalid user role");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      passwordHash,
      role: userRole,
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
};

const updateUser = async (id, data) => {
  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) throw new Error("User not found");

  const updateData = {};

  if (data.name !== undefined) {
    validateName(data.name);
    updateData.name = data.name.trim();
  }

  if (data.email !== undefined) {
    if (!validateEmail(data.email)) {
      throw new Error("Valid email is required");
    }
    updateData.email = data.email.trim().toLowerCase();
  }

  if (data.address !== undefined) {
    validateAddress(data.address);
    updateData.address = data.address.trim();
  }

  if (data.role !== undefined) {
    if (!ROLES.includes(data.role)) {
      throw new Error("Invalid user role");
    }
    updateData.role = data.role;
  }

  if (data.password) {
    validatePassword(data.password);
    updateData.passwordHash = await bcrypt.hash(
      data.password,
      12
    );
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
    },
  });
};

const deleteUser = async (id, currentAdminId) => {
  if (id === currentAdminId) {
    throw new Error(
      "You cannot delete your own administrator account"
    );
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { ownedStores: true },
  });

  if (!user) throw new Error("User not found");

  if (user.role === "SYSTEM_ADMIN") {
    throw new Error(
      "Administrator accounts cannot be deleted here"
    );
  }

  if (user.ownedStores.length) {
    throw new Error(
      "Transfer or delete this user's stores before deleting the account"
    );
  }

  return prisma.user.delete({ where: { id } });
};

// ================= STORES =================

const getStores = async (query = {}) => {
  const {
    search,
    name,
    email,
    address,
    sortBy = "name",
    order = "asc",
  } = query;

  const allowedSort = [
    "name",
    "email",
    "address",
    "createdAt",
  ];

  const { page, limit, skip } = getPagination(query);

  const conditions = [];

  if (search) {
    conditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (name) {
    conditions.push({
      name: { contains: name, mode: "insensitive" },
    });
  }

  if (email) {
    conditions.push({
      email: { contains: email, mode: "insensitive" },
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
        _count: {
          select: { ratings: true },
        },
        ratings: {
          select: { value: true },
        },
      },
      orderBy: {
        [allowedSort.includes(sortBy) ? sortBy : "name"]:
          order === "desc" ? "desc" : "asc",
      },
      skip,
      take: limit,
    }),
    prisma.store.count({ where }),
  ]);

  const formattedStores = stores.map((store) => {
    const { ratings, _count, ...storeData } = store;

    const totalRatings = _count.ratings;

    const averageRating = totalRatings
      ? ratings.reduce(
          (sum, rating) => sum + rating.value,
          0
        ) / totalRatings
      : 0;

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
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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

  if (!store) throw new Error("Store not found");

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

const createStore = async (data) => {
  const {
    name,
    email,
    address,
    ownerId,
    imageUrl,
    imagePublicId,
  } = data;

  validateName(name, "Store name");
  validateAddress(address);

  if (!validateEmail(email)) {
    throw new Error("Valid store email is required");
  }

  if (!ownerId) {
    throw new Error("Store owner ID is required");
  }

  const owner = await prisma.user.findFirst({
    where: {
      id: ownerId,
      role: "STORE_OWNER",
    },
  });

  if (!owner) {
    throw new Error("Valid store owner not found");
  }

  return prisma.store.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      ownerId,
      imageUrl: imageUrl || null,
      imagePublicId: imagePublicId || null,
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { ratings: true },
      },
    },
  });
};

const updateStore = async (id, data) => {
  const existing = await prisma.store.findUnique({
    where: { id },
  });

  if (!existing) throw new Error("Store not found");

  const updateData = {};

  if (data.name !== undefined) {
    validateName(data.name, "Store name");
    updateData.name = data.name.trim();
  }

  if (data.email !== undefined) {
    if (!validateEmail(data.email)) {
      throw new Error("Valid store email is required");
    }
    updateData.email = data.email.trim().toLowerCase();
  }

  if (data.address !== undefined) {
    validateAddress(data.address);
    updateData.address = data.address.trim();
  }

  if (data.ownerId !== undefined) {
    const owner = await prisma.user.findFirst({
      where: {
        id: data.ownerId,
        role: "STORE_OWNER",
      },
    });

    if (!owner) {
      throw new Error("Valid store owner not found");
    }

    updateData.ownerId = data.ownerId;
  }

  if (data.imageUrl !== undefined) {
    updateData.imageUrl = data.imageUrl || null;
  }

  if (data.imagePublicId !== undefined) {
    updateData.imagePublicId = data.imagePublicId || null;
  }

  const updatedStore = await prisma.store.update({
    where: { id },
    data: updateData,
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { ratings: true },
      },
    },
  });

  if (
    existing.imagePublicId &&
    data.imagePublicId !== undefined &&
    existing.imagePublicId !== data.imagePublicId
  ) {
    try {
      await cloudinary.uploader.destroy(
        existing.imagePublicId
      );
    } catch (error) {
      console.error(
        "Old store image cleanup failed:",
        error.message
      );
    }
  }

  return updatedStore;
};

const deleteStore = async (id) => {
  const store = await prisma.store.findUnique({
    where: { id },
  });

  if (!store) throw new Error("Store not found");

  const deletedStore = await prisma.store.delete({
    where: { id },
  });

  if (store.imagePublicId) {
    try {
      await cloudinary.uploader.destroy(
        store.imagePublicId
      );
    } catch (error) {
      console.error(
        "Store image cleanup failed:",
        error.message
      );
    }
  }

  return deletedStore;
};

// ================= EXPORTS =================

module.exports = {
  getDashboardStats,

  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,

  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
};
