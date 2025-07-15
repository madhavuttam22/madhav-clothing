import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Notification from "../../Notification/Notification";
import "./Forget.css";
import { FiMail, FiLock, FiArrowLeft } from "react-icons/fi";
import { auth } from "../../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = request, 2 = reset
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const { uidb64, token } = useParams();

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send password reset email via Firebase
      await sendPasswordResetEmail(auth, email);
      
      // Also notify Django backend
      const response = await fetch(
        "https://web-production-2449.up.railway.app/api/password-reset/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to notify backend");
      }

      showNotification("Password reset email sent. Check your inbox!");
      setStep(1.5);
    } catch (error) {
      console.error("Reset request error:", error);
      showNotification(
        error.message || "Failed to send reset email", 
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }

    if (newPassword.length < 8) {
      showNotification("Password must be at least 8 characters", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://web-production-2449.up.railway.app/api/password-reset-confirm/${uidb64}/${token}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ new_password: newPassword }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reset password");
      }

      showNotification("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login/"), 2000);
    } catch (error) {
      console.error("Reset error:", error);
      showNotification(
        error.message || "Failed to reset password. The link may have expired.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (uidb64 && token) {
      setStep(2);
    }
  }, [uidb64, token]);

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <Link to="/login/" className="back-to-login">
          <FiArrowLeft /> Back to login
        </Link>

        <div className="forgot-password-header">
          <h1>{step === 2 ? "Reset Your Password" : "Forgot Password"}</h1>
          <p>
            {step === 2
              ? "Enter your new password below"
              : step === 1.5
              ? "Check your email for the reset link"
              : "Enter your email to receive a reset link"}
          </p>
        </div>

        {step === 1 || step === 1.5 ? (
          <form onSubmit={handleRequestReset} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={step === 1.5}
                />
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading || step === 1.5}
            >
              {loading
                ? "Sending..."
                : step === 1.5
                ? "Email Sent!"
                : "Send Reset Link"}
            </button>

            {step === 1.5 && (
              <div className="resend-link">
                Didn't receive the email?{" "}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="resend-button"
                >
                  Resend
                </button>
                <p className="check-spam">
                  (Check your spam folder if you don't see it)
                </p>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                  required
                  minLength="8"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength="8"
                />
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default ForgotPassword;