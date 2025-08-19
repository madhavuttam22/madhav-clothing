/**
 * OrderSuccessPage Component
 * Displays a confirmation message after a successful order placement
 * Includes a success icon, confirmation message, and home button
 */
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaHome } from "react-icons/fa";
import "./OrderSuccessPage.css";

const OrderSuccessPage = () => {
  useEffect(() => {
    document.title = "OrderSuccessPage | Madhav Clothing";
  }, []);
  return (
    // Main container with centered content
    <div className="minimal-success-container">
      {/* Success card with animation */}
      <div className="minimal-success-card">
        {/* Success icon */}
        <div className="minimal-success-icon">
          <FaCheckCircle />
        </div>

        {/* Success heading */}
        <h1>Order Confirmed!</h1>

        {/* Thank you message */}
        <p className="minimal-success-message">Thank you for your purchase</p>

        {/* Navigation button to return home */}
        <Link to="/" className="minimal-home-button">
          <FaHome /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
