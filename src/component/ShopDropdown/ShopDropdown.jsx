import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

/**
 * ShopDropdown Component
 * 
 * A dropdown menu component that displays product categories fetched from an API.
 * Integrates with React Router for navigation and highlights active categories.
 * 
 * Features:
 * - Fetches categories from backend API on component mount
 * - Displays loading state while fetching data
 * - Highlights currently active category based on route
 * - Responsive dropdown menu for shop navigation
 */
const ShopDropdown = () => {
  // State for storing fetched categories
  const [categories, setCategories] = useState([]);
  // Loading state to handle API fetch status
  const [loading, setLoading] = useState(true);
  // Get current location using react-router's useLocation hook
  const location = useLocation();

  /**
   * useEffect hook to fetch categories when component mounts
   * Runs only once due to empty dependency array
   */
  useEffect(() => {
    /**
     * Async function to fetch categories from API
     */
    const fetchCategories = async () => {
      try {
        // API call to get categories
        const response = await axios.get(
          "https://web-production-2449.up.railway.app/api/categories/"
        );
        // Update state with fetched categories
        setCategories(response.data);
      } catch (error) {
        // Log error if API call fails
        console.error("Error fetching categories:", error);
      } finally {
        // Set loading to false regardless of success/failure
        setLoading(false);
      }
    };

    // Invoke the fetch function
    fetchCategories();
  }, []); // Empty dependency array ensures this runs only once

  /**
   * Helper function to check if a given path is active
   * @param {string} path - The path to check against current location
   * @returns {boolean} - True if current path starts with the given path
   */
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      {/* Dropdown toggle button */}
      <a
        className={`nav-link dropdown-toggle ${
          isActive("/category") ? "active" : ""
        }`}
        href="#"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <span>Shop</span>
      </a>
      
      {/* Dropdown menu containing categories */}
      <ul className="dropdown-menu">
        {loading ? (
          // Loading state display
          <li>
            <div className="dropdown-item text-muted">Loading...</div>
          </li>
        ) : (
          // Map through categories and create menu items
          categories.map((category) => (
            <li key={category.id}>
              <Link
                className={`dropdown-item ${
                  isActive(`/category/${category.id}`) ? "active-category" : ""
                }`}
                to={`/category/${category.id}/products/`}
                aria-current={isActive(`/category/${category.id}`) ? "page" : undefined}
              >
                {category.category}
              </Link>
            </li>
          ))
        )}
      </ul>
    </>
  );
};

export default ShopDropdown;