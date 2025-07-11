// components/ProductFilters/ProductFilters.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ProductFilters.module.css";

const ProductFilters = ({ categoryId }) => {
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    selectedPrice: [0, 10000],
    colors: [],
    selectedColors: [],
    sizes: [],
    selectedSizes: [],
    availability: "all",
  });

  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  //   useEffect(() => {
  //     const fetchFilterOptions = async () => {
  //       try {
  //         const url = categoryId
  //           ? `https://web-production-2449.up.railway.app/api/categories/${categoryId}/filter-options/`
  //           : 'https://web-production-2449.up.railway.app/api/products/filter-options/';

  //         const response = await axios.get(url);
  //         const data = response.data;

  //         setFilters(prev => ({
  //           ...prev,
  //           priceRange: [data.price_range.min, data.price_range.max],
  //           selectedPrice: [data.price_range.min, data.price_range.max],
  //           colors: data.colors,
  //           sizes: data.sizes
  //         }));
  //       } catch (error) {
  //         console.error('Error fetching filter options:', error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchFilterOptions();

  //     // Parse existing filters from URL
  //     const searchParams = new URLSearchParams(location.search);
  //     const minPrice = searchParams.get('min_price');
  //     const maxPrice = searchParams.get('max_price');
  //     const colors = searchParams.getAll('colors[]');
  //     const sizes = searchParams.getAll('sizes[]');
  //     const availability = searchParams.get('availability');

  //     if (minPrice || maxPrice || colors.length || sizes.length || availability) {
  //       setFilters(prev => ({
  //         ...prev,
  //         selectedPrice: [
  //           minPrice ? parseInt(minPrice) : prev.priceRange[0],
  //           maxPrice ? parseInt(maxPrice) : prev.priceRange[1]
  //         ],
  //         selectedColors: colors.map(id => parseInt(id)),
  //         selectedSizes: sizes.map(id => parseInt(id)),
  //         availability: availability || 'all'
  //       }));
  //     }
  //   }, [categoryId, location.search]);

  const handlePriceChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      selectedPrice: value,
    }));
  };

  const handleColorToggle = (colorId) => {
    setFilters((prev) => {
      const newColors = prev.selectedColors.includes(colorId)
        ? prev.selectedColors.filter((id) => id !== colorId)
        : [...prev.selectedColors, colorId];
      return { ...prev, selectedColors: newColors };
    });
  };

  const handleSizeToggle = (sizeId) => {
    setFilters((prev) => {
      const newSizes = prev.selectedSizes.includes(sizeId)
        ? prev.selectedSizes.filter((id) => id !== sizeId)
        : [...prev.selectedSizes, sizeId];
      return { ...prev, selectedSizes: newSizes };
    });
  };

  const handleAvailabilityChange = (value) => {
    setFilters((prev) => ({ ...prev, availability: value }));
  };

  const applyFilters = () => {
    const searchParams = new URLSearchParams();

    // Price filter
    if (
      filters.selectedPrice[0] !== filters.priceRange[0] ||
      filters.selectedPrice[1] !== filters.priceRange[1]
    ) {
      searchParams.set("min_price", filters.selectedPrice[0]);
      searchParams.set("max_price", filters.selectedPrice[1]);
    }

    // Color filter
    filters.selectedColors.forEach((id) => {
      searchParams.append("colors[]", id);
    });

    // Size filter
    filters.selectedSizes.forEach((id) => {
      searchParams.append("sizes[]", id);
    });

    // Availability filter
    if (filters.availability !== "all") {
      searchParams.set("availability", filters.availability);
    }

    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  const resetFilters = () => {
    setFilters((prev) => ({
      ...prev,
      selectedPrice: [prev.priceRange[0], prev.priceRange[1]],
      selectedColors: [],
      selectedSizes: [],
      availability: "all",
    }));
    navigate(location.pathname);
  };

  if (loading) return <div className={styles.loading}>Loading filters...</div>;

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Filters</h3>
        <button onClick={resetFilters} className={styles.resetButton}>
          Reset All
        </button>
      </div>

      {/* Price Range Filter */}
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

      {/* Color Filter */}
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

      {/* Size Filter */}
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

      {/* Availability Filter */}
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

      <button onClick={applyFilters} className={styles.applyButton}>
        Apply Filters
      </button>
    </div>
  );
};

export default ProductFilters;
