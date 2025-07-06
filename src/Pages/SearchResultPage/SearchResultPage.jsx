// SearchResults.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, Link } from "react-router-dom";
import Header from "../../component/Header/Header";
import Footer from "../../component/Footer/Footer";
import Filters from "../../component/Filters/Filters";
import BackToTop from "../../component/BackToTop/BackToTop";
import "./SearchResultPage.css";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const res = await axios.get(
          `https://ecco-back-4j3f.onrender.com/api/products/enhanced-search/?q=${query}`
        );

        const withImages = res.data.results.map((product) => {
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
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  if (loading) return <div className="loading">Searching...</div>;

  return (
    <>
      <Header />
      <div className="category-products-container">
        <h1 className="category-title">Search Results for: "{query}"</h1>

        <Filters
          allProducts={products}
          onFilterChange={(filtered) => setFilteredProducts(filtered)}
        />

        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <p>No results found</p>
          ) : (
            filteredProducts.map((product) => (
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
                    <span className="product-current-price">
                      ₹{product.currentprice}
                    </span>
                    {product.orignalprice > product.currentprice && (
                      <span className="product-original-price">
                        ₹{product.orignalprice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
      <BackToTop />
    </>
  );
};

export default SearchResults;
