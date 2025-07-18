import React, { useEffect, useState, useRef, useCallback } from "react";
import Header from "../../component/Header/Header";
import Footer from "../../component/Footer/Footer";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Notification from "../../component/Notification/Notification";
import Filters from "../../component/Filters/Filters";
import { auth } from "../../firebase";
import checkAuthAndRedirect from "../../utils/checkAuthAndRedirect";
import BackToTop from "../../component/BackToTop/BackToTop";
import "./NewCollectionPage.css";

/**
 * NewCollectionPage Component
 * Displays a grid of new arrival products with filtering, sorting, and cart functionality
 * Features:
 * - Infinite scroll loading
 * - Size selection for products
 * - Price filtering and sorting
 * - Add to cart functionality
 * - Responsive design
 */
const NewCollectionPage = () => {
  useEffect(()=>{
    document.title = 'NewCollectionPage | RS Clothing'
  },[])
  // Navigation and routing hooks
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [newCollection, setNewCollection] = useState([]); // Original product data from API
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered product data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [addingToCartId, setAddingToCartId] = useState(null); // Tracks which product is being added to cart
  const [notification, setNotification] = useState(null); // Notification state
  const [selectedSizes, setSelectedSizes] = useState({}); // Tracks selected size for each product
  const [page, setPage] = useState(1); // Current page for infinite scroll
  const [hasMore, setHasMore] = useState(true); // Whether more products are available

  // Intersection Observer for infinite scroll
  const observer = useRef();

  /**
   * Displays a temporary notification message
   * @param {string} message - The notification text
   * @param {string} type - Notification type ('success' or 'error')
   */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Auto-dismiss after 3 seconds
  };

  /**
   * Fetches new collection products on component mount
   * Processes product data to include default images and sizes
   */
  useEffect(() => {
    const fetchNewCollection = async () => {
      try {
        // API call to get new arrival products
        const res = await axios.get(
          "https://web-production-2449.up.railway.app/api/products/?is_new=true"
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

          // Set default size (first available in stock or first size)
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
        setNewCollection(productsWithData);
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
        console.error("Failed to load new collection", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchNewCollection();
  }, []);

  /**
   * Intersection Observer callback for infinite scroll
   * Triggers when the last product element comes into view
   */
  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1); // Load next page
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  /**
   * Handles size selection change for a product
   * @param {number} productId - The ID of the product
   * @param {number} sizeId - The ID of the selected size
   */
  const handleSizeChange = (productId, sizeId) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: parseInt(sizeId),
    }));
  };

  /**
   * Adds a product to the shopping cart
   * @param {number} productId - The ID of the product to add
   */
  const addToCart = async (productId) => {
    const selectedSizeId = parseInt(selectedSizes[productId]);
    if (!selectedSizeId) {
      showNotification("Please select a size", "error");
      return;
    }

    // Find the product in the collection
    const product = newCollection.find((p) => p.id === productId);
    if (!product) {
      showNotification("Product not found", "error");
      return;
    }

    // Check stock for selected size
    const selectedSize = product.sizes?.find(
      (size) => size.size.id === selectedSizeId
    );

    if (!selectedSize || selectedSize.stock <= 0) {
      showNotification("Selected size is out of stock", "error");
      return;
    }

    try {
      setAddingToCartId(productId); // Set loading state for this product

      // Check authentication and get token
      const token = await checkAuthAndRedirect(navigate, location.pathname);
      if (!token) return;

      // Get default color (first available)
      const colorId =
        product.colors?.length > 0 ? product.colors[0].color.id : null;

      // API call to add to cart
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

      // Update cart count in header if function exists
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
      setAddingToCartId(null); // Reset loading state
    }
  };

  /**
   * Applies filters to the product collection
   * @param {Object} filters - Filter criteria
   * @param {number} filters.size - Size ID to filter by
   * @param {number} filters.color - Color ID to filter by
   * @param {string} filters.sort - Sorting method ('price_low' or 'price_high')
   */
  const applyFilters = ({ size, color, sort }) => {
    let filtered = [...newCollection];

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

    // Apply sorting if specified
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
  if (loading) return <div className="loading">Loading new collection...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <div className="new-collection-page-container">
        <h1 className="new-collection">New Collection</h1>

        {/* Notification component for displaying messages */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="new-collection-content">
          {/* Filters sidebar */}
          <div className="filters-sidebar">
            <Filters products={newCollection} onApply={applyFilters} />
          </div>

          {/* Product grid */}
          <div className="products-grid-container">
            <div className="new-collection-grid">
              {filteredProducts.map((item, index) => (
                <div
                  className="new-collection-card"
                  key={item.id}
                  ref={
                    index === filteredProducts.length - 1
                      ? lastProductRef
                      : null
                  }
                >
                  {/* Product image with link to product page */}
                  <a className="cursor" onClick={() => {
                        navigate(`/product/${item.id}/`);
                        window.location.reload();
                      }}>
                    <div className="new-collection-image-container">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="new-collection-image"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                      <span className="new-collection-badge">New Arrival</span>
                    </div>
                  </a>

                  {/* Product info section */}
                  <div className="new-collection-info">
                    <h3 className="new-collection-title">
                      <Link
                        to={`/product/${item.id}/`}
                        className="new-collection-title-link"
                      >
                        {item.name}
                      </Link>
                    </h3>

                    {/* Price display */}
                    <div className="new-collection-price-wrapper d-flex justify-content-center">
                      <span className="new-collection-current-price">
                        ₹{item.currentprice}
                      </span>
                      {item.orignalprice &&
                        item.orignalprice > item.currentprice && (
                          <span className="new-collection-original-price">
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
                      className="new-collection-add-to-cart"
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

export default NewCollectionPage;
