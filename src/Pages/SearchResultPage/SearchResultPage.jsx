import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SearchResultPage.css";
import Notification from "../../component/Notification/Notification";
import { FiSearch, FiX } from "react-icons/fi";
import { auth } from "../../firebase";
import BackToTop from "../../component/BackToTop/BackToTop";
import Filters from "../../component/Filters/Filters";

const SearchResults = () => {
  useEffect(() => {
    document.title = "Search Results | RS Clothing";
  }, []);

  const [searchKey, setSearchKey] = useState(0);
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

  useEffect(() => {
    const qParam = new URLSearchParams(location.search).get("q");
    if (qParam) {
      setSearchQuery(qParam);
      fetchSearchResults(qParam);
    } else {
      navigate("/");
    }
  }, [location.search, searchKey]);

  const fetchSearchResults = async (searchTerm) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://web-production-27d40.up.railway.app/api/products/enhanced-search/`,
        { params: { q: searchTerm } }
      );

      const productsWithData = res.data.results.map((product) => {
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

        const firstAvailableSize =
          product.sizes?.find((size) => size.stock > 0)?.size ||
          product.sizes?.[0]?.size;

        return {
          ...product,
          image: imageUrl,
          defaultSize: firstAvailableSize,
        };
      });

      setProducts(productsWithData);
      setFilteredProducts(productsWithData);

      const initialSizes = {};
      productsWithData.forEach((product) => {
        if (product.defaultSize) {
          initialSizes[product.id] = product.defaultSize.id;
        }
      });
      setSelectedSizes(initialSizes);
      setError(null);
    } catch (err) {
      console.error("Failed to load products", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addToCart = async (productId) => {
    try {
      setAddingToCartId(productId);
      const selectedSizeId = selectedSizes[productId];
      
      if (!selectedSizeId) {
        showNotification("Please select a size", "error");
        return;
      }

      const product = products.find((p) => p.id === productId);
      if (!product) {
        showNotification("Product not found", "error");
        return;
      }

      const sizeObj = product.sizes?.find((s) => s.size.id === selectedSizeId);
      if (!sizeObj || sizeObj.stock <= 0) {
        showNotification("Selected size is out of stock", "error");
        return;
      }

      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        showNotification("Please login to add items to cart", "error");
        navigate("/login", { state: { from: location.pathname } });
        return;
      }

      const colorId = product.colors?.[0]?.color?.id || null;
      const response = await fetch(
        `https://web-production-27d40.up.railway.app/api/cart/add/${productId}/`,
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

      showNotification(`${product.name} added to cart successfully!`);
      if (typeof window.updateCartCount === "function") {
        window.updateCartCount();
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      showNotification(
        error.message || "Failed to add product. Please try again.",
        "error"
      );
    } finally {
      setAddingToCartId(null);
    }
  };

  // ... (keep other existing functions like handleSizeChange, applyFilters, etc.)

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <div className="all-products-page-container">
        <div className="search-header-container">
          <div className="container">
            <div className="search-header">
              <h1 className="all-products-title">
                {products.length > 0
                  ? `Results for "${searchQuery}"`
                  : "Search"}
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
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(s)}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="all-products-content">
          <div className="filters-sidebar">
            <Filters products={products} onApply={applyFilters} />
          </div>

          <div className="products-grid-container">
            {filteredProducts.length > 0 ? (
              <>
                <div className="results-count">
                  Found {filteredProducts.length} item(s)
                </div>
                <div className="products-grid">
                  {filteredProducts.map((item) => (
                    <div className="product-card" key={item.id}>
                      <a
                        className="cursor"
                        onClick={() => {
                          navigate(`/product/${item.id}/`);
                          window.location.reload();
                        }}
                      >
                        <div className="product-image-container">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="product-image"
                            onError={(e) => {
                              e.target.src = "/placeholder-product.jpg";
                            }}
                          />
                        </div>
                      </a>
                      <div className="product-info w-100 text-center">
                        <h3 className="product-title">
                          <Link
                            to={`/product/${item.id}/`}
                            className="product-title-link"
                          >
                            {item.name}
                          </Link>
                        </h3>
                        <div className="product-price-wrapper">
                          <span className="product-current-price">
                            ₹{item.currentprice}
                          </span>
                          {item.orignalprice &&
                            item.orignalprice > item.currentprice && (
                              <span className="product-original-price">
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
                                  {size.name} {stock <= 0 ? "(Out of Stock)" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <button
                          className="add-to-cart-btn"
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
              </>
            ) : (
              <div className="no-results">
                <img
                  src="/no-results.svg"
                  alt="No results"
                  className="no-results-img"
                />
                <h3>No products found</h3>
                <p>We couldn't find anything for "{searchQuery}"</p>
                <button
                  onClick={() => navigate("/")}
                  className="continue-shopping-btn"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <BackToTop />
    </>
  );
};

export default SearchResults;