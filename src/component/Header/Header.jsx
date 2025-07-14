/**
 * Enhanced Header Component with Mobile Responsiveness
 * 
 * Features:
 * - Fully responsive design with mobile-first approach
 * - Animated hamburger menu with smooth transitions
 * - Perfectly aligned mobile elements
 * - Search functionality with suggestions
 * - User profile and cart integration
 * - Active state indicators
 * - Accessibility optimized
 */

import React, { useState, useEffect, useRef } from "react";
import "./Header.css";
import { IoCallOutline, IoClose } from "react-icons/io5";
import { FiSearch, FiX } from "react-icons/fi";
import { BiUser, BiCart, BiMenu } from "react-icons/bi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ShopDropdown from "../ShopDropdown/ShopDropdown";
import { useAuth } from "../context/AuthContext.jsx";
import logo from '/logo.png';

const Header = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Refs and hooks
  const suggestionsRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  /**
   * Toggles mobile menu with animation
   */
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = mobileMenuOpen ? 'auto' : 'hidden';
  };

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false);
      document.body.style.overflow = 'auto';
    };
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  /**
   * Checks if current route matches given path
   * @param {string} path - Route path to check
   * @param {boolean} exact - Whether to match exactly
   * @returns {boolean} True if route matches
   */
  const isActive = (path, exact = false) => {
    return exact
      ? location.pathname === path
      : location.pathname.startsWith(path);
  };

  // Fetch search suggestions with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 1 && showSearchBar) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, showSearchBar]);

  /**
   * Fetches search suggestions from API
   * @param {string} query - Search term
   */
  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `https://web-production-2449.up.railway.app/api/search/suggestions/`,
        { params: { q: query } }
      );
      setSuggestions(response.data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  /**
   * Handles profile icon click
   */
  const handleProfileClick = (e) => {
    e.preventDefault();
    navigate(user ? "/profile/" : "/login/");
  };

  /**
   * Toggles search bar visibility
   */
  const handleSearchClick = (e) => {
    e.preventDefault();
    setShowSearchBar(!showSearchBar);
    setShowSuggestions(false);
    if (showSearchBar && searchQuery.trim()) {
      handleSearchSubmit(e);
    }
  };

  /**
   * Handles search form submission
   */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSearchBar(false);
      setShowSuggestions(false);
    }
  };

  /**
   * Handles search suggestion selection
   */
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setShowSearchBar(false);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Top announcement bar */}
      <div className="announcement-bar">
        <p>EXPLORE OUR WIDE RANGE OF PRODUCTS</p>
      </div>

      {/* Contact information */}
      <div className="contact-bar">
        <div className="contact-item">
          <a href="tel:+919740227938">
            <IoCallOutline size={18} />
            <span>+91-97402-27938</span>
          </a>
        </div>
        <div className="contact-divider"></div>
        <div className="contact-item">
          <a href="mailto:clothing@gmail.com">
            <span>clothing@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Main header */}
      <header className="main-header">
        <div className="header-container">
          {/* Mobile menu button */}
          <button
            className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Logo - centered on mobile */}
          <Link to="/" className="logo-link">
            <img src={logo} alt="Company Logo" className="logo-img" />
          </Link>

          {/* Right side icons */}
          <div className="header-icons">
            {/* Profile icon */}
            {(!showSearchBar || window.innerWidth > 768) && (
              <button 
                className="icon-button" 
                onClick={handleProfileClick}
                aria-label={user ? "Profile" : "Login"}
              >
                <BiUser className={`icon ${isActive("/profile") ? 'active' : ''}`} />
              </button>
            )}

            {/* Search functionality */}
            <div className="search-wrapper" ref={suggestionsRef}>
              {showSearchBar ? (
                <form onSubmit={handleSearchSubmit} className="search-form">
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(e.target.value.length > 1);
                      }}
                      onFocus={() => setShowSuggestions(searchQuery.length > 1)}
                      className="search-input"
                      autoFocus
                      aria-label="Search products"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className="clear-search"
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search"
                      >
                        <FiX />
                      </button>
                    )}
                    <button 
                      type="submit" 
                      className="search-submit"
                      aria-label="Submit search"
                    >
                      <FiSearch />
                    </button>
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </form>
              ) : (
                <button 
                  className="icon-button" 
                  onClick={handleSearchClick}
                  aria-label="Search"
                >
                  <FiSearch className={`icon ${isActive("/search") ? 'active' : ''}`} />
                </button>
              )}
            </div>

            {/* Cart icon */}
            <Link 
              to="/cart" 
              className="icon-button cart-button"
              aria-label="Shopping Cart"
            >
              <BiCart className={`icon ${isActive("/cart") ? 'active' : ''}`} />
              <span className="cart-badge"></span>
            </Link>
          </div>
        </div>

        {/* Desktop navigation */}
        <nav className="desktop-nav">
          <ul>
            <li>
              <Link to="/" className={`nav-link ${isActive("/", true) ? 'active' : ''}`}>
                Home
              </Link>
            </li>
            <li className="nav-dropdown">
              <ShopDropdown />
            </li>
            <li>
              <Link to="/bestseller" className={`nav-link ${isActive("/bestseller") ? 'active' : ''}`}>
                Best Sellers
              </Link>
            </li>
            <li>
              <Link to="/newcollection" className={`nav-link ${isActive("/newcollection") ? 'active' : ''}`}>
                New Collection
              </Link>
            </li>
            <li>
              <Link to="/allproducts" className={`nav-link ${isActive("/allproducts") ? 'active' : ''}`}>
                All Products
              </Link>
            </li>
            <li>
              <Link to="/brand" className={`nav-link ${isActive("/brand") ? 'active' : ''}`}>
                Brand
              </Link>
            </li>
            <li>
              <Link to="/contactus" className={`nav-link ${isActive("/contactus") ? 'active' : ''}`}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile menu overlay */}
        <div 
          className={`mobile-overlay ${mobileMenuOpen ? 'visible' : ''}`}
          onClick={toggleMobileMenu}
          aria-hidden={!mobileMenuOpen}
        ></div>

        {/* Mobile menu sidebar */}
        <aside 
          className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
          ref={mobileMenuRef}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="mobile-menu-header">
            <button 
              className="close-menu"
              onClick={toggleMobileMenu}
              aria-label="Close menu"
            >
              <IoClose size={24} />
            </button>
          </div>
          
          <nav className="mobile-nav">
            <ul>
              <li>
                <Link to="/" className={`mobile-link ${isActive("/", true) ? 'active' : ''}`}>
                  Home
                </Link>
              </li>
              <li className="mobile-dropdown">
                <ShopDropdown mobile />
              </li>
              <li>
                <Link to="/bestseller" className={`mobile-link ${isActive("/bestseller") ? 'active' : ''}`}>
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/newcollection" className={`mobile-link ${isActive("/newcollection") ? 'active' : ''}`}>
                  New Collection
                </Link>
              </li>
              <li>
                <Link to="/allproducts" className={`mobile-link ${isActive("/allproducts") ? 'active' : ''}`}>
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/brand" className={`mobile-link ${isActive("/brand") ? 'active' : ''}`}>
                  Brand
                </Link>
              </li>
              <li>
                <Link to="/contactus" className={`mobile-link ${isActive("/contactus") ? 'active' : ''}`}>
                  Contact
                </Link>
              </li>
            </ul>

            <div className="mobile-contact">
              <a href="tel:+919740227938" className="mobile-contact-link">
                <IoCallOutline size={18} />
                <span>+91-97402-27938</span>
              </a>
              <a href="mailto:clothing@gmail.com" className="mobile-contact-link">
                <span>clothing@gmail.com</span>
              </a>
            </div>
          </nav>
        </aside>
      </header>
    </>
  );
};

export default Header;