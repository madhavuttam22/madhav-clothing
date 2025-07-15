import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Notification from "../../component/Notification/Notification";
import Filters from "../../component/Filters/Filters";
import { auth } from "../../firebase";
import checkAuthAndRedirect from "../../utils/checkAuthAndRedirect";
import BackToTop from "../../component/BackToTop/BackToTop";
import "./AllProductsPage.css";

const AllProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get(
          "https://web-production-2449.up.railway.app/api/products/"
        );

        const productsWithData = res.data.map((product) => {
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

        setAllProducts(productsWithData);
        setFilteredProducts(productsWithData);

        const initialSizes = {};
        productsWithData.forEach((product) => {
          if (product.defaultSize) {
            initialSizes[product.id] = product.defaultSize.id;
          }
        });
        setSelectedSizes(initialSizes);
      } catch (err) {
        console.error("Failed to load products", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

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

  const handleSizeChange = (productId, sizeId) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: parseInt(sizeId),
    }));
  };

  const addToCart = async (productId) => {
    const selectedSizeId = parseInt(selectedSizes[productId]);
    if (!selectedSizeId) {
      showNotification("Please select a size", "error");
      return;
    }

    const product = allProducts.find((p) => p.id === productId);
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

    try {
      setAddingToCartId(productId);
      const token = await checkAuthAndRedirect(navigate, location.pathname);
      if (!token) return;

      const colorId =
        product.colors?.length > 0 ? product.colors[0].color.id : null;

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

  const applyFilters = ({ size, color, sort }) => {
    let filtered = [...allProducts];

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
      <div className="all-products-page-container">
        <h1 className="all-products-title">All Products</h1>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="all-products-content">
          <div className="filters-sidebar">
            <Filters products={allProducts} onApply={applyFilters} />
          </div>

          <div className="products-grid-container">
            <div className="products-grid">
              {filteredProducts.map((item, index) => (
                <div
                  className="product-card"
                  key={item.id}
                  ref={
                    index === filteredProducts.length - 1
                      ? lastProductRef
                      : null
                  }
                >
                  <Link to={`/product/${item.id}/`}>
                    <div className="product-image-container">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                      {item.is_best_seller && (
                        <span className="product-badge best-seller">
                          Best Seller
                        </span>
                      )}
                      {item.is_top_product && (
                        <span className="product-badge top-product">
                          Top Product
                        </span>
                      )}
                    </div>
                  </Link>
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
          </div>
        </div>
      </div>
      <BackToTop />
    </>
  );
};

export default AllProductsPage;