
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

// Automatically attach authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        "API Error:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error("Server is not responding.");
    } else {
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Change password
api.changePassword = (currentPassword, newPassword) => {
  return api.put("/password/change", {
    currentPassword,
    newPassword,
  });
};

export default api;
