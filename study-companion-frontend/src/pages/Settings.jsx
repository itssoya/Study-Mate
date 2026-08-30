import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, KeyRound, LogOut, Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function Settings() {
  const { user, updateProfile, changePassword, deleteAccount, logout } =
    useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileSaving(true);
    try {
      await updateProfile(name);
      setProfileMsg("Profile updated.");
    } catch (err) {
      setProfileMsg(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMsg("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Failed to update password.",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      navigate("/login");
    } catch (err) {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout>
      <h1 className="font-display text-4xl text-text-primary mb-1">Settings</h1>
      <p className="text-text-muted mb-8">
        Manage your profile, security, and account.
      </p>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-primary" size={18} />
            <h2 className="font-display text-xl text-text-primary">Profile</h2>
          </div>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-sm text-text-primary mb-1">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-primary-light/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-primary mb-1">
                Email
              </label>
              <input
                value={user?.email || ""}
                disabled
                className="w-full border border-primary-light/20 rounded-lg px-3 py-2 bg-background text-text-muted"
              />
            </div>
            {profileMsg && (
              <p className="text-sm text-text-muted">{profileMsg}</p>
            )}
            <button
              type="submit"
              disabled={profileSaving}
              className="bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {profileSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="text-primary" size={18} />
            <h2 className="font-display text-xl text-text-primary">Password</h2>
          </div>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label className="block text-sm text-text-primary mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={
                  user?.googleId ? "Leave blank if signed in with Google" : ""
                }
                className="w-full border border-primary-light/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-primary mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                className="w-full border border-primary-light/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-primary mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                className="w-full border border-primary-light/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {passwordError && (
              <p className="text-error text-sm">{passwordError}</p>
            )}
            {passwordMsg && (
              <p className="text-success text-sm">{passwordMsg}</p>
            )}
            <button
              type="submit"
              disabled={passwordSaving}
              className="bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Logout */}
        <div className="bg-surface rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-medium text-text-primary">Log out</p>
            <p className="text-text-muted text-sm">
              Sign out of StudyMate on this device.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border border-primary-light/30 text-text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary-light/10"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>

        {/* Danger zone */}
        <div className="bg-error/5 border border-error/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-error" size={18} />
            <h2 className="font-display text-xl text-error">Danger Zone</h2>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Deleting your account permanently removes all your documents,
            flashcards, quizzes, and progress. This can't be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 bg-error text-white px-4 py-2 rounded-lg font-medium hover:bg-error/90"
            >
              <Trash2 size={16} /> Delete Account
            </button>
          ) : (
            <div className="bg-surface rounded-lg p-4 border border-error/30">
              <p className="text-text-primary font-medium mb-3">
                Are you absolutely sure?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-error text-white px-4 py-2 rounded-lg font-medium hover:bg-error/90 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Yes, delete everything"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border border-primary-light/30 text-text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary-light/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
