import { useState } from "react";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import api from "../services/api";
import "./ChangePassword.css";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from current password."
      );
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordRegex.test(newPassword)) {
      setError(
        "Password must be 8-16 characters with an uppercase letter and special character."
      );
      return;
    }

    try {
      setLoading(true);

      // Backend route:
      // passwordRoutes.js -> router.put("/change", protect, ...)
      // Assumes passwordRoutes is mounted at /api/password
      const response = await api.put("/password/change", {
        currentPassword,
        newPassword,
      });

      setSuccess(
        response.data.message ||
          "Password updated successfully!"
      );

      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error(
        "Change password error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rs-change-password">
      <div className="rs-password-heading">
        <div className="rs-password-icon">
          <LockKeyhole size={21} />
        </div>

        <div>
          <h2>Change Password</h2>
          <p>Keep your RateSphere account secure.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rs-password-field">
          <label>Current Password</label>

          <div className="rs-password-input">
            <input
              type={showCurrent ? "text" : "password"}
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowCurrent((prev) => !prev)
              }
              aria-label="Toggle current password visibility"
            >
              {showCurrent ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>
        </div>

        <div className="rs-password-field">
          <label>New Password</label>

          <div className="rs-password-input">
            <input
              type={showNew ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowNew((prev) => !prev)
              }
              aria-label="Toggle new password visibility"
            >
              {showNew ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>
        </div>

        <div className="rs-password-hint">
          <ShieldCheck size={15} />
          <span>
            8-16 characters, one uppercase letter and one
            special character.
          </span>
        </div>

        {error && (
          <div className="rs-password-error">
            {error}
          </div>
        )}

        {success && (
          <div className="rs-password-success">
            {success}
          </div>
        )}

        <button
          type="submit"
          className="rs-password-submit"
          disabled={loading}
        >
          {loading
            ? "Updating Password..."
            : "Update Password"}
        </button>
      </form>
    </div>
  );
}