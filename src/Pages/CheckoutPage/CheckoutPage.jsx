import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { auth } from "../../firebase";
import "./CheckoutPage.css";

/**
 * CheckoutPage Component - Handles the checkout process for both cart items and direct purchases.
 * Manages form state, payment processing, and order summary display.
 */
const CheckoutPage = () => {
  useEffect(()=>{
    document.title = 'CheckoutPage | RS Clothing'
  },[])
  // Router hooks for navigation and location state
  const location = useLocation();
  const navigate = useNavigate();

  // State for cart items and direct purchase information
  const [cartItems, setCartItems] = useState([]);
  const [isDirectPurchase, setIsDirectPurchase] = useState(false);
  const [directPurchaseItem, setDirectPurchaseItem] = useState(null);

  // Form state management
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    paymentMethod: "credit_card",
  });

  // UI state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Effect to load Razorpay script when component mounts
   * Ensures payment gateway is available when needed
   */
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  /**
   * Effect to initialize checkout data based on route state
   * Handles both direct purchases and cart checkout scenarios
   */
  useEffect(() => {
    if (location.state?.directPurchase) {
      setIsDirectPurchase(true);
      setDirectPurchaseItem(location.state.product);

      // Pre-fill user data if available
      const user = auth.currentUser;
      if (user) {
        setFormData((prev) => ({
          ...prev,
          email: user.email || "",
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
        }));
      }
    } else {
      fetchCartItems();
    }
  }, [location.state]);

  /**
   * Fetches cart items from the API for logged-in users
   */
  const fetchCartItems = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get(
        "https://web-production-2449.up.railway.app/api/cart/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCartItems(response.data.items || []);
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setError("Failed to load your cart. Please try again.");
      setCartItems([]);
    }
  };

  /**
   * Handles input changes for the checkout form
   * @param {Object} e - The event object from the input field
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Calculates order totals including subtotal, shipping, tax, and discounts
   * @returns {Object} An object containing all calculated totals
   */
  const calculateTotals = () => {
    // Calculate subtotal based on direct purchase or cart items
    const subtotal =
      isDirectPurchase && directPurchaseItem
        ? directPurchaseItem.price * directPurchaseItem.quantity
        : cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          );

    const shipping = 50; // Flat rate shipping
    const discount = subtotal > 1000 ? subtotal * 0.1 : 0; // 10% discount for orders over 1000
    const tax = subtotal * 0.18; // 18% tax
    const total = subtotal + shipping + tax - discount;

    return { subtotal, shipping, discount, tax, total };
  };

  /**
   * Processes payment based on selected method (COD or online payment)
   * @param {Object} orderResponse - Response from order creation API
   */
  const processPayment = async (orderResponse) => {
    const { order_id, order_number, total, razorpay_order_id } =
      orderResponse.data;

    // Handle Cash on Delivery (COD) directly
    if (formData.paymentMethod === "cod") {
      navigate("/order-success", {
        state: {
          orderId: order_id,
          orderNumber: order_number,
          amount: total,
          paymentMethod: "cod",
        },
      });
      return;
    }

    // Handle online payment with Razorpay
    try {
      const options = {
        key: "rzp_test_y4SrKO8SkuVv9g", // Razorpay test key
        amount: Math.round(total * 100), // Convert to paise
        currency: "INR",
        name: "ZU Clothing",
        description: `Order #${order_number}`,
        order_id: razorpay_order_id,
        handler: async (response) => {
          try {
            // Verify payment with backend
            await axios.post(
              "https://web-production-2449.up.railway.app/api/payments/verify/",
              {
                order_id: order_id,
                payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
                },
              }
            );

            // Navigate to success page on successful verification
            navigate("/order-success", {
              state: {
                orderId: order_id,
                orderNumber: order_number,
                amount: total,
                paymentId: response.razorpay_payment_id,
                paymentMethod: formData.paymentMethod,
              },
            });
          } catch (err) {
            console.error("Payment verification failed:", err);
            setError("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment window was closed. Please try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      setError("Payment processing failed. Please try again.");
      setLoading(false);
    }
  };

  /**
   * Handles form submission for the checkout process
   * @param {Object} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }

      // Calculate order totals
      const { subtotal, shipping, discount, tax, total } = calculateTotals();

      // Prepare order data for API
      const orderData = {
        ...formData,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        discount: discount.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
      };

      // Add product-specific data based on purchase type
      if (isDirectPurchase) {
        orderData.product_id = directPurchaseItem.id;
        orderData.quantity = directPurchaseItem.quantity;
        orderData.size_id = directPurchaseItem.selectedSize.id;
        orderData.color_id = directPurchaseItem.selectedColor?.id || null;
        orderData.is_direct_purchase = true;
      } else {
        orderData.items = cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          size_id: item.size?.id || null,
          color_id: item.color?.id || null,
        }));
      }

      // Create order via API
      const response = await axios.post(
        "https://web-production-2449.up.railway.app/api/orders/create/",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Process payment with the created order
      await processPayment(response);
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err.response?.data?.message || "Checkout failed. Please try again."
      );
      setLoading(false);
    }
  };

  // Calculate totals for display
  const { subtotal, shipping, discount, tax, total } = calculateTotals();

  return (
    <div className="checkout-container">
      <div className="checkout-grid">
        {/* Checkout Form Section */}
        <div className="checkout-form-section">
          <h2>Shipping Information</h2>
          <form onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Phone Field */}
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                pattern="[0-9]{10}"
                title="Please enter a 10-digit phone number"
              />
            </div>

            {/* Address Field */}
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* City and State Fields */}
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* ZIP Code and Country Fields */}
            <div className="form-row">
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{6}"
                  title="Please enter a 6-digit ZIP code"
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                >
                  <option value="India">India</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                </select>
              </div>
            </div>

            {/* Payment Method Selection */}
            <h2>Payment Method</h2>
            <div className="payment-methods">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={formData.paymentMethod === "credit_card"}
                  onChange={handleInputChange}
                />
                <span>Credit/Debit Card</span>
                <div className="payment-icons">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/196/196578.png"
                    alt="Visa"
                  />
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/196/196561.png"
                    alt="Mastercard"
                  />
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/825/825454.png"
                    alt="Rupay"
                  />
                </div>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={formData.paymentMethod === "upi"}
                  onChange={handleInputChange}
                />
                <span>UPI Payment</span>
                <div className="payment-icons">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
                    alt="Google Pay"
                  />
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/825/825462.png"
                    alt="PhonePe"
                  />
                </div>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={handleInputChange}
                />
                <span>Cash on Delivery</span>
              </label>
            </div>

            {/* Error Display */}
            {error && <div className="error-message">{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              className="checkout-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Processing...
                </>
              ) : (
                `Pay ₹${total.toFixed(2)}`
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Section */}
        <div className="order-summary-section">
          <h2>Order Summary</h2>
          <div className="order-items">
            {/* Display items based on purchase type */}
            {isDirectPurchase ? (
              <div className="order-item">
                <img
                  src={directPurchaseItem?.image}
                  alt={directPurchaseItem?.name}
                />
                <div className="item-details">
                  <h4>{directPurchaseItem?.name}</h4>
                  <p>Size: {directPurchaseItem?.selectedSize?.name}</p>
                  {directPurchaseItem?.selectedColor && (
                    <p>Color: {directPurchaseItem.selectedColor.name}</p>
                  )}
                  <p>Qty: {directPurchaseItem?.quantity}</p>
                </div>
                <div className="item-price">
                  ₹
                  {(
                    directPurchaseItem?.price * directPurchaseItem?.quantity
                  ).toFixed(2)}
                </div>
              </div>
            ) : cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Size: {item.size?.name || item.size}</p>
                    {item.color && (
                      <p>Color: {item.color?.name || item.color}</p>
                    )}
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-cart-message">Your cart is empty</div>
            )}
          </div>

          {/* Order Totals Display */}
          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Shipping</span>
              <span>₹{shipping.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Tax (18%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="total-row discount">
                <span>Discount</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="total-row grand-total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;