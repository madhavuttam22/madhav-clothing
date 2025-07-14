import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SearchResultPage.css";
import Header from "../../component/Header/Header";
import Footer from "../../component/Footer/Footer";
import Notification from "../../component/Notification/Notification";
import { FiSearch, FiX } from "react-icons/fi";
import { auth } from "../../firebase";
import BackToTop from "../../component/BackToTop/BackToTop";
import Filters from "../../component/Filters/Filters";

/**
 * SearchResults component displays search results based on the query parameter.
 * It includes search functionality, filters, product listing, and cart integration.
 */
const SearchResults = () => {
  // Hooks for routing and state management
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for products and UI
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState({});
  
  // Ref for handling clicks outside suggestions dropdown
  const suggestionsRef = useRef(null);

  // Get search query from URL parameters
  const query = new URLSearchParams(location.search).get("q");

  /**
   * Displays a notification message that automatically disappears after 3 seconds
   * @param {string} message - The notification message to display
   * @param {string} type - The type of notification ('success' or 'error')
   */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch search results when query changes
  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      fetchEnhancedSearchResults(query);
    } else {
      navigate("/");
    }
  }, [query, navigate]);

  // Fetch search suggestions when search query changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 1) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * Fetches enhanced search results from the API with product images and sizes
   * @param {string} searchTerm - The search term to query
   */
  const fetchEnhancedSearchResults = async (searchTerm) => {
    try {
      setLoading(true);
      // First try enhanced search endpoint
      const response = await axios.get(
        `https://web-production-2449.up.railway.app/api/products/enhanced-search/`,
        { params: { q: searchTerm } }
      );

      // Process products to include images and default sizes
      const productsWithImagesAndSizes = response.data.results.map(
        (product) => {
          // Set default image (fallback to placeholder if none available)
          let imageUrl = "/placeholder-product.jpg";

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

          // Find first available size or first size if none available
          const firstAvailableSize =
            product.sizes?.find((size) => size.stock > 0)?.size ||
            product.sizes?.[0]?.size;

          return {
            ...product,
            image: imageUrl,
            defaultSize: firstAvailableSize,
          };
        }
      );

      // Update state with processed products
      setProducts(productsWithImagesAndSizes);
      setFilteredProducts(productsWithImagesAndSizes);
      setError(null);

      // Initialize selected sizes for each product
      const initialSizes = {};
      productsWithImagesAndSizes.forEach((product) => {
        if (product.defaultSize) {
          initialSizes[product.id] = product.defaultSize.id;
        }
      });
      setSelectedSizes(initialSizes);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to load search results. Please try again.");
      
      // Fallback to basic search if enhanced search fails
      try {
        const basicResponse = await axios.get(
          `https://web-production-2449.up.railway.app/api/products/search/`,
          { params: { q: searchTerm } }
        );
        setProducts(basicResponse.data.results || []);
        setFilteredProducts(basicResponse.data.results || []);
      } catch (basicErr) {
        console.error("Basic search failed:", basicErr);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches search suggestions based on the current query
   * @param {string} query - The partial search query
   */
  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `https://web-production-2449.up.railway.app/api/search/suggestions/`,
        { params: { q: query } }
      );
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  /**
   * Applies filters to the product list based on user selection
   * @param {Object} filters - The filter criteria (size, color, sort)
   */
  const applyFilters = ({ size, color, sort }) => {
    let filtered = [...products];

    // Filter by size if selected
    if (size) {
      filtered = filtered.filter((product) =>
        product.sizes?.some((s) => s.size.id === parseInt(size))
      );
    }

    // Filter by color if selected
    if (color) {
      filtered = filtered.filter((product) =>
        product.colors?.some((c) => c.color.id === parseInt(color))
      );
    }

    // Sort products if sort option selected
    if (sort === "price_low") {
      filtered.sort((a, b) => a.currentprice - b.currentprice);
    } else if (sort === "price_high") {
      filtered.sort((a, b) => b.currentprice - a.currentprice);
    }

    // Update filtered products
    setFilteredProducts(filtered);
  };

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
   * Adds a product to the cart with the selected size
   * @param {number} productId - The ID of the product to add
   */
  const addToCart = async (productId) => {
    try {
      setAddingToCartId(productId);
      const selectedSizeId = parseInt(selectedSizes[productId]);

      // Validate size selection
      if (!selectedSizeId) {
        showNotification("Please select a size", "error");
        return;
      }

      // Find the product
      const product = products.find((p) => p.id === productId);
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

      // Get Firebase auth token
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        showNotification("You need to log in first", "error");
        navigate("/login", { state: { from: location.pathname } });
        return;
      }

      // Default to first color if available
      const colorId = product.colors?.[0]?.color?.id || null;

      // Add to cart API call
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
      showNotification(data.message || "Product added to cart successfully!");

      if (typeof window.updateCartCount === "function") {
        window.updateCartCount();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification(
        error.message || "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      setAddingToCartId(null);
    }
  };

  /**
   * Handles search form submission
   * @param {Event} e - The form submit event
   */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  /**
   * Handles clicking on a search suggestion
   * @param {string} suggestion - The selected suggestion
   */
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  /**
   * Handles search input changes and shows suggestions
   * @param {Event} e - The input change event
   */
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 1) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Loading state UI
  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Searching for products...</p>
      </div>
    );

  // Error state UI
  if (error)
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Try Again
        </button>
      </div>
    );

  // Main component render
  return (
    <>
      <Header />
      <div className="search-results-page">
        <div className="search-header-container">
          <div className="container">
            <div className="search-header">
              <h1>
                {products.length > 0 ? `Results for "${query}"` : "Search"}
              </h1>
              <form
                onSubmit={handleSearchSubmit}
                className="search-form"
                ref={suggestionsRef}
              >
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => {
                        setSearchQuery("");
                        setSuggestions([]);
                      }}
                    >
                      <FiX />
                    </button>
                  )}
                  <button type="submit" className="search-button">
                    <FiSearch size={20} />
                  </button>
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="suggestions-dropdown">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="search-results-content">
          <div className="container">
            {/* Notification component for displaying messages */}
            {notification && (
              <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(null)}
              />
            )}

            <div className="search-results-layout">
              {/* Filters sidebar */}
              <div className="filters-sidebar">
                <Filters products={products} onApply={applyFilters} />
              </div>

              {/* Products grid */}
              <div className="products-grid-container">
                {filteredProducts.length > 0 ? (
                  <>
                    <div className="results-count">
                      Found {filteredProducts.length}{" "}
                      {filteredProducts.length === 1 ? "item" : "items"}
                    </div>
                    <div className="best-seller-grid">
                      {filteredProducts.map((item) => (
                        <div className="best-seller-card" key={item.id}>
                          <Link to={`/product/${item.id}/`}>
                            <div className="best-seller-image-container">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="best-seller-image"
                                onError={(e) => {
                                  e.target.src = "/placeholder-product.jpg";
                                }}
                              />
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
                                      {size.name}{" "}
                                      {stock <= 0 ? "(Out of Stock)" : ""}
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
                                addingToCartId === item.id ||
                                !selectedSizes[item.id]
                              }
                            >
                              {addingToCartId === item.id
                                ? "Adding..."
                                : "Add to Cart"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  !loading && (
                    <div className="no-results">
                      <img
                        src="/no-results.svg"
                        alt="No results"
                        className="no-results-img"
                      />
                      <h3>No products found</h3>
                      <p>We couldn't find any items matching "{query}"</p>
                      <button
                        onClick={() => navigate("/")}
                        className="continue-shopping-btn"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <BackToTop />
    </>
  );
};

export default SearchResults;