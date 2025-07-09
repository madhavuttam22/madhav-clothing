import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaHome } from 'react-icons/fa';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
  return (
    <div className="minimal-success-container">
      <div className="minimal-success-card">
        <div className="minimal-success-icon">
          <FaCheckCircle />
        </div>
        <h1>Order Confirmed!</h1>
        <p className="minimal-success-message">Thank you for your purchase</p>
        
        <Link to="/" className="minimal-home-button">
          <FaHome /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;