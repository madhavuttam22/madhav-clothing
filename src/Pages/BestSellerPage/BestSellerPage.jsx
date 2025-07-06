import React, { useEffect, useState } from "react";
import Header from "../../component/Header/Header";
import Footer from "../../component/Footer/Footer";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Notification from "../../component/Notification/Notification";
import Filters from "../../component/Filters/Filters";
import { auth } from "../../firebase";
import checkAuthAndRedirect from "../../utils/checkAuthAndRedirect";
import BackToTop from "../../component/BackToTop/BackToTop";

const BestSellerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bestSellers, setBestSellers] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await axios.get(
          "https://ecco-back-4j3f.onrender.com/api/products/?is_best=true"
        );

        const productsWithData = res.data.map((product) => {
          let imageUrl = "/placeholder-product.jpg";
          if (product.colors?.length > 0) {
            const firstColor = product.colors[0];
            const defaultImage = firstColor.images.find((img) => img.is_default);
            imageUrl =
              defaultImage?.image_url || firstColor.images?.[0]?.image_url || imageUrl;
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

        setBestSellers(productsWithData);
        setFilteredProducts(productsWithData);

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

    const product = bestSellers.find((p) => p.id === productId);
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
        error.message || "Failed to add product. Please try again.",
        "error"
      );
    } finally {
      setAddingToCartId(null);
    }
  };

  const applyFilters = ({ size, color, sort }) => {
    let filtered = [...bestSellers];

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

  if (loading) return <div className="loading">Loading best sellers...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <Header />
      <h1 className="bestseller">Best Seller</h1>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <Filters products={bestSellers} onApply={applyFilters} />

      <div className="best-seller-container">
        <div className="best-seller-cards">
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
                  <span className="best-seller-badge">Best Seller</span>
                </div>
              </Link>
              <div className="best-seller-info">
                <h3 className="best-seller-title">
                  <Link to={`/product/${item.id}/`} className="best-seller-title-link">
                    {item.name}
                  </Link>
                </h3>
                <div className="best-seller-price-wrapper">
                  <span className="best-seller-current-price">₹{item.currentprice}</span>
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
                  className="best-seller-add-to-cart"
                  onClick={() => addToCart(item.id)}
                  disabled={addingToCartId === item.id || !selectedSizes[item.id]}
                >
                  {addingToCartId === item.id ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
      <BackToTop />
    </>
  );
};

export default BestSellerPage;
