import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../component/Header/Header";
import Footer from "../../component/Footer/Footer";
import Notification from "../../component/Notification/Notification";
import Filters from "../../component/Filters/Filters";
import { Link } from "react-router-dom";
import BackToTop from "../../component/BackToTop/BackToTop";

const BestSellerPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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

        // Set default selected size
        const initialSizes = {};
        withImages.forEach((product) => {
          const defaultSize = product.sizes?.find((s) => s.stock > 0)?.size || product.sizes?.[0]?.size;
          if (defaultSize) {
            initialSizes[product.id] = defaultSize.id;
          }
        });

        setProducts(withImages);
        setFilteredProducts(withImages);
        setSelectedSizes(initialSizes);
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

    // TODO: Replace with real cart API logic
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

              <div className="best-seller-info">
                <h3 className="best-seller-title">
                  <Link to={`/product/${product.id}/`} className="best-seller-title-link">
                    {product.name}
                  </Link>
                </h3>

                <div className="best-seller-price-wrapper">
                  <span className="best-seller-current-price">₹{product.currentprice}</span>
                  {product.orignalprice > product.currentprice && (
                    <span className="best-seller-original-price">
                      ₹{product.orignalprice}
                    </span>
                  )}
                </div>

                {product.sizes?.length > 0 && (
                  <div className="size-selector">
                    <select
                      className="size-dropdown"
                      value={selectedSizes[product.id] || ""}
                      onChange={(e) => handleSizeChange(product.id, e.target.value)}
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
                  className="add-to-cart-top"
                  onClick={() => handleAddToCart(product)}
                  disabled={!selectedSizes[product.id]}
                >
                  Add to Cart
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
