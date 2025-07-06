import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../component/Header/Header";
import Footer from "../../component/Footer/Footer";
import Notification from "../../component/Notification/Notification";
import Filters from "../../component/Filters/Filters";
import { Link } from "react-router-dom";
import BackToTop from "../../component/BackToTop/BackToTop";
import "./BestSellerPage.css"; // Optional, if you want to style cards

const BestSellerPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({}); // Track selected size per product

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

        const withImages = res.data.map((product) => {
          let imageUrl = "/placeholder-product.jpg";

          if (product.colors?.length > 0) {
            const firstColor = product.colors[0];
            const defaultImage = firstColor.images.find((img) => img.is_default);
            imageUrl =
              defaultImage?.image_url || firstColor.images?.[0]?.image_url || imageUrl;
          }

          return { ...product, image: imageUrl };
        });

        setProducts(withImages);
        setFilteredProducts(withImages);
      } catch (error) {
        console.error("Error loading best sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

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

  const handleSizeChange = (productId, selectedSizeId) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: selectedSizeId,
    }));
  };

  const handleAddToCart = (product) => {
    const selectedSize = selectedSizes[product.id];
    if (!selectedSize) {
      showNotification("Please select a size!", "error");
      return;
    }

    // TODO: Integrate with your cart logic here
    console.log("Adding to cart:", {
      productId: product.id,
      sizeId: selectedSize,
    });

    showNotification("Item added to cart!");
  };

  if (loading) return <div className="loading">Loading Best Sellers...</div>;

  return (
    <>
      <Header />
      <div className="category-products-container">
        <h1 className="category-title">Best Sellers</h1>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <Filters products={products} onApply={applyFilters} />

        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <Link to={`/product/${product.id}/`}>
                <div className="product-image-container">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = "/placeholder-product.jpg";
                      e.target.onerror = null;
                    }}
                  />
                </div>
              </Link>

              <div className="product-info-1">
                <h3 className="product-title">
                  <Link to={`/product/${product.id}/`} className="product-title-link">
                    {product.name}
                  </Link>
                </h3>

                <div className="product-price-wrapper">
                  <span className="product-current-price">₹{product.currentprice}</span>
                  {product.orignalprice > product.currentprice && (
                    <span className="product-original-price">
                      ₹{product.orignalprice}
                    </span>
                  )}
                </div>

                <div className="product-actions">
                  <select
                    value={selectedSizes[product.id] || ""}
                    onChange={(e) => handleSizeChange(product.id, e.target.value)}
                  >
                    <option value="">Select Size</option>
                    {product.sizes?.map((s) => (
                      <option key={s.size.id} value={s.size.id}>
                        {s.size.name}
                      </option>
                    ))}
                  </select>

                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
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
