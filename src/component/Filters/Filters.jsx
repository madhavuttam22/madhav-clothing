import React, { useState, useEffect } from "react";
import "./Filters.css";

const Filters = ({ products = [], onApply }) => {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const uniqueSizes = Array.from(
    new Map(
      products
        .flatMap((p) => (p.sizes?.map((s) => s.size) || []))
        .map((size) => [size?.id, size])
    ).values()
  );

  const uniqueColors = Array.from(
    new Map(
      products
        .flatMap((p) => (p.colors?.map((c) => c.color) || []))
        .map((color) => [color?.id, color])
    ).values()
  );

  useEffect(() => {
    if (typeof onApply === "function") {
      onApply({
        size: selectedSize,
        color: selectedColor,
        sort: sortOrder,
      });
    }
  }, [selectedSize, selectedColor, sortOrder]);

  return (
    <div className="filters-section">
      <h3>Filters</h3>

      <div className="filter-group">
        <label>Size</label>
        <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
          <option value="">All</option>
          {uniqueSizes.map((size) => (
            <option key={size?.id} value={size?.id}>
              {size?.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Color</label>
        <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
          <option value="">All</option>
          {uniqueColors.map((color) => (
            <option key={color?.id} value={color?.id}>
              {color?.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Sort</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="">Default</option>
          <option value="price_low">Price Low to High</option>
          <option value="price_high">Price High to Low</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;
