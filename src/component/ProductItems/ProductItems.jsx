import React, { useState, useEffect } from "react";
import "./ProductItems.css";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Notification from "../Notification/Notification";
import { auth } from "../../firebase";
import checkAuthAndRedirect from "../../utils/checkAuthAndRedirect";

/**
 * ProductItems Component - Displays a grid of top products with add-to-cart functionality
 *
 * @returns {JSX.Element} - Rendered product grid component
 */
const ProductItems = () => {
  // Navigation and routing hooks
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [topProducts, setTopProducts] = useState([]); // Stores top products data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [addingToCartId, setAddingToCartId] = useState(null); // Tracks which product is being added to cart
  const [notification, setNotification] = useState(null); // Notification state
  const [selectedSizes, setSelectedSizes] = useState({}); // Stores selected sizes for each product
  const [selectedColors, setSelectedColors] = useState({}); // Stores selected colors for each product
  const from = location.state?.from || "/"; // Redirect path after auth

  /**
   * Shows a notification message
   * @param {string} message - Notification content
   * @param {string} type - Notification type ('success', 'error', etc.)
   */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Auto-dismiss after 3 seconds
  };

  /**
   * Handles size selection change for a product
   * @param {string} productId - ID of the product
   * @param {string} sizeId - ID of the selected size
   */
  const handleSizeChange = (productId, sizeId) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: sizeId,
    }));
  };

  /**
   * Adds a product to the cart
   * @param {string} productId - ID of the product to add
   */
  const addToCart = async (productId) => {
    const sizeId = selectedSizes[productId];
    const colorId = selectedColors[productId];

    // Validate size selection
    if (!sizeId) {
      showNotification("Please select a size before adding to cart", "error");
      return;
    }

    try {
      setAddingToCartId(productId); // Set loading state for this product

      // Check authentication and get token
      const token = await checkAuthAndRedirect(navigate, location.pathname);
      if (!token) return; // User not logged in, redirected

      // API call to add to cart
      const response = await fetch(
        `https://ecommerce-backend-da9u.onrender.com/api/cart/add/${productId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: 1,
            size_id: sizeId,
            color_id: colorId,
            update_quantity: true,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }

      // Show success and update UI
      showNotification(data.message || "Item added to cart successfully!");
      if (typeof window.updateCartCount === "function") {
        window.updateCartCount(); // Update cart count if function exists
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      showNotification("Something went wrong. Please try again.", "error");
    } finally {
      setAddingToCartId(null); // Reset loading state
    }
  };

  // Fetch top products on component mount
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const res = await axios.get(
          "https://ecommerce-backend-da9u.onrender.com/api/products/?is_top=true"
        );

        // Process product data with defaults
        const productsWithDetails = res.data.map((product) => {
          // Find first available size or fallback to first size
          const firstAvailableSize =
            product.sizes?.find((size) => size.stock > 0)?.size ||
            product.sizes?.[0]?.size;

          // Set default image with fallbacks
          let imageUrl = "/placeholder-product.jpg";
          if (product.colors?.length > 0) {
            const firstColor = product.colors[0];
            if (firstColor.images?.length > 0) {
              const defaultImage = firstColor.images.find(
                (img) => img.is_default
              );
              imageUrl =
                defaultImage?.image_url ||
                firstColor.images[0].image_url ||
                imageUrl;
            }
          }

          return {
            ...product,
            defaultSize: firstAvailableSize,
            image: imageUrl,
          };
        });

        setTopProducts(productsWithDetails);

        // Initialize default selections
        const initialSizes = {};
        const initialColors = {};
        productsWithDetails.forEach((product) => {
          if (product.defaultSize) {
            initialSizes[product.id] = product.defaultSize.id;
          }
          if (product.colors?.length > 0) {
            initialColors[product.id] = product.colors[0].color.id;
          }
        });

        setSelectedSizes(initialSizes);
        setSelectedColors(initialColors);
      } catch (err) {
        console.error("Failed to load top products", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTopProducts();
  }, []);

  // Loading and error states
  if (loading) return <div className="loading">Loading top products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <h1 className="top-products-title">Top Products</h1>

      {/* Notification component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Products grid */}
      <div className="top-products-grid">
        {topProducts.map((item) => (
          <div className="top-product-card" key={item.id}>
            {/* Product image with link */}
            <Link to={`/product/${item.id}/`}>
              <div className="top-product-image-container">
                <img
                  src={item.image}
                  alt={item.name}
                  className="top-product-image"
                  onError={(e) => {
                    e.target.src = "/placeholder-product.jpg";
                    e.target.onerror = null;
                  }}
                />
                {item.is_top_product && (
                  <span className="top-product-badge">Top Product</span>
                )}
              </div>
            </Link>

            {/* Product info section */}
            <div className="top-product-info">
              <h3 className="top-product-title text-center">
                <Link
                  to={`/product/${item.id}/`}
                  className="top-product-title-link"
                >
                  {item.name}
                </Link>
              </h3>

              {/* Price display */}
              <div className="top-product-price-wrapper d-flex justify-content-center">
                <span className="top-product-current-price">
                  ₹{item.currentprice}
                </span>
                {item.orignalprice && item.orignalprice > item.currentprice && (
                  <span className="top-product-original-price">
                    ₹{item.orignalprice}
                  </span>
                )}
              </div>

              {/* Size selector */}
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

              {/* Add to cart button */}
              <button
                className="top-product-add-to-cart"
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
