import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./BestSeller.css";
import axios from "axios";
import Notification from "../Notification/Notification";
import { auth } from "../../firebase"; // Firebase authentication
import checkAuthAndRedirect from "../../utils/checkAuthAndRedirect";

/**
 * BestSeller Component
 * Displays a grid of best-selling products with the ability to add them to cart.
 * Features include:
 * - Product cards with images, prices, and size selection
 * - "Add to Cart" functionality with authentication check
 * - Responsive design with hover effects
 * - Notification system for user feedback
 */
const BestSeller = () => {
  // Navigation and routing hooks
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null); // Tracks which product is being added
  const [notification, setNotification] = useState(null); // Notification state
  const [selectedSizes, setSelectedSizes] = useState({}); // Stores selected sizes for each product

  /**
   * Displays a notification to the user
   * @param {string} message - The message to display
   * @param {string} type - The type of notification ('success' or 'error')
   */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Auto-dismiss after 3 seconds
  };

  // Fetch best-selling products on component mount
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await axios.get(
          "https://web-production-2449.up.railway.app/api/products/?is_best=true"
        );

        // Process product data to include images and default sizes
        const productsWithImagesAndSizes = res.data.map((product) => {
          // Find the first available image (default image preferred)
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

          // Find first available size or default to first size
          const firstAvailableSize =
            product.sizes?.find((size) => size.stock > 0)?.size ||
            product.sizes?.[0]?.size;

          return {
            ...product,
            image: imageUrl,
            defaultSize: firstAvailableSize,
          };
        });

        setBestSellers(productsWithImagesAndSizes);

        // Initialize selected sizes with first available or first size
        const initialSizes = {};
        productsWithImagesAndSizes.forEach((product) => {
          if (product.defaultSize) {
            initialSizes[product.id] = product.defaultSize.id;
          }
        });
        setSelectedSizes(initialSizes);
      } catch (err) {
        console.error("Failed to load best sellers", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  /**
   * Handles size selection change for a product
   * @param {string} productId - The ID of the product
   * @param {string} sizeId - The selected size ID
   */
  const handleSizeChange = (productId, sizeId) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: sizeId,
    }));
  };

  /**
   * Adds a product to the user's cart
   * @param {string} productId - The ID of the product to add
   */
  const addToCart = async (productId) => {
    const selectedSizeId = selectedSizes[productId];
    if (!selectedSizeId) {
      showNotification("Please select a size", "error");
      return;
    }

    const product = bestSellers.find((p) => p.id === productId);
    if (!product) {
      showNotification("Product not found", "error");
      return;
    }

    try {
      // Check authentication and get token
      const token = await checkAuthAndRedirect(navigate, location.pathname);
      if (!token) return;

      setAddingToCartId(productId); // Show loading state for this product

      const colorId =
        product.colors?.length > 0 ? product.colors[0].color.id : null;

      // API call to add product to cart
      const response = await fetch(
        `https://web-production-2449.up.railway.app/api/cart/add/${productId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: 1,
            size_id: selectedSizeId,
            color_id: colorId,
            update_quantity: true,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }

      // Show success notification
      showNotification(
        data.message || `${product.name} added to cart successfully!`
      );

      // Update cart count if global function exists
      if (typeof window.updateCartCount === "function") {
        window.updateCartCount();
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      showNotification(
        error.message || "Failed to add to cart. Please try again.",
        "error"
      );
    } finally {
      setAddingToCartId(null); // Reset loading state
    }
  };

  // Loading and error states
  if (loading) return <div className="loading">Loading best sellers...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <h1 className="bestseller">Best Seller</h1>

      {/* Notification component for user feedback */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Main product grid */}
      <div className="best-seller-container">
        <div className="best-seller-cards">
          {bestSellers.slice(0, 8).map((item) => (
            <div className="best-seller-card" key={item.id}>
              {/* Product image with link to product page */}
              <Link to={`/product/${item.id}/`}>
                <div className="best-seller-image-container">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="best-seller-image"
                    />
                  ) : (
                    <div className="no-image-placeholder" />
                  )}
                  <span className="best-seller-badge">Best Seller</span>
                </div>
              </Link>

              {/* Product info section */}
              <div className="best-seller-info">
                <h3 className="best-seller-title">
                  <Link
                    to={`/product/${item.id}/`}
                    className="best-seller-title-link"
                  >
                    {item.name}
                  </Link>
                </h3>

                {/* Price display */}
                <div className="best-seller-price-wrapper">
                  <span className="best-seller-current-price">
                    ₹{item.currentprice}
                  </span>
                  {item.orignalprice &&
                    item.orignalprice > item.currentprice && (
                      <span className="best-seller-original-price">
                        ₹{item.orignalprice}
                      </span>
                    )}
                </div>

                {/* Size selection dropdown */}
                {item.sizes?.length > 0 && (
                  <div className="size-selector">
                    <select
                      value={selectedSizes[item.id] || ""}
                      onChange={(e) =>
                        handleSizeChange(item.id, e.target.value)
                      }
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
                  className="best-seller-add-to-cart"
                  onClick={() => addToCart(item.id)}
                  disabled={
                    addingToCartId === item.id || !selectedSizes[item.id]
                  }
                >
                  {addingToCartId === item.id ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View all button */}
      <div className="view-all-btn-div d-flex justify-content-center my-3">
        <Link to="/bestseller/" className="view-all-btn text-white">
          VIEW ALL
        </Link>
      </div>
    </>
  );
};

export default BestSeller;