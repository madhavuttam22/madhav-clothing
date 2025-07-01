import React, { useState } from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import Notification from '../../Notification/Notification';
import ConfirmationModal from '../../ConfirmationModal/ConfirmationModal';
import { FiCheckCircle } from 'react-icons/fi';
import { auth } from "../../../firebase"; // Make sure path is correct
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
// import { auth } from "../../firebase";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    await signInWithEmailAndPassword(auth, formData.email, formData.password);
    setShowSuccessModal(true);
  } catch (error) {
    console.error("Login error:", error);
    showNotification(error.message || "Login failed. Please try again.", "error");
  } finally {
    setLoading(false);
  }
};


  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    navigate('/');
  };
  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      <div className="login-container">
        <div className="login-form-container">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Please enter your e-mail and password:</p>
          
          <form onSubmit={handleSubmit} className="login-form">
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

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-options">
              <Link to="/forgot-password/" className="forgot-password">Forgot password?</Link>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'LOG IN'}
            </button>
            <p className='text-center m-0'>Or</p>
           <button
  type="button"
  className="google-login-button"
  onClick={async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setShowSuccessModal(true);
    } catch (error) {
      showNotification("Google sign-in failed", "error");
    }
  }}
>
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="google-icon">
    <path d="M17.5781 9.20578C17.5781 8.56641 17.5273 7.95312 17.4305 7.35938H9.14062V10.8398H13.8984C13.7344 11.8945 13.1367 12.8086 12.1992 13.4062V15.5039H14.9609C16.4531 14.1211 17.5781 11.918 17.5781 9.20578Z" fill="#4285F4"/>
    <path d="M9.14062 17.7188C11.4219 17.7188 13.3594 16.9453 14.9609 15.5039L12.1992 13.4062C11.4258 13.9219 10.4531 14.2031 9.14062 14.2031C6.92969 14.2031 5.05469 12.7266 4.38672 10.7188H1.52344V12.8789C3.11719 16.0547 6.89062 17.7188 9.14062 17.7188Z" fill="#34A853"/>
    <path d="M4.38672 10.7188C4.19922 10.1602 4.09375 9.5625 4.09375 8.9375C4.09375 8.3125 4.19922 7.71484 4.38672 7.15625V5H1.52344C0.882812 6.30859 0.5 7.77344 0.5 9.375C0.5 10.9766 0.882812 12.4414 1.52344 13.75L4.38672 10.7188Z" fill="#FBBC05"/>
    <path d="M9.14062 3.63281C10.5156 3.63281 11.7188 4.10156 12.668 5.02734L15.0391 2.65625C13.3555 1.08984 11.418 0.4375 9.14062 0.4375C6.89062 0.4375 3.11719 2.10156 1.52344 5.28125L4.38672 7.15625C5.05469 5.14844 6.92969 3.63281 9.14062 3.63281Z" fill="#EA4335"/>
  </svg>
  Continue with Google
</button>

          </form>

          <div className="signup-link">
            Don't have an account? <Link to={'/register/'}>Create one</Link>
          </div>
        </div>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
  <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}  /* Use the defined function here */
        onConfirm={handleConfirmSuccess}
        title="Login Successful!"
        message="Welcome back! You have successfully logged in."
        confirmText="Continue to Dashboard"
        icon={FiCheckCircle}
        type="success"
      />
      
    </>
  );
};

export default Login;