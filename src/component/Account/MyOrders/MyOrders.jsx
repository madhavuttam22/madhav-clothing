import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiChevronRight,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiPackage,
} from "react-icons/fi";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import "./MyOrders.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase";
import { formatCurrency, getProductImage } from "../../../utils/numbers";

/**
 * MyOrders Component - Displays a user's order history with status tracking.
 * @returns {JSX.Element} The orders list page with order cards and status information.
 */
const MyOrders = () => {
  // State management
  const [orders, setOrders] = useState([]); // Stores user's orders
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate(); // Navigation hook

  /**
   * Fetches user's orders when component mounts or auth state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();

          // API call to fetch orders
          const response = await fetch(
            "https://web-production-2449.up.railway.app/api/orders/",
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch orders");
          }

          const data = await response.json();

          // Data validation and normalization
          const ordersArray = Array.isArray(data.orders) ? data.orders : [];
          const validatedOrders = ordersArray.map((order) => ({
            ...order,
            total: order.total ? Number(order.total) : 0,
            items: order.items
              ? order.items.map((item) => ({
                  ...item,
                  price: item.price ? Number(item.price) : 0,
                }))
              : [],
          }));

          setOrders(validatedOrders);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        // Redirect to login if user not authenticated
        navigate("/login/");
      }
    });

    // Cleanup function to unsubscribe from auth listener
    return () => unsubscribe();
  }, [navigate]);

  /**
   * Returns appropriate status icon based on order status
   * @param {string} status - Order status (pending, processing, shipped, delivered)
   * @returns {JSX.Element} Status icon component
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="status-icon pending" />;
      case "processing":
        return <FiPackage className="status-icon processing" />;
      case "shipped":
        return <FiTruck className="status-icon shipped" />;
      case "delivered":
        return <FiCheckCircle className="status-icon delivered" />;
      default:
        return <FiClock className="status-icon" />;
    }
  };

  /**
   * Formats date string to readable format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date (e.g., "Jan 1, 2023")
   */
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="error-message">
        <p>Error loading orders: {error}</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="orders-container">
        {/* Page Header */}
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>View and manage your recent purchases</p>
        </div>

        {/* Empty State */}
        {Array.isArray(orders) && orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-orders-content">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4555/4555971.png"
                alt="No orders"
                className="empty-orders-image"
              />
              <h2>No Orders Yet</h2>
              <p>
                You haven't placed any orders yet. Start shopping to see them
                here!
              </p>
              <Link to="/allproducts/" className="shop-now-btn">
                Shop Now
              </Link>
            </div>
          </div>
        ) : (
          /* Orders List */
          <div className="orders-list">
            {Array.isArray(orders) &&
              orders.map((order) => (
                <div key={order.id} className="order-card">
                  {/* Order Header (Number, Date, Status) */}
                  <div className="order-header">
                    <div className="order-meta">
                      <span className="order-number">
                        Order #{order.order_number}
                      </span>
                      <span className="order-date">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    <div className="order-status">
                      {getStatusIcon(order.status)}
                      <span className={`status-text ${order.status}`}>
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Preview (First 3 items) */}
                  <div className="order-items-preview">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="order-item-preview">
                        <div className="item-image-container">
                          <img
                            src={getProductImage(item)}
                            alt={item.product_name}
                            className="item-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/150?text=No+Image";
                            }}
                          />
                        </div>
                        <div className="item-details">
                          <h4 className="item-name">{item.product_name}</h4>
                          <div className="item-variants">
                            {item.size_name && <span className="variant">Size: {item.size_name}</span>}
                            {item.color_name && <span className="variant">Color: {item.color_name}</span>}
                            <span className="variant">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Show "+X more items" if more than 3 items */}
                    {order.items.length > 3 && (
                      <div className="more-items-indicator">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>

                  {/* Order Footer (Total Amount) */}
                  <div className="order-footer">
                    <div className="order-total">
                      <span>Total:</span>
                      <span className="total-amount">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;