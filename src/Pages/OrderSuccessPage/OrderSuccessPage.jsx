import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaMapMarkerAlt, FaClock, FaWhatsapp } from 'react-icons/fa';
import './OrderSuccessPage.css';

const OrderSuccessPage = ({ location }) => {
  const orderData = location.state || {
    orderId: 'ZU12345678',
    amount: '2499.00',
    paymentMethod: 'card'
  };

  return (
    <div className="order-success-container">
      <div className="success-card">
        <div className="success-header">
          <div className="success-icon">
            <FaCheckCircle />
          </div>
          <h1>Order Confirmed!</h1>
          <p className="success-message">Thank you for shopping with ZU Clothing</p>
          <p className="order-number">Order #: {orderData.orderId}</p>
        </div>

        <div className="order-details">
          <div className="detail-card">
            <div className="detail-icon amount">
              <FaShoppingBag />
            </div>
            <div>
              <h3>Amount Paid</h3>
              <p>₹{orderData.amount}</p>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-icon payment">
              <FaCheckCircle />
            </div>
            <div>
              <h3>Payment Method</h3>
              <p>
                {orderData.paymentMethod === 'card' 
                  ? 'Credit/Debit Card' 
                  : 'Cash on Delivery'}
              </p>
            </div>
          </div>
        </div>

        <div className="timeline">
          <div className="timeline-step current">
            <div className="step-icon">
              <div className="inner-circle"></div>
            </div>
            <div className="step-content">
              <h4>Order Confirmed</h4>
              <p>We've received your order</p>
            </div>
          </div>

          <div className="timeline-step">
            <div className="step-icon">
              <div className="inner-circle"></div>
            </div>
            <div className="step-content">
              <h4>Processing</h4>
              <p>Preparing your shipment</p>
            </div>
          </div>

          <div className="timeline-step">
            <div className="step-icon">
              <div className="inner-circle"></div>
            </div>
            <div className="step-content">
              <h4>Shipped</h4>
              <p>On its way to you</p>
            </div>
          </div>

          <div className="timeline-step">
            <div className="step-icon">
              <div className="inner-circle"></div>
            </div>
            <div className="step-content">
              <h4>Delivered</h4>
              <p>Expected by 25th Oct</p>
            </div>
          </div>
        </div>

        <div className="support-section">
          <h3>Need Help?</h3>
          <p>Our customer care team is available to assist you</p>
          
          <div className="support-options">
            <button className="support-button whatsapp">
              <FaWhatsapp /> Chat on WhatsApp
            </button>
            <button className="support-button call">
              <FaClock /> Call Support
            </button>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/orders" className="order-details-btn">
            View Order Details
          </Link>
          <Link to="/" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>

      <div className="featured-products">
        <h2>You Might Also Like</h2>
        <div className="products-grid">
          {/* These would be dynamic in a real app */}
          <div className="product-card">
            <div className="product-image" style={{backgroundImage: 'url(https://via.placeholder.com/300x400)'}}></div>
            <h3>Premium Denim Jacket</h3>
            <p>₹2,499</p>
          </div>
          <div className="product-card">
            <div className="product-image" style={{backgroundImage: 'url(https://via.placeholder.com/300x400)'}}></div>
            <h3>Classic White Tee</h3>
            <p>₹799</p>
          </div>
          <div className="product-card">
            <div className="product-image" style={{backgroundImage: 'url(https://via.placeholder.com/300x400)'}}></div>
            <h3>Casual Chinos</h3>
            <p>₹1,599</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;