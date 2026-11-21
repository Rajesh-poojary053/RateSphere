
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminStores from "./pages/AdminStores";
import OwnerDashboard from "./pages/OwnerDashboard";
import StoreDetails from "./pages/StoreDetails";
import MyRatings from "./pages/MyRatings";

import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useAuth();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const destination = {
      SYSTEM_ADMIN: "/admin/dashboard",
      STORE_OWNER: "/owner/dashboard",
      NORMAL_USER: "/dashboard"
    };

    return (
      <Navigate
        to={destination[user.role] || "/login"}
        replace
      />
    );
  }

  return children;
}

function AppRoutes() {
  const { user, token } = useAuth();

  const homePath = !user || !token
    ? "/login"
    : user.role === "SYSTEM_ADMIN"
      ? "/admin/dashboard"
      : user.role === "STORE_OWNER"
        ? "/owner/dashboard"
        : "/dashboard";

  return (
    <Routes>
      <Route path="/" element={<Navigate to={homePath} replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["NORMAL_USER"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/stores/:id"
        element={
          <ProtectedRoute allowedRoles={["NORMAL_USER"]}>
            <StoreDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-ratings"
        element={
          <ProtectedRoute allowedRoles={["NORMAL_USER"]}>
            <MyRatings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/stores"
        element={
          <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
            <AdminStores />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={["STORE_OWNER"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
