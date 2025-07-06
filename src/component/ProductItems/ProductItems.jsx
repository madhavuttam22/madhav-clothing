import React, { useState, useEffect } from "react";
import "./ProductItems.css";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Notification from "../Notification/Notification";
import { auth } from "../../firebase";
import checkAuthAndRedirect from "../../utils/checkAuthAndRedirect";

const ProductItems = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedColors, setSelectedColors] = useState({});
  const from = location.state?.from || "/";

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSizeChange = (productId, sizeId) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: sizeId,
    }));
  };

  const addToCart = async (productId) => {
    const sizeId = selectedSizes[productId];
    const colorId = selectedColors[productId];

    if (!sizeId) {
      showNotification("Please select a size before adding to cart", "error");
      return;
    }

    try {
      setAddingToCartId(productId);
      const token = await checkAuthAndRedirect(navigate, location.pathname);
      if (!token) return; // User not logged in, redirected

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

      showNotification(data.message || "Item added to cart successfully!");
      if (typeof window.updateCartCount === "function") {
        window.updateCartCount();
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      showNotification("Something went wrong. Please try again.", "error");
    } finally {
      setAddingToCartId(null);
    }
  };

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const res = await axios.get(
          "https://ecco-back-4j3f.onrender.com/api/products/?is_top=true"
        );

        const productsWithDetails = res.data.map((product) => {
          const firstAvailableSize =
            product.sizes?.find((size) => size.stock > 0)?.size ||
            product.sizes?.[0]?.size;

          let imageUrl = "/placeholder-product.jpg";
          if (product.colors?.length > 0) {
            const firstColor = product.colors[0];
            if (firstColor.images?.length > 0) {
              const defaultImage = firstColor.images.find(
                (img) => img.is_default
              );
              imageUrl =
                defaultImage?.image_url || firstColor.images[0].image_url || imageUrl;
            }
          }

          return {
            ...product,
            defaultSize: firstAvailableSize,
            image: imageUrl,
          };
        });

        setTopProducts(productsWithDetails);

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

  if (loading) return <div className="loading">Loading top products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <h1 className="top-products-title">Top Products</h1>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="top-products-grid">
        {topProducts.map((item) => (
          <div className="top-product-card" key={item.id}>
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
            <div className="top-product-info">
              <h3 className="top-product-title text-center">
                <Link to={`/product/${item.id}/`} className="top-product-title-link">
                  {item.name}
                </Link>
              </h3>
              <div className="top-product-price-wrapper">
                <span className="top-product-current-price">₹{item.currentprice}</span>
                {item.orignalprice && item.orignalprice > item.currentprice && (
                  <span className="top-product-original-price">
                    ₹{item.orignalprice}
                  </span>
                )}
              </div>

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