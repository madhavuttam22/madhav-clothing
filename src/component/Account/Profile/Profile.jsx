import React, { useState, useEffect, useRef } from "react";
import "./Profile.css";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../../Notification/Notification";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import { updateProfile, updateEmail } from "firebase/auth";

import { FiLogOut, FiEdit, FiX, FiUpload, FiTrash2 } from "react-icons/fi";

const Profile = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    initials: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getRandomColor = () => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F06292",
      "#7986CB",
      "#9575CD",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();

          const res = await fetch(
            "https://web-production-2449.up.railway.app/api/profile/me/",
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );

          const data = await res.json();

          setUser({
            name: data.name || firebaseUser.displayName || "",
            email: data.email || firebaseUser.email || "",
            phone: data.phone || firebaseUser.phoneNumber || "",
            address: data.address || "",
            avatar: data.avatar || firebaseUser.photoURL || "",
            initials: (data.name || firebaseUser.displayName || "")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase(),
          });
        } catch (error) {
          console.error("Error fetching profile from backend:", error);
        }
      } else {
        navigate("/login/");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Get CSRF token from cookies
  const getCSRFToken = () => {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "csrftoken") return decodeURIComponent(value);
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await signOut(auth);
      showNotification("Successfully logged out", "success");
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1500);
    } catch (error) {
      showNotification("Logout failed", "error");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prev) => ({
          ...prev,
          avatar: reader.result,
          initials: "",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user.name.trim()) throw new Error("Full name is required");
      if (!user.email.trim()) throw new Error("Email is required");

      const formData = new FormData();
      const nameParts = user.name.trim().split(/\s+/);
      formData.append("first_name", nameParts[0] || "");
      formData.append("last_name", nameParts.slice(1).join(" ") || "");
      formData.append("email", user.email.trim());
      if (user.phone) formData.append("phone", user.phone.trim());
      if (user.address) formData.append("address", user.address.trim());

      if (fileInputRef.current?.files[0]) {
        const file = fileInputRef.current.files[0];
        if (!file.type.startsWith("image/"))
          throw new Error("Please upload an image file");
        if (file.size > 2 * 1024 * 1024)
          throw new Error("Image size should be less than 2MB");
        formData.append("avatar", file);
      }

      const idToken = await auth.currentUser.getIdToken();

      console.log("📤 Sending formData to backend...");
      for (let pair of formData.entries()) {
        console.log(`🧾 ${pair[0]}: ${pair[1]}`);
      }

      console.log("🔐 Firebase ID Token:", idToken);

      const response = await fetch(
        "https://web-production-2449.up.railway.app/api/profile/update/",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          body: formData,
        }
      );

      console.log("📥 Raw response:", response);

      let data;
      try {
        data = await response.json();
        console.log("✅ Parsed response JSON:", data);
      } catch (jsonError) {
        console.error("❌ Failed to parse JSON response:", jsonError);
        const text = await response.text();
        console.error("🔍 Raw response text instead:", text);
        throw new Error("Server did not return JSON. Check backend.");
      }

      if (!response.ok) {
        throw new Error(
          data?.detail || data?.message || "Profile update failed"
        );
      }

      // Firebase updates
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: user.name,
          photoURL: user.avatar || null,
        });

        if (auth.currentUser.email !== user.email) {
          await updateEmail(auth.currentUser, user.email);
        }
      }

      setUser((prev) => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        address: data.address || prev.address,
        avatar: data.avatar || prev.avatar,
        initials: data.avatar
          ? ""
          : data.name
          ? data.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
          : prev.initials,
      }));

      showNotification("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("🔥 Profile update error:", error.message);
      showNotification(error.message || "An error occurred", "error");

      if (error.message.includes("403") || error.message.includes("CSRF")) {
        navigate("/login/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowLogoutModal(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          {!editMode && (
            <div className="action-btns">
              <button className="edit-button" onClick={() => setEditMode(true)}>
                <FiEdit className="btn-icon" /> Edit Profile
              </button>
              <button className="logout-button" onClick={handleLogoutClick}>
                <FiLogOut className="btn-icon" /> Logout
              </button>
            </div>
          )}
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="avatar-container">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="profile-avatar"
                />
              ) : (
                <div
                  className="initials-avatar"
                  style={{ backgroundColor: getRandomColor() }}
                >
                  {user.initials}
                </div>
              )}

              
            </div>

            <nav className="profile-menu">
              <Link to="" className="menu-item">
                My Orders
              </Link>
            </nav>
          </div>

          <div className="profile-details">
            {editMode ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={user.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={user.address}
                    onChange={handleChange}
                    rows="4"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setEditMode(false)}
                    disabled={loading}
                  >
                    <FiX className="btn-icon" /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-button"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">
                    {user.name || "Not provided"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">
                    {user.phone || "Not provided"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Address:</span>
                  <span className="info-value">
                    {user.address || "Not provided"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
      <Footer />

      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        icon={FiLogOut}
        type="danger"
      />
    </>
  );
};

export default Profile;
