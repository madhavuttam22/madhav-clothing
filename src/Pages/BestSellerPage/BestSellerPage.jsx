import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Notification from "../../component/Notification/Notification";
import Filters from "../../component/Filters/Filters";
import { auth } from "../../firebase";
import checkAuthAndRedirect from "../../utils/checkAuthAndRedirect";
import BackToTop from "../../component/BackToTop/BackToTop";
import "./BestSellerPage.css";

/**
 * BestSellerPage Component - Displays a grid of best-selling products with filtering options
 *
 * Features:
 * - Displays products marked as best sellers from the API
 * - Allows filtering by size, color, and price sorting
 * - Implements infinite scroll for product loading
 * - Handles adding products to cart with size selection
 * - Responsive design for all screen sizes
 */
const BestSellerPage = () => {
  // Navigation and routing hooks
  const navigate = useNavigate();
  const location = useLocation();

  // State management for products and UI
  const [bestSellers, setBestSellers] = useState([]); // All best seller products
  const [filteredProducts, setFilteredProducts] = useState([]); // Products after filters applied
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [addingToCartId, setAddingToCartId] = useState(null); // Tracks which product is being added to cart
  const [notification, setNotification] = useState(null); // Notification message state
  const [selectedSizes, setSelectedSizes] = useState({}); // Tracks selected sizes for each product
  const [page, setPage] = useState(1); // Current page for infinite scroll
  const [hasMore, setHasMore] = useState(true); // Flag for more products available

  // Ref for intersection observer (infinite scroll)
  const observer = useRef();

  /**
   * Displays a notification message
   * @param {string} message - The notification message to display
   * @param {string} type - The type of notification ('success' or 'error')
   */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch best seller products on component mount
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        // API call to get best seller products
        const res = await axios.get(
          "https://web-production-2449.up.railway.app/api/products/?is_best=true"
        );

        // Process product data to include default images and sizes
        const productsWithData = res.data.map((product) => {
          // Set default image (fallback to placeholder if none available)
          let imageUrl = "/placeholder-product.jpg";
          if (product.colors?.length > 0) {
            const firstColor = product.colors[0];
            const defaultImage = firstColor.images.find(
              (img) => img.is_default
            );
            imageUrl =
              defaultImage?.image_url ||
              firstColor.images?.[0]?.image_url ||
              imageUrl;
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

        // Update state with processed products
        setBestSellers(productsWithData);
        setFilteredProducts(productsWithData);

        // Initialize selected sizes for each product
        const initialSizes = {};
        productsWithData.forEach((product) => {
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
   * Intersection Observer callback for infinite scroll
   * @param {HTMLElement} node - The DOM element to observe
   */
  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          // In a real implementation, you would fetch more data here
          // For now, we'll just simulate infinite scroll with existing data
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  /**
   * Handles size selection change for a product
   * @param {number} productId - ID of the product
   * @param {number} sizeId - ID of the selected size
   */
  const handleSizeChange = (productId, sizeId) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: parseInt(sizeId),
    }));
  };

  /**
   * Adds a product to the user's cart
   * @param {number} productId - ID of the product to add
   */
  const addToCart = async (productId) => {
    const selectedSizeId = parseInt(selectedSizes[productId]);
    if (!selectedSizeId) {
      showNotification("Please select a size", "error");
      return;
    }

    // Find the product in best sellers list
    const product = bestSellers.find((p) => p.id === productId);
    if (!product) {
      showNotification("Product not found", "error");
      return;
    }

    // Check if selected size is in stock
    const selectedSize = product.sizes?.find(
      (size) => size.size.id === selectedSizeId
    );

    if (!selectedSize || selectedSize.stock <= 0) {
      showNotification("Selected size is out of stock", "error");
      return;
    }

    try {
      setAddingToCartId(productId);
      // Check authentication and get token
      const token = await checkAuthAndRedirect(navigate, location.pathname);
      if (!token) return;

      // Get default color (first available)
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

      // Show success notification and update cart count
      showNotification(
        data.message || `${product.name} added to cart successfully!`
      );
      if (typeof window.updateCartCount === "function") {
        window.updateCartCount();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification(
        error.message || "Failed to add product. Please try again.",
        "error"
      );
    } finally {
      setAddingToCartId(null);
    }
  };

  /**
   * Applies filters to the product list
   * @param {Object} filters - Filter options
   * @param {number} filters.size - Size ID to filter by
   * @param {number} filters.color - Color ID to filter by
   * @param {string} filters.sort - Sorting method ('price_low' or 'price_high')
   */
  const applyFilters = ({ size, color, sort }) => {
    let filtered = [...bestSellers];

    // Filter by size if specified
    if (size) {
      filtered = filtered.filter((product) =>
        product.sizes?.some((s) => s.size.id === parseInt(size))
      );
    }

    // Filter by color if specified
    if (color) {
      filtered = filtered.filter((product) =>
        product.colors?.some((c) => c.color.id === parseInt(color))
      );
    }

    // Apply sorting
    if (sort === "price_low") {
      filtered.sort((a, b) => a.currentprice - b.currentprice);
    } else if (sort === "price_high") {
      filtered.sort((a, b) => b.currentprice - a.currentprice);
    }

    // Update filtered products and reset pagination
    setFilteredProducts(filtered);
    setPage(1);
  };

  // Loading and error states
  if (loading) return <div className="loading">Loading best sellers...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <div className="bestseller-page-container">
        <h1 className="bestseller">Best Seller</h1>

        {/* Notification component for showing messages */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="bestseller-content">
          {/* Filters sidebar */}
          <div className="filters-sidebar">
            <Filters products={bestSellers} onApply={applyFilters} />
          </div>

          {/* Products grid */}
          <div className="products-grid-container">
            <div className="best-seller-grid">
              {filteredProducts.map((item, index) => (
                <div
                  className="best-seller-card"
                  key={item.id}
                  ref={
                    index === filteredProducts.length - 1
                      ? lastProductRef
                      : null
                  }
                >
                  {/* Product image with link to product page */}
                  <div onClick={() => {
                        navigate(`/product/${item.id}/`);
                        window.location.reload();
                      }}>
                    <div className="best-seller-image-container">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="best-seller-image"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                      <span className="best-seller-badge">Best Seller</span>
                    </div>
                  </div>

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
                    <div className="best-seller-price-wrapper d-flex justify-content-center">
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

                    {/* Size selector dropdown */}
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
        </div>
      </div>

      <BackToTop />
    </>
  );
};

export default BestSellerPage;
