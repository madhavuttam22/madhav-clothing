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

/**
 * Profile Component - Displays and manages user profile information.
 * Handles viewing/editing profile details, avatar uploads, and logout functionality.
 * @returns {JSX.Element} The profile page with user information and editing capabilities.
 */
const Profile = () => {
  useEffect(() => {
    document.title = "ProfilePage | Madhav Clothing";
  }, []);
  // State management
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Controls logout confirmation modal
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    initials: "", // Fallback for when avatar isn't available
  });
  const [editMode, setEditMode] = useState(false); // Toggles between view/edit modes
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [notification, setNotification] = useState(null); // Notification system
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Reference for file input element

  /**
   * Displays a temporary notification to the user
   * @param {string} message - Notification content
   * @param {string} type - Notification type ('success' or 'error')
   */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /**
   * Generates a random color for the initials avatar background
   * @returns {string} Hex color code
   */
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

  // Fetch user data on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();

          // Fetch profile data from backend
          const res = await fetch(
            "https://backend-u3he.onrender.com/api/profile/me/",
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );

          const data = await res.json();

          // Set user state with combined data from Firebase and backend
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
        navigate("/login/"); // Redirect if not authenticated
      }

      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup auth listener
  }, [navigate]);

  /**
   * Extracts CSRF token from cookies for Django backend requests
   * @returns {string|null} CSRF token if found
   */
  const getCSRFToken = () => {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "csrftoken") return decodeURIComponent(value);
    }
    return null;
  };

  /**
   * Handles form input changes
   * @param {React.ChangeEvent} e - Change event from input element
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Initiates logout flow by showing confirmation modal
   */
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  /**
   * Executes logout after confirmation
   */
  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await signOut(auth);
      showNotification("Successfully logged out", "success");
      setTimeout(() => {
        navigate("/");
        window.location.reload(); // Ensure clean state after logout
      }, 1500);
    } catch (error) {
      showNotification("Logout failed", "error");
    }
  };

  /**
   * Handles avatar image upload
   * @param {React.ChangeEvent} e - File input change event
   */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prev) => ({
          ...prev,
          avatar: reader.result,
          initials: "", // Clear initials when avatar is set
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handles profile form submission
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      if (!user.name.trim()) throw new Error("Full name is required");
      if (!user.email.trim()) throw new Error("Email is required");

      // Prepare form data for backend
      const formData = new FormData();
      const nameParts = user.name.trim().split(/\s+/);
      formData.append("first_name", nameParts[0] || "");
      formData.append("last_name", nameParts.slice(1).join(" ") || "");
      formData.append("email", user.email.trim());
      if (user.phone) formData.append("phone", user.phone.trim());
      if (user.address) formData.append("address", user.address.trim());

      // Handle avatar upload if present
      if (fileInputRef.current?.files[0]) {
        const file = fileInputRef.current.files[0];
        if (!file.type.startsWith("image/"))
          throw new Error("Please upload an image file");
        if (file.size > 2 * 1024 * 1024)
          throw new Error("Image size should be less than 2MB");
        formData.append("avatar", file);
      }

      const idToken = await auth.currentUser.getIdToken();

      // Send update to backend
      const response = await fetch(
        "https://backend-u3he.onrender.com/api/profile/update/",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || data?.message || "Profile update failed"
        );
      }

      // Update Firebase profile if needed
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: user.name,
          photoURL: user.avatar || null,
        });

        // Update email if changed
        if (auth.currentUser.email !== user.email) {
          await updateEmail(auth.currentUser, user.email);
        }
      }

      // Update local state with new data
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
      console.error("Profile update error:", error.message);
      showNotification(error.message || "An error occurred", "error");

      // Handle auth/CSRF issues
      if (error.message.includes("403") || error.message.includes("CSRF")) {
        navigate("/login/");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Closes the logout confirmation modal
   */
  const handleCloseModal = () => {
    setShowLogoutModal(false);
  };

  // Loading state UI
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
      <div className="profile-container">
        {/* Profile Header Section */}
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

        {/* Main Profile Content */}
        <div className="profile-content">
          {/* Sidebar with Avatar and Navigation */}
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

            {/* Navigation Menu */}
            <nav className="profile-menu">
              <Link to={"/myorders/"} className="menu-item">
                My Orders
              </Link>
            </nav>
          </div>

          {/* Profile Details Section */}
          <div className="profile-details">
            {editMode ? (
              // Edit Mode Form
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

                {/* Form Action Buttons */}
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
              // View Mode Display
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

        {/* Notification System */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>

      {/* Logout Confirmation Modal */}
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
