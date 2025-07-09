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
        throw new Error("Please login to view your cart");
      }

      const token = await user.getIdToken();

      const response = await fetch(
        "https://ecco-back-4j3f.onrender.com/api/cart/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load cart: ${response.status}`);
      }

      const data = await response.json();
      
      const processedItems = data.items.map((item) => ({
        ...item,
        id: item.id || `${item.product_id}-${item.size_id}-${item.color_id}`,
        image: item.image || "/placeholder-product.jpg",
        color_name: item.color_name || item.color?.name || "",
        color_id: item.color_id || item.color?.id || null,
        size_name: item.size_name || item.size?.name || "",
        size_id: item.size_id || item.size?.id || null,
        product_id: item.product_id || item.id,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity)
      }));

      setCartData({
        items: processedItems,
        total: parseFloat(data.total) || 0,
        item_count: parseInt(data.item_count) || 0,
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
      showNotification(error.message || "Failed to load cart", "error");
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const handleCartAction = async (productId, action, quantity = 1, sizeId = null, colorId = null) => {
    try {
      setIsProcessing(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        navigate('/login', { state: { from: '/cart' } });
        return;
      }

      const token = await user.getIdToken();
      let endpoint, method, body;

      if (action === "remove") {
        endpoint = `https://ecco-back-4j3f.onrender.com/api/cart/remove/${productId}/`;
        method = "POST";
        body = { size_id: sizeId, color_id: colorId };
      } else if (action === "update") {
        endpoint = `https://ecco-back-4j3f.onrender.com/api/cart/update/${productId}/`;
        method = "POST";
        body = { 
          quantity, 
          size_id: sizeId, 
          color_id: colorId,
          update_quantity: true 
        };
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} item`);
      }

      showNotification(
        action === "remove" ? "Item removed from cart" : "Cart updated successfully"
      );
      await fetchCartData();
      
      // Update cart count in header
      if (window.updateCartCount) {
        window.updateCartCount();
      }
    } catch (error) {
      console.error(`Cart ${action} error:`, error);
      showNotification(error.message || "Operation failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = () => {
    if (cartData.item_count === 0) {
      showNotification("Your cart is empty", "error");
      return;
    }
    navigate('/checkout');
  };

  const calculateDiscount = () => {
    if (cartData.total > 1000) {
      return (cartData.total * 0.1).toFixed(2);
    }
    return 0;
  };

  const calculateFinalTotal = () => {
    const discount = calculateDiscount();
    return (cartData.total - discount).toFixed(2);
  };

  if (cartData.isLoading) {
    return (
      <div className="loading-container">
        <Header />
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (cartData.error) {
    return (
      <>
        <Header />
        <div className="error-container">
          <p>{cartData.error}</p>
          {cartData.error.includes("login") ? (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          ) : (
            <button onClick={fetchCartData} className="retry-btn">
              Try Again
            </button>
          )}
        </div>
      </>
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
              <div className="header-product">Product</div>
              <div className="header-quantity">Quantity</div>
              <div className="header-total">Total</div>
            </div>

            <div className="cart-items">
              {cartData.items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <div className="item-image-container">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="item-image"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <h3 className="item-name">
                        <Link to={`/product/${item.product_id}`}>{item.name}</Link>
                      </h3>
                      {item.color_name && (
                        <p className="item-variant">Color: {item.color_name}</p>
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
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{cartData.total.toFixed(2)}</span>
                </div>
                {calculateDiscount() > 0 && (
                  <div className="summary-row discount">
                    <span>Discount (10%)</span>
                    <span>-₹{calculateDiscount()}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="summary-row grand-total">
                  <span>Total</span>
                  <span>₹{calculateFinalTotal()}</span>
                </div>
              </div>
              
              <div className="checkout-actions">
                <Link to="/" className="continue-shopping">
                  Continue Shopping
                </Link>
                <button 
                  onClick={handleCheckout} 
                  className="checkout-btn"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <img src="/empty-cart.svg" alt="Empty cart" className="empty-cart-img" />
            <p>Your cart is empty</p>
            <Link to="/" className="continue-shopping">
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