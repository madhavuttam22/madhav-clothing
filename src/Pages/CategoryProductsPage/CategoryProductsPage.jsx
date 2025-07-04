import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../../component/Header/Header";
import Footer from "../../component/Footer/Footer";
import Notification from "../../component/Notification/Notification";
import ProductFilters from "../../component/ProductFilters/ProductFilters";
import { auth } from "../../firebase";
import checkAuthAndRedirect from "../../utils/checkAuthAndRedirect";
import BackToTop from "../../component/BackToTop/BackToTop";
import "./CategoryProductsPage.css";

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
  const navigate = useNavigate();
  const location = useLocation();

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const params = {};
        
        // Get filter params from URL
        if (searchParams.get('min_price')) params.min_price = searchParams.get('min_price');
        if (searchParams.get('max_price')) params.max_price = searchParams.get('max_price');
        if (searchParams.getAll('colors[]').length) params.colors = searchParams.getAll('colors[]');
        if (searchParams.getAll('sizes[]').length) params.sizes = searchParams.getAll('sizes[]');
        if (searchParams.get('availability')) params.availability = searchParams.get('availability');

        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(
            `https://ecco-back-4j3f.onrender.com/api/categories/${category_id}/products/`,
            { params }
          ),
          axios.get("https://ecco-back-4j3f.onrender.com/api/categories/"),
        ]);

        const category = categoriesRes.data.find(
          (cat) => cat.id === parseInt(category_id)
        );

        if (!category) {
          setError("Category not found");
          setLoading(false);
          return;
        }

        const productsWithImagesAndSizes = productsRes.data.map((product) => {
          let imageUrl = "/placeholder-product.jpg";

          if (product.colors?.length > 0) {
            const firstColor = product.colors[0];
            if (firstColor.images?.length > 0) {
              const defaultImage = firstColor.images.find(
                (img) => img.is_default
              );
              const imagePath =
                defaultImage?.image_url || firstColor.images[0].image_url;
              imageUrl = `https://ecco-back-4j3f.onrender.com${imagePath}`;
            }
          }

          // Find first available size or default to first size
          const firstAvailableSize =
            product.sizes?.find((size) => size.stock > 0)?.size ||
            product.sizes?.[0]?.size;

          return {
            ...product,
            image: imageUrl,
            defaultSize: firstAvailableSize,
          };
        });

        setProducts(productsWithImagesAndSizes);
        setFilteredProducts(productsWithImagesAndSizes);
        setCategory(category);

        // Initialize selected sizes
        const initialSizes = {};
        productsWithImagesAndSizes.forEach((product) => {
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
  }, [category_id, location.search]);

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

      showNotification(
        data.message || `${product.name} added to cart successfully!`
      );

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

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <Header />
      <div className="category-page-container">
        <div className="category-content">
          {/* Filters Sidebar */}
          <div className="filters-sidebar">
            <ProductFilters categoryId={category_id} />
          </div>
          
          {/* Products Grid */}
          <div className="products-grid-container">
            <h1 className="category-title">{category?.category || "Category"}</h1>

            {notification && (
              <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(null)}
              />
            )}

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
                          console.error("Failed to load image:", product.image);
                          e.target.src = "/placeholder-product.jpg";
                          e.target.onerror = null;
                        }}
                      />
                      {product.is_best_seller && (
                        <span className="product-badge">Best Seller</span>
                      )}
                      {product.is_top_product && (
                        <span className="product-badge top-product">
                          Top Product
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="product-info">
                    <h3 className="product-title">
                      <Link
                        to={`/product/${product.id}/`}
                        className="product-title-link"
                      >
                        {product.name}
                      </Link>
                    </h3>
                    <div className="product-price-wrapper">
                      <span className="product-current-price">
                        ₹{product.currentprice}
                      </span>
                      {product.orignalprice &&
                        product.orignalprice > product.currentprice && (
                          <span className="product-original-price">
                            ₹{product.orignalprice}
                          </span>
                        )}
                    </div>

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

                    <button
                      className="product-add-to-cart"
                      onClick={() => addToCart(product.id)}
                      disabled={
                        addingToCartId === product.id || !selectedSizes[product.id]
                      }
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
      <BackToTop/>
    </>
  );
};

export default CategoryProductsPage;