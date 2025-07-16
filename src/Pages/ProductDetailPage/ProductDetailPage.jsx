import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../../component/Header/Header";
import Footer from "../../component/Footer/Footer";
import "./ProductDetail.css";
import Notification from "../../component/Notification/Notification";
import { auth } from "../../firebase";

/**
 * ProductDetailPage Component
 *
 * Displays detailed information about a single product including:
 * - Product images gallery with thumbnail navigation
 * - Color and size selection options
 * - Price information
 * - Add to cart and buy now functionality
 * - Product description with toggle
 * - Social sharing options
 * - Size chart modal
 */
const ProductDetailPage = () => {
  // Get product ID from URL parameters
  const { id } = useParams();

  // Navigation and location hooks
  const navigate = useNavigate();
  const location = useLocation();

  // State for product selection options
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // State for UI toggles
  const [showDescription, setShowDescription] = useState(false);

  // State for product data and loading status
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for product images
  const [currentImages, setCurrentImages] = useState([]);
  const [mainImage, setMainImage] = useState("");

  // State for notifications
  const [notification, setNotification] = useState(null);

  // State for cart operations
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  /**
   * Displays a notification message
   * @param {string} message - The message to display
   * @param {string} type - The type of notification ('success' or 'error')
   */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /**
   * Shares product on WhatsApp
   * Opens WhatsApp with pre-filled message containing product name and URL
   */
  const shareOnWhatsApp = () => {
    const productUrl = window.location.href;
    const message = `Check out this product: ${product.name} - ${productUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  /**
   * Shares product on Facebook
   * Opens Facebook share dialog with product URL
   */
  const shareOnFacebook = () => {
    const productUrl = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      productUrl
    )}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  /**
   * Copies product URL to clipboard
   * Shows notification on success/error
   */
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        showNotification("Link copied to clipboard!", "success");
      })
      .catch(() => {
        showNotification("Failed to copy link", "error");
      });
  };

  /**
   * Adds selected product to cart
   * Validates size selection and user authentication before making API call
   */
  const addToCart = async () => {
    if (!selectedSize) {
      showNotification("Please select a size before adding to cart", "error");
      return;
    }

    try {
      setIsAddingToCart(true);
      const token = await auth.currentUser?.getIdToken();

      // Redirect to login if user not authenticated
      if (!token) {
        showNotification("You need to be logged in to add to cart", "error");
        navigate("/login", { state: { from: location.pathname } });
        return;
      }

      const sizeId = selectedSize.id;
      const colorId = selectedColor?.id || null;

      // API call to add product to cart
      const response = await fetch(
        `https://web-production-2449.up.railway.app/api/cart/add/${product.id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: quantity,
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

      showNotification(
        data.message ||
          `${product.name} (Size: ${selectedSize.name}) added to cart!`
      );

      // Update cart count in header if function exists
      if (window.updateCartCount) {
        window.updateCartCount();
      }
    } catch (error) {
      console.error("Cart Error:", {
        error: error.message,
        productId: product.id,
        sizeId: selectedSize.id,
      });

      // Handle different error cases
      const errorMessage = error.message.includes("Network Error")
        ? "Network error - please check your connection"
        : error.message || "Failed to update your cart. Please try again.";

      showNotification(errorMessage, "error");
    } finally {
      setIsAddingToCart(false);
    }
  };

  /**
   * Handles direct purchase (Buy Now)
   * Navigates to checkout page with product details
   */
  const handleBuyNow = async () => {
    if (!selectedSize) {
      showNotification("Please select a size", "error");
      return;
    }

    try {
      setIsAddingToCart(true);
      const user = auth.currentUser;

      // Redirect to login if user not authenticated
      if (!user) {
        showNotification("Please login to continue", "error");
        navigate("/login", { state: { from: location.pathname } });
        return;
      }

      // Navigate directly to checkout with product details
      navigate("/checkout", {
        state: {
          directPurchase: true,
          product: {
            ...product,
            selectedSize,
            selectedColor,
            quantity,
            price: product.currentprice,
            image: mainImage || "",
          },
        },
      });
    } catch (error) {
      console.error("Buy Now Error:", error);
      showNotification(
        error.message || "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Fetch product data on component mount
  // ✅ Fixed
useEffect(() => {
  const fetchProduct = async () => {
    setLoading(true); // Optional: reset loading state when switching product
    try {
      const response = await fetch(
        `https://web-production-2449.up.railway.app/api/products/${id}/`
      );
      if (!response.ok) throw new Error("Product not found");

      const data = await response.json();
      setProduct(data);

      // Default color and image
      if (data.colors?.length > 0) {
        const firstColor = data.colors[0];
        setSelectedColor(firstColor.color);
        updateColorImages(firstColor);
      }

      // Default size
      if (data.sizes?.length > 0) {
        const firstAvailableSize =
          data.sizes.find((size) => size.stock > 0)?.size ||
          data.sizes[0].size;
        setSelectedSize(firstAvailableSize);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
  window.scrollTo(0, 0);
}, [id]); // ✅ Depend on `id`


  /**
   * Updates the images displayed based on selected color
   * @param {object} colorData - The color data object containing images
   */
  const updateColorImages = (colorData) => {
    if (colorData?.images?.length > 0) {
      setCurrentImages(colorData.images);
      const defaultImage = colorData.images.find((img) => img.is_default);
      setMainImage(defaultImage?.image_url || colorData.images[0].image_url);
    } else {
      setCurrentImages([]);
      setMainImage("");
    }
  };

  /**
   * Handles color selection change
   * Updates images and resets size selection if needed
   * @param {object} colorData - The selected color data
   */
  const handleColorChange = (colorData) => {
    setSelectedColor(colorData.color);
    updateColorImages(colorData);

    // Reset size selection to first available size for new color
    const availableSizes = product.sizes.filter((size) => size.stock > 0);
    const sizeToSelect =
      availableSizes.find((size) => size.size.id === selectedSize?.id)?.size ||
      availableSizes[0]?.size;
    setSelectedSize(sizeToSelect);
  };

  /**
   * Changes the main displayed image
   * @param {object} img - The image object to display
   */
  const handleImageClick = (img) => {
    setMainImage(img.image_url);
  };

  /**
   * Adjusts product quantity
   * @param {number} amount - The amount to adjust (+1 or -1)
   */
  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  /**
   * Toggles product description visibility
   */
  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  // Display loading/error states if needed
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!product) return <div className="not-found">Product not found</div>;

  // Extract price information
  const currentPrice = product.currentprice;
  const originalPrice = product.orignalprice;

  return (
    <>
      <div className="product-detail-page">
        <div className="product-wrapper">
          {/* Product Gallery Section */}
          <div className="product-gallery">
            {currentImages.length > 0 ? (
              <>
                {/* Thumbnail Navigation */}
                <div className="gallery-thumbnails">
                  {currentImages.map((img, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${
                        mainImage === img.image_url ? "active" : ""
                      }`}
                      onClick={() => handleImageClick(img)}
                    >
                      <img
                        src={img.image_url}
                        alt={`${product.name} - ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Main Product Image */}
                <div className="main-image">
                  {mainImage ? (
                    <img src={mainImage} alt={product.name} />
                  ) : (
                    <div className="no-image-placeholder">
                      No image selected
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-images">
                No images available for this color
              </div>
            )}
          </div>

          {/* Product Information Section */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>

            {/* Price Display */}
            <div className="price-section">
              <span className="current-price">₹ {currentPrice}</span>
              {originalPrice && originalPrice !== currentPrice && (
                <span className="compare-price">₹ {originalPrice}</span>
              )}
            </div>

            {/* Color Selection */}
            {product.colors?.length > 0 ? (
              <div className="product-detail__color-selector">
                <label className="product-detail__color-label">Color:</label>
                <div className="product-detail__color-swatches-wrapper">
                  <div className="product-detail__color-swatches">
                    {product.colors.map((colorData) => (
                      <button
                        key={colorData.color.id}
                        className={`product-detail__color-swatch ${
                          selectedColor?.id === colorData.color.id
                            ? "product-detail__color-swatch--active"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            colorData.color.hex_code || "#F4C2C2",
                        }}
                        onClick={() => handleColorChange(colorData)}
                        aria-label={colorData.color.name}
                      />
                    ))}
                  </div>
                  {selectedColor && (
                    <div className="product-detail__selected-color">
                      Selected:{" "}
                      <span className="product-detail__selected-color-name">
                        {selectedColor.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="product-detail__no-colors">
                No color options available
              </div>
            )}

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="product-option">
                <label>
                  Size:
                  <a
                    href="#size-chart"
                    className="size-guide-link"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("size-chart").style.display =
                        "block";
                    }}
                  >
                    Size chart
                  </a>
                </label>
                <div className="size-selector">
                  <select
                    value={selectedSize?.id || ""}
                    onChange={(e) => {
                      const sizeId = e.target.value;
                      const size = product.sizes.find(
                        (s) => s.size.id === parseInt(sizeId)
                      )?.size;
                      setSelectedSize(size);
                    }}
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
              </div>
            )}

            {/* Quantity Selector */}
            <div className="product-option">
              <label style={{ fontWeight: 600 }}>Quantity:</label>
              <br />
              <div className="quantity-selector">
                <button onClick={() => handleQuantityChange(-1)}>-</button>
                <input type="text" value={quantity} readOnly />
                <button onClick={() => handleQuantityChange(1)}>+</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="add-to-cart"
                onClick={addToCart}
                disabled={isAddingToCart || !selectedSize}
              >
                {isAddingToCart ? (
                  "Adding..."
                ) : (
                  <>
                    <span>Add to cart</span>
                    <span className="separator">•</span>
                    <span>
                      ₹ {(product.currentprice * quantity).toFixed(2)}
                    </span>
                  </>
                )}
              </button>
              <button
                className="buy-now"
                onClick={handleBuyNow}
                disabled={isAddingToCart || !selectedSize}
              >
                Buy it now
              </button>
            </div>

            {/* Social Sharing Options */}
            <div className="sharing-section">
              <h4 className="sharing-title">Share this product:</h4>
              <div className="sharing-buttons">
                <button
                  className="share-button whatsapp"
                  onClick={shareOnWhatsApp}
                  aria-label="Share on WhatsApp"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                    />
                  </svg>
                  <span>WhatsApp</span>
                </button>

                <button
                  className="share-button facebook"
                  onClick={shareOnFacebook}
                  aria-label="Share on Facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"
                    />
                  </svg>
                  <span>Facebook</span>
                </button>

                <button
                  className="share-button copy-link"
                  onClick={copyToClipboard}
                  aria-label="Copy product link"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
                    />
                  </svg>
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

            {/* Product Description with Toggle */}
            <div className="product-description-toggle">
              <button
                className={`description-toggle-button ${
                  showDescription ? "open" : ""
                }`}
                onClick={toggleDescription}
              >
                Description{" "}
                <span className="text-right">
                  {showDescription ? "▲" : "▼"}
                </span>
              </button>
              {showDescription && (
                <div className="product-description-content">
                  <p>{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Modal (hidden by default) */}
      <div className="size-chart-modal" id="size-chart">
        <div className="modal-content">
          <h3>Size Guide</h3>
          <div className="size-chart-container">
            <table className="size-chart-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest (in inches)</th>
                  <th>Length (in inches)</th>
                  <th>Shoulder (in inches)</th>
                  <th>Sleeve (in inches)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>S</td>
                  <td>38</td>
                  <td>26</td>
                  <td>16</td>
                  <td>8.5</td>
                </tr>
                <tr>
                  <td>M</td>
                  <td>40</td>
                  <td>27</td>
                  <td>17</td>
                  <td>9</td>
                </tr>
                <tr>
                  <td>L</td>
                  <td>42</td>
                  <td>28</td>
                  <td>18</td>
                  <td>9.5</td>
                </tr>
                <tr>
                  <td>XL</td>
                  <td>44</td>
                  <td>29</td>
                  <td>19</td>
                  <td>10</td>
                </tr>
                <tr>
                  <td>XXL</td>
                  <td>46</td>
                  <td>30</td>
                  <td>20</td>
                  <td>10.5</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="size-note">
            <p>
              <strong>Note:</strong> All measurements are body measurements.
              Please refer to the product description for fit details.
            </p>
          </div>
          <button
            className="close-modal"
            onClick={() =>
              (document.getElementById("size-chart").style.display = "none")
            }
          >
            Close
          </button>
        </div>
      </div>

      {/* Notification Component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default ProductDetailPage;
