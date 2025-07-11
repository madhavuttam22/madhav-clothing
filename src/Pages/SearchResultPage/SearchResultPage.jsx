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

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
  const suggestionsRef = useRef(null);

  const query = new URLSearchParams(location.search).get("q");

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      fetchEnhancedSearchResults(query);
    } else {
      navigate("/");
    }
  }, [query, navigate]);

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

  const fetchEnhancedSearchResults = async (searchTerm) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://web-production-2449.up.railway.app/api/products/enhanced-search/`,
        { params: { q: searchTerm } }
      );

      const productsWithImagesAndSizes = response.data.results.map(
        (product) => {
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

      setProducts(productsWithImagesAndSizes);
      setFilteredProducts(productsWithImagesAndSizes);
      setError(null);

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

  const applyFilters = ({ size, color, sort }) => {
    let filtered = [...products];

    if (size) {
      filtered = filtered.filter((product) =>
        product.sizes?.some((s) => s.size.id === parseInt(size))
      );
    }

    if (color) {
      filtered = filtered.filter((product) =>
        product.colors?.some((c) => c.color.id === parseInt(color))
      );
    }

    if (sort === "price_low") {
      filtered.sort((a, b) => a.currentprice - b.currentprice);
    } else if (sort === "price_high") {
      filtered.sort((a, b) => b.currentprice - a.currentprice);
    }

    setFilteredProducts(filtered);
  };

  const handleSizeChange = (productId, sizeId) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: parseInt(sizeId),
    }));
  };

  const addToCart = async (productId) => {
    try {
      setAddingToCartId(productId);
      const selectedSizeId = parseInt(selectedSizes[productId]);

      if (!selectedSizeId) {
        showNotification("Please select a size", "error");
        return;
      }

      const product = products.find((p) => p.id === productId);
      if (!product) {
        showNotification("Product not found", "error");
        return;
      }

      const selectedSize = product.sizes?.find(
        (size) => size.size.id === selectedSizeId
      );

      if (!selectedSize || selectedSize.stock <= 0) {
        showNotification("Selected size is out of stock", "error");
        return;
      }

      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        showNotification("You need to log in first", "error");
        navigate("/login", { state: { from: location.pathname } });
        return;
      }

      const colorId = product.colors?.[0]?.color?.id || null;

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 1) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

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

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Searching for products...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Try Again
        </button>
      </div>
    );

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
            {notification && (
              <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(null)}
              />
            )}

            <div className="search-results-layout">
              <div className="filters-sidebar">
                <Filters products={products} onApply={applyFilters} />
              </div>

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
