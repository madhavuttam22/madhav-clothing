// BestSellerPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../component/Header/Header";
import Footer from "../../component/Footer/Footer";
import Notification from "../../component/Notification/Notification";
import Filters from "../../component/Filters/Filters";
import { Link } from "react-router-dom";
import BackToTop from "../../component/BackToTop/BackToTop";
import "./BestSellerPage.css";

const BestSellerPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

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

        <Filters
          allProducts={products}
          onFilterChange={(filtered) => setFilteredProducts(filtered)}
        />

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
