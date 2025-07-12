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

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();

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

          // Validate and normalize orders data
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
        navigate("/login/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

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
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>View and manage your recent purchases</p>
        </div>

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
          <div className="orders-list">
            {Array.isArray(orders) &&
              orders.map((order) => (
                <div key={order.id} className="order-card">
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
                    {order.items.length > 3 && (
                      <div className="more-items-indicator">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>

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
