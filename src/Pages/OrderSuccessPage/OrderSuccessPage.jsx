import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaHome } from 'react-icons/fa';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
  return (
    <div className="simple-success-container">
      <div className="simple-success-card">
        <div className="simple-success-header">
          <div className="simple-success-icon">
            <FaCheckCircle />
          </div>
          <h1>Order Confirmed!</h1>
          <p className="simple-success-message">Thank you for your purchase</p>
          <p className="simple-order-number">Order #: ZU12345678</p>
        </div>

        <div className="simple-summary">
          <div className="simple-summary-item">
            <span className="simple-summary-label">Amount Paid:</span>
            <span className="simple-summary-value">₹2499.00</span>
          </div>
          <div className="simple-summary-item">
            <span className="simple-summary-label">Payment Method:</span>
            <span className="simple-summary-value">Credit Card</span>
          </div>
          <div className="simple-summary-item">
            <span className="simple-summary-label">Delivery Date:</span>
            <span className="simple-summary-value">25th October 2023</span>
          </div>
        </div>

        <div className="simple-action-buttons">
          <Link to="/" className="simple-home-button">
            <FaHome /> Back to Home
          </Link>
          <Link to="/orders" className="simple-orders-button">
            View My Orders
          </Link>
        </div>

        <div className="simple-support">
          <p>Need help with your order?</p>
          <Link to="/contact" className="simple-contact-button">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;