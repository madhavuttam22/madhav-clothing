import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ProductFilters.module.css";

/**
 * ProductFilters Component - Provides filtering options for product listings
 * 
 * @param {Object} props - Component props
 * @param {string} props.categoryId - The ID of the current product category
 * @returns {JSX.Element} - Rendered filter component with price, color, size and availability options
 */
const ProductFilters = ({ categoryId }) => {
  // State management for all filter options
  const [filters, setFilters] = useState({
    priceRange: [0, 10000], // Absolute min/max price range
    selectedPrice: [0, 10000], // Currently selected price range
    colors: [], // All available colors
    selectedColors: [], // Currently selected colors
    sizes: [], // All available sizes
    selectedSizes: [], // Currently selected sizes
    availability: "all", // Stock availability filter
  });

  const [loading, setLoading] = useState(true); // Loading state for filter data
  const location = useLocation(); // Current route location
  const navigate = useNavigate(); // Navigation function

  /**
   * Handles price range selection changes
   * @param {Array} value - New price range [min, max]
   */
  const handlePriceChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      selectedPrice: value,
    }));
  };

  /**
   * Toggles color selection in filters
   * @param {string} colorId - ID of the color to toggle
   */
  const handleColorToggle = (colorId) => {
    setFilters((prev) => {
      const newColors = prev.selectedColors.includes(colorId)
        ? prev.selectedColors.filter((id) => id !== colorId) // Remove if already selected
        : [...prev.selectedColors, colorId]; // Add if not selected
      return { ...prev, selectedColors: newColors };
    });
  };

  /**
   * Toggles size selection in filters
   * @param {string} sizeId - ID of the size to toggle
   */
  const handleSizeToggle = (sizeId) => {
    setFilters((prev) => {
      const newSizes = prev.selectedSizes.includes(sizeId)
        ? prev.selectedSizes.filter((id) => id !== sizeId) // Remove if already selected
        : [...prev.selectedSizes, sizeId]; // Add if not selected
      return { ...prev, selectedSizes: newSizes };
    });
  };

  /**
   * Changes product availability filter
   * @param {string} value - New availability value ('all' or 'in_stock')
   */
  const handleAvailabilityChange = (value) => {
    setFilters((prev) => ({ ...prev, availability: value }));
  };

  /**
   * Applies all selected filters by updating URL query parameters
   */
  const applyFilters = () => {
    const searchParams = new URLSearchParams();

    // Add price filter if different from default range
    if (
      filters.selectedPrice[0] !== filters.priceRange[0] ||
      filters.selectedPrice[1] !== filters.priceRange[1]
    ) {
      searchParams.set("min_price", filters.selectedPrice[0]);
      searchParams.set("max_price", filters.selectedPrice[1]);
    }

    // Add each selected color
    filters.selectedColors.forEach((id) => {
      searchParams.append("colors[]", id);
    });

    // Add each selected size
    filters.selectedSizes.forEach((id) => {
      searchParams.append("sizes[]", id);
    });

    // Add availability filter if not 'all'
    if (filters.availability !== "all") {
      searchParams.set("availability", filters.availability);
    }

    // Navigate to current path with new query params
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  /**
   * Resets all filters to their default values
   */
  const resetFilters = () => {
    setFilters((prev) => ({
      ...prev,
      selectedPrice: [prev.priceRange[0], prev.priceRange[1]],
      selectedColors: [],
      selectedSizes: [],
      availability: "all",
    }));
    navigate(location.pathname); // Navigate without any query params
  };

  // Show loading state while filters are being fetched
  if (loading) return <div className={styles.loading}>Loading filters...</div>;

  return (
    <div className={styles.filtersContainer}>
      {/* Filters Header Section */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Filters</h3>
        <button onClick={resetFilters} className={styles.resetButton}>
          Reset All
        </button>
      </div>

      {/* Price Range Filter Section */}
      <div className={styles.filterSection}>
        <h4 className={styles.filterSubtitle}>Price Range</h4>
        <div className={styles.priceRangeValues}>
          <span>₹{filters.selectedPrice[0]}</span>
          <span>₹{filters.selectedPrice[1]}</span>
        </div>
        <input
          type="range"
          min={filters.priceRange[0]}
          max={filters.priceRange[1]}
          value={filters.selectedPrice[1]}
          onChange={(e) =>
            handlePriceChange([
              filters.selectedPrice[0],
              parseInt(e.target.value),
            ])
          }
          className={styles.priceSlider}
        />
        <div className={styles.priceRangeInputs}>
          <input
            type="number"
            min={filters.priceRange[0]}
            max={filters.priceRange[1]}
            value={filters.selectedPrice[0]}
            onChange={(e) =>
              handlePriceChange([
                parseInt(e.target.value),
                filters.selectedPrice[1],
              ])
            }
          />
          <span>-</span>
          <input
            type="number"
            min={filters.priceRange[0]}
            max={filters.priceRange[1]}
            value={filters.selectedPrice[1]}
            onChange={(e) =>
              handlePriceChange([
                filters.selectedPrice[0],
                parseInt(e.target.value),
              ])
            }
          />
        </div>
      </div>

      {/* Color Filter Section */}
      <div className={styles.filterSection}>
        <h4 className={styles.filterSubtitle}>Colors</h4>
        <div className={styles.colorOptions}>
          {filters.colors.map((color) => (
            <div
              key={color.id}
              className={`${styles.colorOption} ${
                filters.selectedColors.includes(color.id) ? styles.selected : ""
              }`}
              onClick={() => handleColorToggle(color.id)}
            >
              <span
                className={styles.colorSwatch}
                style={{ backgroundColor: color.hex_code || "#ccc" }}
              />
              <span className={styles.colorName}>{color.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Size Filter Section */}
      <div className={styles.filterSection}>
        <h4 className={styles.filterSubtitle}>Sizes</h4>
        <div className={styles.sizeOptions}>
          {filters.sizes.map((size) => (
            <button
              key={size.id}
              className={`${styles.sizeOption} ${
                filters.selectedSizes.includes(size.id) ? styles.selected : ""
              }`}
              onClick={() => handleSizeToggle(size.id)}
            >
              {size.name}
            </button>
          ))}
        </div>
      </div>

      {/* Availability Filter Section */}
      <div className={styles.filterSection}>
        <h4 className={styles.filterSubtitle}>Availability</h4>
        <div className={styles.availabilityOptions}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="availability"
              value="all"
              checked={filters.availability === "all"}
              onChange={() => handleAvailabilityChange("all")}
            />
            <span>All Products</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="availability"
              value="in_stock"
              checked={filters.availability === "in_stock"}
              onChange={() => handleAvailabilityChange("in_stock")}
            />
            <span>In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Apply Filters Button */}
      <button onClick={applyFilters} className={styles.applyButton}>
        Apply Filters
      </button>
    </div>
  );
};

export default ProductFilters;