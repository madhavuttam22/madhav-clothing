// src/components/Filters/Filters.jsx
import React, { useState, useEffect } from "react";
import "./Filters.css";

/**
 * Filters Component
 * 
 * A collapsible filter panel for product listings with:
 * - Sort by options (price, newest)
 * - Size filtering
 * - Color filtering
 * - Reset functionality
 * 
 * Props:
 * @param {Array} products - Array of product objects to filter
 * @param {Function} onApply - Callback when filters are changed
 */
const Filters = ({ products = [], onApply }) => {
  // State for filter selections
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  /**
   * Extract unique sizes from products array
   * Uses Map to ensure uniqueness by size.id
   */
  const uniqueSizes = Array.from(
    new Map(
      products
        .flatMap((p) => (p.sizes?.map((s) => s.size) || [])) // Flatten all sizes
        .map((size) => [size?.id, size]) // Create [id, size] pairs
    ).values() // Convert back to array
  );

  /**
   * Extract unique colors from products array
   * Uses Map to ensure uniqueness by color.id
   */
  const uniqueColors = Array.from(
    new Map(
      products
        .flatMap((p) => (p.colors?.map((c) => c.color) || [])) // Flatten all colors
        .map((color) => [color?.id, color]) // Create [id, color] pairs
    ).values() // Convert back to array
  );

  // Effect to trigger onApply callback when filters change
  useEffect(() => {
    if (typeof onApply === "function") {
      onApply({
        size: selectedSize,
        color: selectedColor,
        sort: sortOrder,
      });
    }
  }, [selectedSize, selectedColor, sortOrder, onApply]);

  return (
    <div className={`filters-container ${isExpanded ? "expanded" : ""}`}>
      {/* Collapsible header section */}
      <div className="filters-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>Filters & Sort</h3>
        {/* Animated toggle icon */}
        <svg
          className={`toggle-icon ${isExpanded ? "expanded" : ""}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {/* Filter content (collapsible) */}
      <div className="filters-content">
        {/* Sort by section */}
        <div className="filter-group">
          <div className="filter-label">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 6h18"></path>
              <path d="M7 12h10"></path>
              <path d="M10 18h4"></path>
            </svg>
            <span>Sort By</span>
          </div>
          <div className="select-wrapper">
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="styled-select"
            >
              <option value="">Featured</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
            <div className="select-arrow"></div>
          </div>
        </div>

        {/* Size filter section */}
        <div className="filter-group">
          <div className="filter-label">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Size</span>
          </div>
          <div className="size-options">
            <button 
              className={`size-option ${selectedSize === "" ? "active" : ""}`}
              onClick={() => setSelectedSize("")}
            >
              All
            </button>
            {uniqueSizes.map((size) => (
              <button
                key={size?.id}
                className={`size-option ${selectedSize === size?.id ? "active" : ""}`}
                onClick={() => setSelectedSize(size?.id)}
              >
                {size?.name}
              </button>
            ))}
          </div>
        </div>

        {/* Color filter section */}
        <div className="filter-group">
          <div className="filter-label">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            <span>Color</span>
          </div>
          <div className="color-options">
            <button 
              className={`color-option ${selectedColor === "" ? "active" : ""}`}
              onClick={() => setSelectedColor("")}
            >
              <span className="color-all">All</span>
            </button>
            {uniqueColors.map((color) => (
              <button
                key={color?.id}
                className={`color-option ${selectedColor === color?.id ? "active" : ""}`}
                onClick={() => setSelectedColor(color?.id)}
                title={color?.name}
              >
                <span 
                  className="color-swatch" 
                  style={{ backgroundColor: color?.hex_code || "#F4C2C2" }}
                ></span>
              </button>
            ))}
          </div>
        </div>

        {/* Reset filters button */}
        <div className="filter-actions">
          <button 
            className="reset-btn"
            onClick={() => {
              setSelectedSize("");
              setSelectedColor("");
              setSortOrder("");
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;