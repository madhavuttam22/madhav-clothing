import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../../component/Header/Header";
import Footer from "../../component/Footer/Footer";
import Notification from "../../component/Notification/Notification";
import BackToTop from "../../component/BackToTop/BackToTop";
import Filters from "../../component/Filters/Filters";
import { auth } from "../../firebase";
import checkAuthAndRedirect from "../../utils/checkAuthAndRedirect";
import "./CategoryProductsPage.css";

/**
 * CategoryProductsPage Component
 *
 * Displays products belonging to a specific category with filtering and pagination capabilities.
 * Handles product display, size selection, adding to cart, and responsive layout.
 */
const CategoryProductsPage = () => {
  useEffect(() => {
    document.title = "CategoryProductsPage | Madhav Clothing";
  }, []);
  // Get category ID from URL parameters
  const { category_id } = useParams();

  // State management for products, loading, errors, etc.
  const [products, setProducts] = useState([]); // All products in the category
  const [filteredProducts, setFilteredProducts] = useState([]); // Products after filters applied
  const [category, setCategory] = useState(null); // Current category details
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [addingToCartId, setAddingToCartId] = useState(null); // Track which product is being added to cart
  const [notification, setNotification] = useState(null); // Notification messages
  const [selectedSizes, setSelectedSizes] = useState({}); // Track selected sizes for each product
  const [page, setPage] = useState(1); // Current page for infinite scroll
  const [hasMore, setHasMore] = useState(true); // Flag for more products available

  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Intersection Observer ref for infinite scroll
  const observer = useRef();

  /**
   * Display a notification message
   * @param {string} message - The notification message to display
   * @param {string} type - The type of notification ('success' or 'error')
   */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /**
   * Fetch products for the current category when component mounts or category_id changes
   */
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        // Fetch both products and categories in parallel
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(
            `https://backend-u3he.onrender.com/api/categories/${category_id}/products/`
          ),
          axios.get("https://backend-u3he.onrender.com/api/categories/"),
        ]);

        // Find the current category from the categories list
        const category = categoriesRes.data.find(
          (cat) => cat.id === parseInt(category_id)
        );

        if (!category) {
          setError("Category not found");
          setLoading(false);
          return;
        }

        // Process products to include default images and sizes
        const productsWithDetails = productsRes.data.map((product) => {
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

          // Set default size (first available or first in list)
          const firstAvailableSize =
            product.sizes?.find((size) => size.stock > 0)?.size ||
            product.sizes?.[0]?.size;

          return {
            ...product,
            image: imageUrl,
            defaultSize: firstAvailableSize,
          };
        });

        // Update state with fetched data
        setProducts(productsWithDetails);
        setFilteredProducts(productsWithDetails);
        setCategory(category);

        // Initialize selected sizes for each product
        const initialSizes = {};
        productsWithDetails.forEach((product) => {
          if (product.defaultSize) {
            initialSizes[product.id] = product.defaultSize.id;
          }
        });
        setSelectedSizes(initialSizes);
      } catch (err) {
        console.error("Failed to load category products", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [category_id]);

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
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  /**
   * Handle size selection change for a product
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
   * Add a product to the user's cart
   * @param {number} productId - ID of the product to add
   */
  const addToCart = async (productId) => {
    try {
      const selectedSizeId = parseInt(selectedSizes[productId]);

      // Validate size selection
      if (!selectedSizeId) {
        showNotification("Please select a size", "error");
        return;
      }

      // Find the product in state
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

      // Set loading state for this product
      setAddingToCartId(productId);

      // Check authentication and get token
      const token = await checkAuthAndRedirect(navigate, location.pathname);
      if (!token) return;

      // Use first available color (or null if none)
      const colorId =
        product.colors?.length > 0 ? product.colors[0].color.id : null;

      // Make API call to add to cart
      const response = await fetch(
        `https://backend-u3he.onrender.com/api/cart/add/${productId}/`,
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
        error.message || "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      setAddingToCartId(null);
    }
  };

  /**
   * Apply filters to products based on size, color, and sort options
   * @param {object} filters - Filter options
   * @param {number} filters.size - Size ID to filter by
   * @param {number} filters.color - Color ID to filter by
   * @param {string} filters.sort - Sort option ('price_low' or 'price_high')
   */
  const applyFilters = ({ size, color, sort }) => {
    let filtered = [...products];

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
  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <div className="category-page-container">
        <h1 className="category-title">{category?.category || "Category"}</h1>

        {/* Notification component for displaying messages */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="category-content">
          {/* Filters sidebar */}
          <div className="filters-sidebar">
            <Filters products={products} onApply={applyFilters} />
          </div>

          {/* Products grid */}
          <div className="products-grid-container">
            <div className="category-grid">
              {filteredProducts.map((product, index) => (
                <div
                  className="category-card"
                  key={product.id}
                  // Attach intersection observer to last product for infinite scroll
                  ref={
                    index === filteredProducts.length - 1
                      ? lastProductRef
                      : null
                  }
                >
                  {/* Product image with link to product page */}
                  <a
                    className="cursor"
                    onClick={() => {
                      navigate(`/product/${item.id}/`);
                      window.location.reload();
                    }}
                  >
                    <div className="category-image-container">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="category-image"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                          e.target.onerror = null;
                        }}
                      />
                      {/* Display badges for special products */}
                      {product.is_best_seller && (
                        <span className="category-badge">Best Seller</span>
                      )}
                      {product.is_top_product && (
                        <span className="category-badge top-product">
                          Top Product
                        </span>
                      )}
                    </div>
                  </a>

                  {/* Product information */}
                  <div className="category-info">
                    <h3 className="category-product-title">
                      <Link
                        to={`/product/${product.id}/`}
                        className="category-title-link"
                      >
                        {product.name}
                      </Link>
                    </h3>

                    {/* Price display */}
                    <div className="category-price-wrapper d-flex justify-content-center">
                      <span className="category-current-price">
                        ₹{product.currentprice}
                      </span>
                      {product.orignalprice > product.currentprice && (
                        <span className="category-original-price">
                          ₹{product.orignalprice}
                        </span>
                      )}
                    </div>

                    {/* Size selector dropdown */}
                    {product.sizes?.length > 0 && (
                      <div className="size-selector">
                        <select
                          value={selectedSizes[product.id] || ""}
                          onChange={(e) =>
                            handleSizeChange(product.id, e.target.value)
                          }
                          className="size-dropdown"
                        >
                          {product.sizes.map(({ size, stock }) => (
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
                      className="category-add-to-cart"
                      onClick={() => addToCart(product.id)}
                      disabled={
                        addingToCartId === product.id ||
                        !selectedSizes[product.id]
                      }
                    >
                      {addingToCartId === product.id
                        ? "Adding..."
                        : "Add to Cart"}
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

export default CategoryProductsPage;
