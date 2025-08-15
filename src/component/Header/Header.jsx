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
import logo from "/logo.png";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Exact active match only
  const isActive = (path) => location.pathname === path;

  const handleReloadNavigate = (e, path) => {
    e.preventDefault();
    if (location.pathname === path) {
      window.location.reload();
    } else {
      navigate(path);
      setTimeout(() => window.location.reload(), 10); // optional reload
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchBar(false);
        setSuggestions([]);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchQuery.length > 2 && showSearchBar) {
      const timer = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, showSearchBar]);

  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `https://web-production-27d40.up.railway.app/api/search/suggestions/`,
        { params: { q: query } }
      );
      setSuggestions(response.data.suggestions || []);
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
    setSuggestions([]);
    if (showSearchBar && searchQuery.trim()) {
      handleSearchSubmit(e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const url = `/search?q=${encodeURIComponent(searchQuery)}`;
      if (location.pathname + location.search === url) {
        window.location.reload(); // Force reload if already on same URL
      } else {
        navigate(url);
        setTimeout(() => window.location.reload(), 10); // Optional delay for reload after navigate
      }
      setSearchQuery("");
      setShowSearchBar(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const url = `/search?q=${encodeURIComponent(suggestion)}`;
    if (location.pathname + location.search === url) {
      window.location.reload();
    } else {
      navigate(url);
      setTimeout(() => window.location.reload(), 10);
    }
    setSearchQuery("");
    setShowSearchBar(false);
    setSuggestions([]);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <>
      <div className="topnav1">
        <p>EXPLORE OUR WIDE RANGE OF PRODUCTS</p>
      </div>

      <div className="nav2 d-flex justify-content-evenly">
        <div className="mobileno">
          <a className="contact_info" href="tel:+919740227938">
            <IoCallOutline size={22} /> +91-97402-27938
          </a>
        </div>
        <div className="line"></div>
        <div className="gmail">
          <a className="contact_info" href="mailto:clothing@gmail.com">
            clothing@gmail.com
          </a>
        </div>
      </div>

      <header className="bg-white border-bottom sticky-top">
        <div className="container-fluid py-2 px-3">
          <div className="d-flex align-items-center justify-content-between">
            {/* Logo */}
            <Link to="/" className="navbar-brand d-lg-none">
              <img src={logo} alt="Logo" height="50" className="logo-img" />
            </Link>
            <Link to="/" className="navbar-brand mx-lg-auto d-none d-lg-block">
              <img src={logo} alt="Logo" height="70" className="logo-img" />
            </Link>

            <div className="d-flex align-items-center gap-3">
              {/* Profile */}
              <Link
                to={user ? "/profile" : "/login"}
                className="text-dark icon-hover"
                onClick={(e) => {
                  handleProfileClick(e);
                  window.location.reload();
                }}
              >
                <i
                  className={`bi bi-person profile-icon ${
                    isActive("/profile") ? "active-icon" : ""
                  }`}
                ></i>
              </Link>

              {/* Desktop Search */}
              <div
                className="search-container d-none d-lg-block"
                ref={searchRef}
              >
                {showSearchBar ? (
                  <form onSubmit={handleSearchSubmit} className="search-form">
                    <div className="search-input-container">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          // window.location.reload();
                        }}
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
                    {suggestions.length > 0 && (
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
                    className="text-dark icon-hover"
                    style={{ border: "none", background: "none" }}
                    onClick={handleSearchClick}
                  >
                    <i
                      className={`bi bi-search search-icon ${
                        isActive("/search") ? "active-icon" : ""
                      }`}
                    ></i>
                  </button>
                )}
              </div>

              {/* Mobile Search */}
              <button
                className="text-dark icon-hover d-lg-none"
                style={{ border: "none", background: "none" }}
                onClick={handleSearchClick}
              >
                <i
                  className={`bi bi-search search-icon ${
                    isActive("/search") ? "active-icon" : ""
                  }`}
                ></i>
              </button>

              {/* Cart */}
              <Link
                to="/cart/"
                className="position-relative text-dark icon-hover"
                // onClick={(e) => {
                //   window.location.reload();
                // }}
              >
                <i
                  className={`bi bi-cart cart-icon ${
                    isActive("/cart/") ? "active-icon" : ""
                  }`}
                ></i>
                <span className="cart-badge"></span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="btn d-lg-none menu-btn"
                onClick={toggleMobileMenu}
              >
                {showMobileMenu ? (
                  <FaTimes className="menu-icon" />
                ) : (
                  <FaBars className="menu-icon" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Input */}
          {showSearchBar && (
            <div className="d-lg-none mt-2 w-100">
              <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      // window.location.reload();
                    }}
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
                {suggestions.length > 0 && (
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

          {/* Mobile Menu */}
          <div
            className={`mobile-menu-container ${showMobileMenu ? "show" : ""}`}
            ref={mobileMenuRef}
          >
            {/* Close (X) Button */}
            <button className="close-menu-btn" onClick={toggleMobileMenu}>
              <FaTimes />
            </button>
            <nav className="mobile-menu">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a
                    href="/"
                    className={`nav-link nav-hover ${
                      isActive("/") ? "active" : ""
                    }`}
                    onClick={(e) => handleReloadNavigate(e, "/")}
                  >
                    <span>Home</span>
                  </a>
                </li>
                <li className="nav-item dropdown">
                  <ShopDropdown
                    handleReloadNavigate={handleReloadNavigate}
                    mobileClose={() => setShowMobileMenu(false)}
                  />
                </li>
                {[
                  ["/bestseller", "Best Sellers"],
                  ["/newcollection", "New Collection"],
                  ["/allproducts", "All Products"],
                  ["/brand", "Brand"],
                  ["/contactus", "Contact"],
                ].map(([path, label]) => (
                  <li className="nav-item" key={path}>
                    <a
                      href={path}
                      className={`nav-link nav-hover ${
                        isActive(path) ? "active" : ""
                      }`}
                      onClick={(e) => handleReloadNavigate(e, path)}
                    >
                      <span>{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Desktop Menu */}
          <nav className="d-none d-lg-flex justify-content-center mt-3">
            <ul className="nav">
              <li className="nav-item">
                <a
                  href="/"
                  className={`nav-link nav-hover ${
                    isActive("/") ? "active" : ""
                  }`}
                  onClick={(e) => handleReloadNavigate(e, "/")}
                >
                  <span>Home</span>
                </a>
              </li>
              <li className="nav-item dropdown">
                <ShopDropdown handleReloadNavigate={handleReloadNavigate} />
              </li>
              {[
                ["/bestseller", "Best Sellers"],
                ["/newcollection", "New Collection"],
                ["/allproducts", "All Products"],
                ["/brand", "Brand"],
                ["/contactus", "Contact"],
              ].map(([path, label]) => (
                <li className="nav-item" key={path}>
                  <a
                    href={path}
                    className={`nav-link nav-hover ${
                      isActive(path) ? "active" : ""
                    }`}
                    onClick={(e) => handleReloadNavigate(e, path)}
                  >
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
