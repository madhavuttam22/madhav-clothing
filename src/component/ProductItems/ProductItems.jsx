import React, { useState, useEffect } from "react";
import "./ProductItems.css";
import axios from "axios";
import { Link } from "react-router-dom";
import Notification from "../Notification/Notification";
import { useNavigate, useLocation } from "react-router-dom";
// import { checkAuth } from "../LoginRequired/checkAuth";
import { getAuth } from "firebase/auth";
import { auth } from '../../firebase';  // Adjust the path to where firebase.js is located


const ProductItems = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getCookie = (name) => {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return cookieValue ? cookieValue.split("=")[1] : null;
};


  const handleSizeChange = (productId, sizeId) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: sizeId,
    }));
  };

  const addToCart = async (productId) => {
  try {
    const token = await auth.currentUser.getIdToken(); // ✅ Correct usage
    console.log("Firebase Token:", token); // Log this
    const size_id = selectedSizes[productId]; // Get selected size

    if (!size_id) {
      showNotification("Please select a size before adding to cart", "error");
      return;
    }

    const response = await fetch(`http://localhost:8000/api/cart/add/${productId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ send Firebase token
      },
      body: JSON.stringify({ quantity: 1, size_id }), // ✅ include size
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Error:", data);
      showNotification(data.message || "Failed to add to cart", "error");
    } else {
      console.log("Added to cart!");
      showNotification("Item added to cart successfully");
    }
  } catch (err) {
    console.error("Add to cart error:", err);
    showNotification("Something went wrong. Please try again.", "error");
  }
};





  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/products/?is_top=true"
        );

        const productsWithSizes = res.data.map((product) => {
          // Find first available size or default to first size
          const firstAvailableSize =
            product.sizes?.find((size) => size.stock > 0)?.size ||
            product.sizes?.[0]?.size;

          // Get the first available image
          let imageUrl = null;
          if (product.colors?.length > 0) {
            const firstColor = product.colors[0];
            if (firstColor.images?.length > 0) {
              const defaultImage = firstColor.images.find(
                (img) => img.is_default
              );
              imageUrl =
                defaultImage?.image_url || firstColor.images[0].image_url;
            }
          }

          return {
            ...product,
            defaultSize: firstAvailableSize,
            image: imageUrl, // Add the image URL to the product
          };
        });

        setTopProducts(productsWithSizes);

        // Initialize selected sizes
        const initialSizes = {};
        productsWithSizes.forEach((product) => {
          if (product.defaultSize) {
            initialSizes[product.id] = product.defaultSize.id;
          }
        });
        setSelectedSizes(initialSizes);
      } catch (err) {
        console.error("Failed to load top products", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTopProducts();
  }, []);

  if (loading) return <div className="loading">Loading top products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <h1 className="my-5 text-center fw-medium">Top Products</h1>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="cards mt-5">
        {topProducts.map((item) => (
          <div className="product-card" key={item.id}>
            <Link to={`/product/${item.id}/`}>
              <div className="image-container">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="product-image"
                  />
                ) : (
                  <div className="no-image-placeholder" />
                )}
                <span className="sale-badge">On Sale</span>
              </div>
            </Link>
            <div className="best-seller-info">
              <h3 className="best-seller-title">
                <Link
                  to={`/product/${item.id}/`}
                  className="best-seller-title-link"
                >
                  {item.name}
                </Link>
              </h3>
              <div className="best-seller-price-wrapper">
                <span className="best-seller-current-price">
                  ₹{item.currentprice}
                </span>
                {item.orignalprice && item.orignalprice > item.currentprice && (
                  <span className="best-seller-original-price">
                    ₹{item.orignalprice}
                  </span>
                )}
              </div>

              {/* Only added this size selector section */}
              {item.sizes?.length > 0 && (
                <div className="size-selector">
                  <select
                    value={selectedSizes[item.id] || ""}
                    onChange={(e) => handleSizeChange(item.id, e.target.value)}
                    className="size-dropdown"
                  >
                    {item.sizes.map(({ size, stock }) => (
                      <option
                        key={size.id}
                        value={size.id}
                        disabled={stock <= 0}
                      >
                        {size.name} {stock <= 0 ? "(Out of Stock)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                className="add-to-cart-top"
                onClick={() => addToCart(item.id)}
                disabled={addingToCartId === item.id || !selectedSizes[item.id]}
              >
                {addingToCartId === item.id ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProductItems;
