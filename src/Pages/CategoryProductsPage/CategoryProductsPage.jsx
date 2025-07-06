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
import './CategoryProductsPage.css';

const CategoryProductsPage = () => {
  const { category_id } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const observer = useRef();

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`https://ecco-back-4j3f.onrender.com/api/categories/${category_id}/products/`),
          axios.get("https://ecco-back-4j3f.onrender.com/api/categories/"),
        ]);

        const category = categoriesRes.data.find(cat => cat.id === parseInt(category_id));

        if (!category) {
          setError("Category not found");
          setLoading(false);
          return;
        }

        const productsWithDetails = productsRes.data.map((product) => {
          let imageUrl = "/placeholder-product.jpg";

          if (product.colors?.length > 0) {
            const firstColor = product.colors[0];
            const defaultImage = firstColor.images.find((img) => img.is_default);
            imageUrl = defaultImage?.image_url || firstColor.images?.[0]?.image_url || imageUrl;
          }

          const firstAvailableSize = product.sizes?.find((size) => size.stock > 0)?.size || product.sizes?.[0]?.size;

          return {
            ...product,
            image: imageUrl,
            defaultSize: firstAvailableSize,
          };
        });

        setProducts(productsWithDetails);
        setFilteredProducts(productsWithDetails);
        setCategory(category);

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

  const lastProductRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const handleSizeChange = (productId, sizeId) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: parseInt(sizeId),
    }));
  };

  const addToCart = async (productId) => {
    try {
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

      setAddingToCartId(productId);
      const token = await checkAuthAndRedirect(navigate, location.pathname);
      if (!token) return;

      const colorId = product.colors?.length > 0 ? product.colors[0].color.id : null;

      const response = await fetch(
        `https://ecco-back-4j3f.onrender.com/api/cart/add/${productId}/`,
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

      showNotification(data.message || `${product.name} added to cart successfully!`);

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
    setPage(1);
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <Header />
      <div className="category-page-container">
        <h1 className="category-title">{category?.category || "Category"}</h1>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="category-content">
          <div className="filters-sidebar">
            <Filters products={products} onApply={applyFilters} />
          </div>
          
          <div className="products-grid-container">
            <div className="category-grid">
              {filteredProducts.map((product, index) => (
                <div 
                  className="category-card" 
                  key={product.id}
                  ref={index === filteredProducts.length - 1 ? lastProductRef : null}
                >
                  <Link to={`/product/${product.id}/`}>
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
                      {product.is_best_seller && (
                        <span className="category-badge">Best Seller</span>
                      )}
                      {product.is_top_product && (
                        <span className="category-badge top-product">Top Product</span>
                      )}
                    </div>
                  </Link>
                  <div className="category-info">
                    <h3 className="category-product-title">
                      <Link to={`/product/${product.id}/`} className="category-title-link">
                        {product.name}
                      </Link>
                    </h3>
                    <div className="category-price-wrapper">
                      <span className="category-current-price">₹{product.currentprice}</span>
                      {product.orignalprice > product.currentprice && (
                        <span className="category-original-price">
                          ₹{product.orignalprice}
                        </span>
                      )}
                    </div>

                    {product.sizes?.length > 0 && (
                      <div className="size-selector">
                        <select
                          value={selectedSizes[product.id] || ""}
                          onChange={(e) => handleSizeChange(product.id, e.target.value)}
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

                    <button
                      className="category-add-to-cart"
                      onClick={() => addToCart(product.id)}
                      disabled={addingToCartId === product.id || !selectedSizes[product.id]}
                    >
                      {addingToCartId === product.id ? "Adding..." : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <BackToTop />
    </>
  );
};

export default CategoryProductsPage;