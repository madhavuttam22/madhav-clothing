/**
 * Header Component
 * 
 * Responsive header with improved mobile menu toggle and search functionality
 */
import React, { useState, useEffect, useRef } from "react";
import "./Header.css";
import { IoCallOutline } from "react-icons/io5";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FiSearch, FiX } from "react-icons/fi";
import { FaBars, FaTimes } from "react-icons/fa";
import ShopDropdown from "../ShopDropdown/ShopDropdown";
import { useAuth } from "../context/AuthContext.jsx";
import logo from '/logo.png';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const suggestionsRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path, exact = false) => {
    return exact
      ? location.pathname === path
      : location.pathname.startsWith(path);
  };

  // Search functionality
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

  const handleProfileClick = (e) => {
    e.preventDefault();
    navigate(user ? "/profile/" : "/login/");
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    setShowSearchBar(!showSearchBar);
    setShowSuggestions(false);
    if (showSearchBar && searchQuery.trim()) {
      handleSearchSubmit(e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSearchBar(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setShowSearchBar(false);
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 1);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <>
      {/* Top announcement bar */}
      <div className="topnav1">
        <p>EXPLORE OUR WIDE RANGE OF PRODUCTS</p>
      </div>

      {/* Contact information */}
      <div className="nav2 d-flex justify-content-evenly">
        <div className="mobileno">
          <a className="contact_info" href="tel:+919740227938">
            <IoCallOutline size={22} />
            +91-97402-27938
          </a>
        </div>
        <div className="line"></div>
        <div className="gmail">
          <a className="contact_info" href="mailto:clothing@gmail.com">
            clothing@gmail.com
          </a>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white border-bottom sticky-top">
        <div className="container-fluid py-2 px-3">
          <div className="d-flex align-items-center justify-content-between">
            {/* Logo - mobile version */}
            <Link to={"/"} className="navbar-brand d-lg-none">
              <img src={logo} alt="Logo" height="50" className="logo-img" />
            </Link>

            {/* Logo - desktop version */}
            <Link to={"/"} className="navbar-brand mx-lg-auto d-none d-lg-block">
              <img src={logo} alt="Logo" height="70" className="logo-img" />
            </Link>

            {/* Right side icons (search, profile, cart) */}
            <div className="d-flex align-items-center gap-3">
              {/* Profile icon */}
              <a
                href="#"
                className="text-dark icon-hover"
                onClick={handleProfileClick}
                style={{ textDecoration: "none" }}
              >
                <i
                  className={`bi bi-person profile-icon ${
                    isActive("/profile") ? "active-icon" : ""
                  }`}
                ></i>
              </a>

              {/* Search icon/bar - desktop version */}
              <div className="search-container d-none d-lg-block" ref={suggestionsRef}>
                {showSearchBar ? (
                  <form onSubmit={handleSearchSubmit} className="search-form">
                    <div className="search-input-container">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={handleInputChange}
                        onFocus={() => setShowSuggestions(true)}
                        className="search-input"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          className="clear-search-btn"
                          onClick={() => setSearchQuery("")}
                        >
                          <FiX />
                        </button>
                      )}
                      <button type="submit" className="search-button">
                        <FiSearch size={20} />
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
                  <a
                    href="#"
                    className="text-dark icon-hover"
                    onClick={handleSearchClick}
                  >
                    <i
                      className={`bi bi-search search-icon ${
                        isActive("/search") ? "active-icon" : ""
                      }`}
                    ></i>
                  </a>
                )}
              </div>

              {/* Search icon - mobile version (only icon) */}
              <a
                href="#"
                className="text-dark icon-hover d-lg-none"
                onClick={handleSearchClick}
              >
                <i
                  className={`bi bi-search search-icon ${
                    isActive("/search") ? "active-icon" : ""
                  }`}
                ></i>
              </a>

              {/* Cart icon */}
              <Link
                to={"/cart/"}
                className="position-relative text-dark icon-hover"
              >
                <i
                  className={`bi bi-cart cart-icon ${
                    isActive("/cart") ? "active-icon" : ""
                  }`}
                ></i>
                <span className="cart-badge"></span>
              </Link>

              {/* Mobile menu button - placed last */}
              <button
                className="btn d-lg-none menu-btn"
                type="button"
                onClick={toggleMobileMenu}
                aria-expanded={showMobileMenu}
              >
                {showMobileMenu ? (
                  <FaTimes className="menu-icon" />
                ) : (
                  <FaBars className="menu-icon" />
                )}
              </button>
            </div>
          </div>

          {/* Search bar for mobile when expanded - appears below the header */}
          {showSearchBar && (
            <div className="d-lg-none mt-2 w-100">
              <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    className="search-input"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => setSearchQuery("")}
                    >
                      <FiX />
                    </button>
                  )}
                  <button type="submit" className="search-button">
                    <FiSearch size={20} />
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
            </div>
          )}

          {/* Mobile menu */}
          <div
            className={`mobile-menu-container ${showMobileMenu ? "show" : ""}`}
            ref={mobileMenuRef}
          >
            <nav className="mobile-menu">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <Link
                    to="/"
                    className={`nav-link nav-hover ${
                      isActive("/", true) ? "active" : ""
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span>Home</span>
                  </Link>
                </li>

                <li className="nav-item dropdown">
                  <ShopDropdown mobileClose={() => setShowMobileMenu(false)} />
                </li>

                <li className="nav-item">
                  <Link
                    to="/bestseller"
                    className={`nav-link nav-hover ${
                      isActive("/bestseller") ? "active" : ""
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span>Best Sellers</span>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    to="/newcollection"
                    className={`nav-link nav-hover ${
                      isActive("/newcollection") ? "active" : ""
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span>New Collection</span>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    to="/allproducts"
                    className={`nav-link nav-hover ${
                      isActive("/allproducts") ? "active" : ""
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span>All Products</span>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    to="/brand"
                    className={`nav-link nav-hover ${
                      isActive("/brand") ? "active" : ""
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span>Brand</span>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    to="/contactus"
                    className={`nav-link nav-hover ${
                      isActive("/contactus") ? "active" : ""
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span>Contact</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Desktop navigation */}
          <nav className="d-none d-lg-flex justify-content-center mt-3">
            <ul className="nav">
              <li className="nav-item">
                <Link
                  to="/"
                  className={`nav-link nav-hover ${
                    isActive("/", true) ? "active" : ""
                  }`}
                >
                  <span>Home</span>
                </Link>
              </li>

              <li className="nav-item dropdown">
                <ShopDropdown />
              </li>

              <li className="nav-item">
                <Link
                  to="/bestseller"
                  className={`nav-link nav-hover ${
                    isActive("/bestseller") ? "active" : ""
                  }`}
                >
                  <span>Best Sellers</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="/newcollection"
                  className={`nav-link nav-hover ${
                    isActive("/newcollection") ? "active" : ""
                  }`}
                >
                  <span>New Collection</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="/allproducts"
                  className={`nav-link nav-hover ${
                    isActive("/allproducts") ? "active" : ""
                  }`}
                >
                  <span>All Products</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="/brand"
                  className={`nav-link nav-hover ${
                    isActive("/brand") ? "active" : ""
                  }`}
                >
                  <span>Brand</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="/contactus"
                  className={`nav-link nav-hover ${
                    isActive("/contactus") ? "active" : ""
                  }`}
                >
                  <span>Contact</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;