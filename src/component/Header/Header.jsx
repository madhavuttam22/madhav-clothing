import React, { useState, useEffect, useRef } from "react";
import "./Header.css";
import { IoCallOutline } from "react-icons/io5";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FiSearch, FiX } from "react-icons/fi";
import ShopDropdown from "../ShopDropdown/ShopDropdown";
import { useAuth } from "../context/AuthContext.jsx";
import logo from '/logo.png';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path, exact = false) => {
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔁 RELOAD NAVIGATION LOGIC
  const handleNavClick = (e, path) => {
    e.preventDefault();
    if (location.pathname === path) {
      window.location.reload();
    } else {
      navigate(path);
      setTimeout(() => window.location.reload(), 10);
    }
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
            <button
              className="btn d-md-none menu-btn"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#sidebarMenu"
              aria-controls="sidebarMenu"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="fill w-25"></div>

            <Link to="/" className="navbar-brand mx-auto d-md-block d-none w-25 logo-container">
              <img src={logo} alt="Logo" height="70" className="logo-img" />
            </Link>

            <div className="d-flex align-items-center gap-3">
              <a href="#" onClick={handleProfileClick} className="text-dark icon-hover">
                <i className={`bi bi-person profile-icon ${isActive("/profile") ? "active-icon" : ""}`}></i>
              </a>

              <div className="search-container" ref={suggestionsRef}>
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
                        <button type="button" className="clear-search-btn" onClick={() => setSearchQuery("")}>
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
                  <a href="#" onClick={handleSearchClick} className="text-dark icon-hover">
                    <i className={`bi bi-search search-icon ${isActive("/search") ? "active-icon" : ""}`}></i>
                  </a>
                )}
              </div>

              <Link to="/cart/" className="position-relative text-dark icon-hover">
                <i className={`bi bi-cart cart-icon ${isActive("/cart") ? "active-icon" : ""}`}></i>
                <span className="cart-badge"></span>
              </Link>
            </div>
          </div>

          <nav className="d-none d-md-flex justify-content-center mt-3">
            <ul className="nav">
              <li className="nav-item">
                <a href="/" className={`nav-link nav-hover ${isActive("/", true) ? "active" : ""}`} onClick={(e) => handleNavClick(e, "/")}>
                  <span>Home</span>
                </a>
              </li>

              <li className="nav-item dropdown">
                <ShopDropdown />
              </li>

              <li className="nav-item">
                <a href="/bestseller" className={`nav-link nav-hover ${isActive("/bestseller") ? "active" : ""}`} onClick={(e) => handleNavClick(e, "/bestseller")}>
                  <span>Best Sellers</span>
                </a>
              </li>

              <li className="nav-item">
                <a href="/newcollection" className={`nav-link nav-hover ${isActive("/newcollection") ? "active" : ""}`} onClick={(e) => handleNavClick(e, "/newcollection")}>
                  <span>New Collection</span>
                </a>
              </li>

              <li className="nav-item">
                <a href="/allproducts" className={`nav-link nav-hover ${isActive("/allproducts") ? "active" : ""}`} onClick={(e) => handleNavClick(e, "/allproducts")}>
                  <span>All Products</span>
                </a>
              </li>

              <li className="nav-item">
                <a href="/brand" className={`nav-link nav-hover ${isActive("/brand") ? "active" : ""}`} onClick={(e) => handleNavClick(e, "/brand")}>
                  <span>Brand</span>
                </a>
              </li>

              <li className="nav-item">
                <a href="/contactus" className={`nav-link nav-hover ${isActive("/contactus") ? "active" : ""}`} onClick={(e) => handleNavClick(e, "/contactus")}>
                  <span>Contact</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
