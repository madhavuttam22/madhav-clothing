import React, { useState, useEffect } from "react";
import "./Cart.css";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../Notification/Notification";
import { getAuth } from "firebase/auth";

/**
 * Cart Component
 * Displays the user's shopping cart with the ability to:
 * - View cart items with images, quantities, and prices
 * - Update item quantities
 * - Remove items from cart
 * - Proceed to checkout
 * - Handle empty cart state
 */
const Cart = () => {
  useEffect(() => {
    document.title = "CartPage | RS Clothing";
  }, []);
  // State management
  const [cartData, setCartData] = useState({
    items: [], // Array of cart items
    total: 0, // Total cart value
    item_count: 0, // Total number of items
    isLoading: true, // Loading state
    error: null, // Error state
  });
  const [notification, setNotification] = useState(null); // Notification system
  const [isProcessing, setIsProcessing] = useState(false); // Processing state for cart actions
  const navigate = useNavigate();

  /**
   * Shows a notification message
   * @param {string} message - The message to display
   * @param {string} type - The type of notification ('success' or 'error')
   */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Auto-dismiss after 3 seconds
  };

  /**
   * Fetches cart data from the API
   */
  const fetchCartData = async () => {
    try {
      setCartData((prev) => ({ ...prev, isLoading: true }));

      const auth = getAuth();
      const user = auth.currentUser;

      // Check authentication
      if (!user) {
        throw new Error("User not authenticated");
      }

      const token = await user.getIdToken();

      // API call to get cart data
      const response = await fetch(
        "https://web-production-27d40.up.railway.app/api/cart/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const items = data.items || [];
      const total = data.total || 0;
      const item_count = data.item_count || 0;

      // Process cart items to ensure consistent structure
      const processedItems = items.map((item) => ({
        ...item,
        image: item.image || "/placeholder-product.jpg", // Fallback image
        color_name: item.color || item.color_name || "",
        color_id: item.color_id || item.color?.id || null,
        size_name: item.size_name || "",
        size_id: item.size_id || null,
        product_id: item.product_id || item.id || null,
      }));

      setCartData({
        items: processedItems,
        total,
        item_count,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Cart fetch error:", error);
      setCartData({
        items: [],
        total: 0,
        item_count: 0,
        isLoading: false,
        error: error.message,
      });
      showNotification("Failed to load cart. Please try again.", "error");
    }
  };

  // Fetch cart data on component mount
  useEffect(() => {
    fetchCartData();
  }, []);

  /**
   * Handles cart actions (update quantity or remove item)
   * @param {string} productId - The ID of the product
   * @param {string} action - The action to perform ('update' or 'remove')
   * @param {number} quantity - The new quantity (for update actions)
   * @param {string} sizeId - The size ID of the product
   * @param {string} colorId - The color ID of the product
   */
  const handleCartAction = async (
    productId,
    action,
    quantity,
    sizeId = null,
    colorId = null
  ) => {
    try {
      setIsProcessing(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not authenticated");
      }

      const token = await user.getIdToken();
      let endpoint = "";
      let body = {};

      // Determine API endpoint and request body based on action
      if (action === "remove") {
        endpoint = `https://web-production-27d40.up.railway.app/api/cart/remove/${productId}/`;
        body = { size_id: sizeId, color_id: colorId };
      } else if (action === "update") {
        endpoint = `https://web-production-27d40.up.railway.app/api/cart/update/${productId}/`;
        body = {
          quantity,
          size_id: sizeId,
          color_id: colorId,
          update_quantity: true,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} item`);
      }

      // Show success notification
      showNotification(
        action === "remove"
          ? "Item removed from cart"
          : "Cart updated successfully"
      );

      // Refresh cart data
      await fetchCartData();

      // Update cart count in header if global function exists
      if (window.updateCartCount) {
        window.updateCartCount();
      }
    } catch (error) {
      console.error(`Cart ${action} error:`, error);
      showNotification(error.message || "Something went wrong", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handles checkout button click
   */
  const handleCheckout = () => {
    if (cartData.item_count === 0) {
      showNotification("Your cart is empty", "error");
      return;
    }
    navigate("/checkout");
  };

  // Loading and error states
  if (cartData.isLoading) return <div className="loading">Loading cart...</div>;
  if (cartData.error) {
    return (
      <div className="error">
        Error: {cartData.error}
        <button onClick={fetchCartData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="cart-container">
        <h1 className="cart-title">Your Shopping Cart</h1>

        {cartData.item_count > 0 ? (
          <>
            {/* Cart items table header */}
            <div className="cart-header">
              <div>Product</div>
              <div>Quantity</div>
              <div>Total</div>
            </div>

            {/* Cart items list */}
            <div className="cart-items">
              {cartData.items.map((item) => (
                <div key={item.id} className="cart-item">
                  {/* Product information */}
                  <div className="item-info">
                    <div className="item-image-container">
                      <img
                        src={item.image}
                        alt={`${item.name} - ${item.color_name || item.color}`}
                        className="item-image"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <h3 className="item-name">{item.name}</h3>
                      {(item.color_name || item.color) && (
                        <p className="item-variant">
                          Color: {item.color_name || item.color}
                        </p>
                      )}
                      {item.size_name && (
                        <p className="item-variant">Size: {item.size_name}</p>
                      )}
                      <p className="item-price">₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="quantity-section">
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          handleCartAction(
                            item.product_id,
                            "update",
                            item.quantity - 1,
                            item.size_id,
                            item.color_id
                          )
                        }
                        disabled={item.quantity <= 1 || isProcessing}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleCartAction(
                            item.product_id,
                            "update",
                            item.quantity + 1,
                            item.size_id,
                            item.color_id
                          )
                        }
                        disabled={isProcessing}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() =>
                        handleCartAction(
                          item.product_id,
                          "remove",
                          null,
                          item.size_id,
                          item.color_id
                        )
                      }
                      disabled={isProcessing}
                    >
                      Remove
                    </button>
                  </div>

                  {/* Item total price */}
                  <div className="price-section">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Cart summary and checkout */}
            <div className="cart-summary">
              <div className="total-section">
                <p className="total-amount">
                  Total: ₹{cartData.total.toFixed(2)}
                </p>
                <p className="shipping-note">
                  Shipping & taxes calculated at checkout
                </p>
                <button
                  onClick={handleCheckout}
                  className="checkout-btn"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "CHECKOUT"}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty cart state */
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/" className="continue-shopping text-white">
              Continue Shopping
            </Link>
          </div>
        )}
      </div>

      {/* Notification component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default Cart;
