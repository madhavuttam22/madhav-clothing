import React, { useState } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../../Notification/Notification";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
import { FiCheckCircle } from "react-icons/fi";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from "firebase/auth";
import { auth } from "../../../firebase";

/**
 * Register Component
 * Handles user registration through both email/password and Google authentication.
 * Manages form state, validation, and submission to both Firebase and backend API.
 */
const Register = () => {
  // Form data state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  // Component state variables
  const [loading, setLoading] = useState(false); // Loading state during form submission
  const [notification, setNotification] = useState(null); // Notification message state
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success modal visibility
  const navigate = useNavigate(); // Navigation hook for routing
  const [isNewGoogleUser, setIsNewGoogleUser] = useState(true); // Tracks if Google user is new

  /**
   * Displays a notification message
   * @param {string} message - The message to display
   * @param {string} type - The type of notification ('success' or 'error')
   */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Auto-dismiss after 3 seconds
  };

  /**
   * Handles closing the success modal
   */
  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  /**
   * Handles confirmation of successful registration
   * Navigates to appropriate route based on user type
   */
  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    if (isNewGoogleUser) {
      navigate("/login/"); // New users go to login
    } else {
      navigate("/"); // Existing users go to home/dashboard
    }
  };

  /**
   * Handles form input changes
   * @param {Object} e - The event object
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handles form submission for email/password registration
   * @param {Object} e - The event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user with Firebase Auth
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update user profile with display name
      await updateProfile(user, {
        displayName: `${formData.first_name} ${formData.last_name}`,
      });

      // Get Firebase ID token for backend authentication
      const idToken = await user.getIdToken();

      // Register user with backend API
      await fetch("https://web-production-2449.up.railway.app/api/register/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Registration error:", error);

      // Handle specific Firebase errors
      if (error.code === "auth/email-already-in-use") {
        showNotification("This email is already registered.", "error");
      } else {
        showNotification(
          error.message || "Registration failed. Please try again.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Google OAuth registration/sign-in
   */
  const handleGoogleSignup = () => {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const isNewUser = getAdditionalUserInfo(result).isNewUser;
        setIsNewGoogleUser(isNewUser); // Set whether user is new

        // Get Firebase ID token for backend authentication
        const idToken = await user.getIdToken();

        // Register user with backend API
        await fetch("https://web-production-2449.up.railway.app/api/register/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        // Show success modal
        setShowSuccessModal(true);
      })
      .catch((error) => {
        console.error("Google sign-up error:", error);
        showNotification("Google sign-up failed", "error");
      });
  };

  return (
    <>
      {/* Registration Form Container */}
      <div className="register-form-container my-3">
        <h1 className="register-title">Create Account</h1>
        <p className="register-subtitle">Please fill in the information below:</p>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="register-form">
          {/* Name Fields Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min 8 characters)"
              minLength="8"
              required
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Creating Account..." : "CREATE ACCOUNT"}
          </button>

          {/* OAuth Divider */}
          <p className="text-center">Or</p>

          {/* Google Sign-in Button */}
          <button
            type="button"
            className="google-login-button"
            onClick={handleGoogleSignup}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="google-icon"
            >
              {/* Google Logo SVG Paths */}
              <path
                d="M17.5781 9.20578C17.5781 8.56641 17.5273 7.95312 17.4305 7.35938H9.14062V10.8398H13.8984C13.7344 11.8945 13.1367 12.8086 12.1992 13.4062V15.5039H14.9609C16.4531 14.1211 17.5781 11.918 17.5781 9.20578Z"
                fill="#4285F4"
              />
              <path
                d="M9.14062 17.7188C11.4219 17.7188 13.3594 16.9453 14.9609 15.5039L12.1992 13.4062C11.4258 13.9219 10.4531 14.2031 9.14062 14.2031C6.92969 14.2031 5.05469 12.7266 4.38672 10.7188H1.52344V12.8789C3.11719 16.0547 6.89062 17.7188 9.14062 17.7188Z"
                fill="#34A853"
              />
              <path
                d="M4.38672 10.7188C4.19922 10.1602 4.09375 9.5625 4.09375 8.9375C4.09375 8.3125 4.19922 7.71484 4.38672 7.15625V5H1.52344C0.882812 6.30859 0.5 7.77344 0.5 9.375C0.5 10.9766 0.882812 12.4414 1.52344 13.75L4.38672 10.7188Z"
                fill="#FBBC05"
              />
              <path
                d="M9.14062 3.63281C10.5156 3.63281 11.7188 4.10156 12.668 5.02734L15.0391 2.65625C13.3555 1.08984 11.418 0.4375 9.14062 0.4375C6.89062 0.4375 3.11719 2.10156 1.52344 5.28125L4.38672 7.15625C5.05469 5.14844 6.92969 3.63281 9.14062 3.63281Z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        {/* Login Link */}
        <div className="login-link">
          Already have an account? <Link to="/login/">Login</Link>
        </div>
      </div>

      {/* Notification Component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Success Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSuccess}
        title={isNewGoogleUser ? "Registration Successful!" : "Welcome Back!"}
        message={
          isNewGoogleUser
            ? "Your account has been created successfully."
            : "You are already registered. Redirecting you to the home page."
        }
        confirmText={isNewGoogleUser ? "Continue to Login" : "Go to Home"}
        icon={FiCheckCircle}
        type="success"
      />
    </>
  );
};

export default Register;