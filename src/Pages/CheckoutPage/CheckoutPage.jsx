import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../firebase';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [isDirectPurchase, setIsDirectPurchase] = useState(false);
  const [directPurchaseItem, setDirectPurchaseItem] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    paymentMethod: 'credit_card'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.directPurchase) {
      setIsDirectPurchase(true);
      setDirectPurchaseItem(location.state.product);
      
      const user = auth.currentUser;
      if (user) {
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ')[1] || ''
        }));
      }
    } else {
      fetchCartItems();
    }
  }, [location.state]);

  const fetchCartItems = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get('https://ecco-back-4j3f.onrender.com/api/cart/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCartItems(response.data.items || []);
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setError('Failed to load your cart. Please try again.');
      setCartItems([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    if (isDirectPurchase && directPurchaseItem) {
      return (directPurchaseItem.price * directPurchaseItem.quantity).toFixed(2);
    }
    return (cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)).toFixed(2);
  };

  // Add this useEffect to load Razorpay script
useEffect(() => {
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  loadRazorpay();
}, []);

// Modified processPayment function
const processPayment = async (orderId, amount) => {
  if (formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'upi') {
    try {
      // For testing without backend - generate a static test order ID
      const testOrderId = 'order_LO8jzL2q7lR7VQ'; // Static test order ID from Razorpay
      
      const options = {
        key: "rzp_test_y4SrKO8SkuVv9g", // Your test API key
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        name: 'ZU Clothing',
        description: 'Test Transaction',
        order_id: testOrderId, // Using static test order ID
        handler: function(response) {
          // This will be executed after successful payment
          // For testing, we'll assume payment is always successful
          alert(`Payment ID: ${response.razorpay_payment_id}`);
          navigate('/order-success', { 
            state: { 
              orderId,
              amount,
              paymentMethod: formData.paymentMethod,
              razorpayPaymentId: response.razorpay_payment_id
            }
          });
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            alert('Payment window closed');
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
      
      // For testing, you can simulate successful payment
      // rzp.on('payment.success', function(response) {
      //   console.log(response);
      // });
      
    } catch (err) {
      console.error('Razorpay error:', err);
      setError('Payment failed. Please try again.');
      setLoading(false);
    }
  } else {
    // For COD
    navigate('/order-success', { 
      state: { 
        orderId,
        amount,
        paymentMethod: 'cod'
      }
    });
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }

      let orderData;
      if (isDirectPurchase) {
        orderData = {
          ...formData,
          product_id: directPurchaseItem.id,
          quantity: directPurchaseItem.quantity,
          size_id: directPurchaseItem.selectedSize.id,
          color_id: directPurchaseItem.selectedColor?.id || null,
          total_amount: calculateTotal(),
          is_direct_purchase: true
        };
      } else {
        orderData = {
          ...formData,
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            size_id: item.size?.id || null,
            color_id: item.color?.id || null
          })),
          total_amount: calculateTotal()
        };
      }

      const response = await axios.post('https://ecco-back-4j3f.onrender.com/api/orders/create/', orderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      await processPayment(response.data.order_id, calculateTotal());
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-grid">
        <div className="checkout-form-section">
          <h2>Shipping Information</h2>
          <form onSubmit={handleSubmit}>
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

            <h2>Payment Method</h2>
            <div className="payment-methods">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={formData.paymentMethod === 'credit_card'}
                  onChange={handleInputChange}
                />
                <span>Credit/Debit Card</span>
                <div className="payment-icons">
                  <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" />
                  <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="Mastercard" />
                  <img src="https://cdn-icons-png.flaticon.com/512/825/825454.png" alt="Rupay" />
                </div>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleInputChange}
                />
                <span>Cash on Delivery</span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={formData.paymentMethod === 'upi'}
                  onChange={handleInputChange}
                />
                <span>UPI Payment</span>
                <div className="payment-icons">
                  <img src="https://cdn-icons-png.flaticon.com/512/300/300221.png" alt="Google Pay" />
                  <img src="https://cdn-icons-png.flaticon.com/512/825/825462.png" alt="PhonePe" />
                </div>
              </label>
            </div>

            {error && <div className="error-message">{error}</div>}

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
                `Pay ₹${calculateTotal()}`
              )}
            </button>
          </form>
        </div>

        <div className="order-summary-section">
          <h2>Order Summary</h2>
          <div className="order-items">
            {isDirectPurchase ? (
              <div className="order-item">
                <img src={directPurchaseItem?.image} alt={directPurchaseItem?.name} />
                <div className="item-details">
                  <h4>{directPurchaseItem?.name}</h4>
                  <p>Size: {directPurchaseItem?.selectedSize?.name}</p>
                  {directPurchaseItem?.selectedColor && (
                    <p>Color: {directPurchaseItem.selectedColor.name}</p>
                  )}
                  <p>Qty: {directPurchaseItem?.quantity}</p>
                </div>
                <div className="item-price">
                  ₹{(directPurchaseItem?.price * directPurchaseItem?.quantity).toFixed(2)}
                </div>
              </div>
            ) : (
              cartItems.length > 0 ? (
                cartItems.map(item => (
                  <div key={item.id} className="order-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>Size: {item.size?.name || item.size}</p>
                      {item.color && <p>Color: {item.color?.name || item.color}</p>}
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-cart-message">Your cart is empty</div>
              )
            )}
          </div>

          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>₹{calculateTotal()}</span>
            </div>
            <div className="total-row">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            {Number(calculateTotal()) > 1000 && (
              <div className="total-row discount">
                <span>Discount (10%)</span>
                <span>-₹{(Number(calculateTotal()) * 0.1).toFixed(2)}</span>
              </div>
            )}
            <div className="total-row grand-total">
              <span>Total</span>
              <span>
                ₹{Number(calculateTotal()) > 1000 ? 
                  (Number(calculateTotal()) * 0.9).toFixed(2) : 
                  calculateTotal()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;