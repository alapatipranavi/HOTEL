// frontend/src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { apiGetMe, apiUpdateProfile, apiChangePassword } from "../api";

export default function Profile({ user }) {
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
    hotelName: user?.hotelName || "",
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [successProfile, setSuccessProfile] = useState("");
  const [successPassword, setSuccessPassword] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiGetMe();
        if (data && !data.message) {
          setProfile({
            name: data.name,
            email: data.email,
            role: data.role,
            hotelName: data.hotelName,
          });
        } else if (data.message) {
          setError(data.message);
        }
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setError("");
    setSuccessProfile("");

    try {
      const payload = {
        name: profile.name,
      };
      if (profile.role === "admin") {
        payload.hotelName = profile.hotelName;
      }

      const data = await apiUpdateProfile(payload);
      if (data && !data.message) {
        setProfile((prev) => ({
          ...prev,
          name: data.name,
          hotelName: data.hotelName,
        }));
        setSuccessProfile("Profile updated successfully.");
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setError("");
    setSuccessPassword("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password do not match");
      setChangingPassword(false);
      return;
    }

    try {
      const data = await apiChangePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (data && !data.error && !data.message) {
        // unlikely, backend always sends message
        setSuccessPassword("Password updated.");
      } else if (data.error) {
        setError(data.error);
      } else if (data.message && data.message !== "Password updated successfully") {
        // backend might send message on error
        if (data.message === "Password updated successfully") {
          setSuccessPassword(data.message);
        } else {
          setError(data.message);
        }
      } else if (data.message === "Password updated successfully") {
        setSuccessPassword(data.message);
      }

      // clear form on success
      if (data.message === "Password updated successfully") {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      setError("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <p className="muted small">Loading profile...</p>;
  }

  return (
    <div className="profile-page">
      <h2>Profile</h2>
      <p className="muted">
        Manage your account details and password. Hotel name can be changed only by admin.
      </p>

      {error && (
        <p style={{ color: "#b91c1c", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
          {error}
        </p>
      )}

      <div className="profile-layout">
        {/* Profile info */}
        <div className="card">
          <h3>Account Details</h3>
          {successProfile && (
            <p style={{ color: "#16a34a", fontSize: "0.8rem" }}>{successProfile}</p>
          )}

          <form className="room-form" onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label>Name</label>
              <input
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email (read-only)</label>
              <input value={profile.email} disabled />
            </div>

            <div className="form-group">
              <label>Role</label>
              <input value={profile.role} disabled />
            </div>

            <div className="form-group">
              <label>Hotel Name {profile.role !== "admin" && "(read-only)"}</label>
              <input
                name="hotelName"
                value={profile.hotelName}
                onChange={handleProfileChange}
                disabled={profile.role !== "admin"}
              />
            </div>

            <button type="submit" className="primary-btn" disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="card">
          <h3>Change Password</h3>
          {successPassword && (
            <p style={{ color: "#16a34a", fontSize: "0.8rem" }}>{successPassword}</p>
          )}

          <form className="room-form" onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <button type="submit" className="primary-btn" disabled={changingPassword}>
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
