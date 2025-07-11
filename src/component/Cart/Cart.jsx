import React, { useState, useEffect } from "react";
import "./Cart.css";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../Notification/Notification";
import { getAuth } from "firebase/auth";

const Cart = () => {
  const [cartData, setCartData] = useState({
    items: [],
    total: 0,
    item_count: 0,
    isLoading: true,
    error: null,
  });
  const [notification, setNotification] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchCartData = async () => {
    try {
      setCartData((prev) => ({ ...prev, isLoading: true }));

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not authenticated");
      }

      const token = await user.getIdToken();

      const response = await fetch(
        "https://web-production-2449.up.railway.app/api/cart/",
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

      const processedItems = items.map((item) => ({
        ...item,
        image: item.image || "/placeholder-product.jpg",
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

  useEffect(() => {
    fetchCartData();
  }, []);

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

      if (action === "remove") {
        endpoint = `https://web-production-2449.up.railway.app/api/cart/remove/${productId}/`;
        body = { size_id: sizeId, color_id: colorId };
      } else if (action === "update") {
        endpoint = `https://web-production-2449.up.railway.app/api/cart/update/${productId}/`;
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

      showNotification(
        action === "remove"
          ? "Item removed from cart"
          : "Cart updated successfully"
      );

      await fetchCartData();

      // Update cart count in header
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

  const handleCheckout = () => {
    if (cartData.item_count === 0) {
      showNotification("Your cart is empty", "error");
      return;
    }
    navigate("/checkout");
  };

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
      <Header cartItemCount={cartData.item_count} />
      <div className="cart-container">
        <h1 className="cart-title">Your Shopping Cart</h1>

        {cartData.item_count > 0 ? (
          <>
            <div className="cart-header">
              <div>Product</div>
              <div>Quantity</div>
              <div>Total</div>
            </div>

            <div className="cart-items">
              {cartData.items.map((item) => (
                <div key={item.id} className="cart-item">
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

                  <div className="price-section">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

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
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/" className="continue-shopping text-white">
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
      <Footer />

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
