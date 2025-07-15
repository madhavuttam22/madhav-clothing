/**
 * Header Component - Optimized Version
 * 
 * Fixed navigation issues while maintaining mobile responsiveness
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchBar(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Fetch search suggestions
  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `https://web-production-2449.up.railway.app/api/search/suggestions/`,
        { params: { q: query } }
      );
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  // Simplified navigation handler
  const handleNavClick = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSearchBar(false);
      window.scrollTo(0, 0);
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const isActive = (path) => location.pathname === path;

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
            {/* Logo - mobile */}
            <Link to="/" className="navbar-brand d-lg-none">
              <img src={logo} alt="Logo" height="50" />
            </Link>

            {/* Logo - desktop */}
            <Link to="/" className="navbar-brand mx-lg-auto d-none d-lg-block">
              <img src={logo} alt="Logo" height="70" />
            </Link>

            {/* Right side icons */}
            <div className="d-flex align-items-center gap-3">
              {/* Profile */}
              <Link
                to={user ? "/profile" : "/login"}
                className="text-dark icon-hover"
              >
                <i className={`bi bi-person ${isActive("/profile") ? "active-icon" : ""}`}></i>
              </Link>

              {/* Search - desktop */}
              <div className="d-none d-lg-block" ref={searchRef}>
                {showSearchBar ? (
                  <form onSubmit={handleSearch} className="search-form">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                      autoFocus
                    />
                    <button type="submit" className="search-button">
                      <FiSearch />
                    </button>
                    <button
                      type="button"
                      className="close-search"
                      onClick={() => setShowSearchBar(false)}
                    >
                      <FiX />
                    </button>
                  </form>
                ) : (
                  <button
                    className="icon-hover"
                    onClick={() => setShowSearchBar(true)}
                  >
                    <i className="bi bi-search"></i>
                  </button>
                )}
              </div>

              {/* Search - mobile */}
              <button
                className="icon-hover d-lg-none"
                onClick={() => setShowSearchBar(!showSearchBar)}
              >
                <i className="bi bi-search"></i>
              </button>

              {/* Cart */}
              <Link to="/cart" className="position-relative icon-hover">
                <i className={`bi bi-cart ${isActive("/cart") ? "active-icon" : ""}`}></i>
                <span className="cart-badge"></span>
              </Link>

              {/* Mobile menu toggle */}
              <button
                className="btn d-lg-none menu-btn"
                onClick={toggleMobileMenu}
              >
                {showMobileMenu ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {showSearchBar && (
            <div className="d-lg-none mt-2">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  autoFocus
                />
                <button type="submit" className="search-button">
                  <FiSearch />
                </button>
              </form>
            </div>
          )}

          {/* Mobile menu */}
          <div
            className={`mobile-menu-container ${showMobileMenu ? "show" : ""}`}
            ref={mobileMenuRef}
          >
            <nav className="mobile-menu">
              <ul>
                <li>
                  <Link to="/" onClick={() => handleNavClick("/")}>
                    Home
                  </Link>
                </li>
                <li>
                  <ShopDropdown mobileClose={() => setShowMobileMenu(false)} />
                </li>
                <li>
                  <Link to="/bestseller" onClick={() => handleNavClick("/bestseller")}>
                    Best Sellers
                  </Link>
                </li>
                <li>
                  <Link to="/newcollection" onClick={() => handleNavClick("/newcollection")}>
                    New Collection
                  </Link>
                </li>
                <li>
                  <Link to="/allproducts" onClick={() => handleNavClick("/allproducts")}>
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/brand" onClick={() => handleNavClick("/brand")}>
                    Brand
                  </Link>
                </li>
                <li>
                  <Link to="/contactus" onClick={() => handleNavClick("/contactus")}>
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Desktop navigation */}
          <nav className="d-none d-lg-flex justify-content-center mt-3">
            <ul className="nav">
              <li className="nav-item">
                <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <ShopDropdown />
              </li>
              <li className="nav-item">
                <Link to="/bestseller" className={`nav-link ${isActive("/bestseller") ? "active" : ""}`}>
                  Best Sellers
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/newcollection" className={`nav-link ${isActive("/newcollection") ? "active" : ""}`}>
                  New Collection
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/allproducts" className={`nav-link ${isActive("/allproducts") ? "active" : ""}`}>
                  All Products
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/brand" className={`nav-link ${isActive("/brand") ? "active" : ""}`}>
                  Brand
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/contactus" className={`nav-link ${isActive("/contactus") ? "active" : ""}`}>
                  Contact
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