import React, { useState, useEffect, useRef } from "react";
import "./Header.css";
import { IoCallOutline } from "react-icons/io5";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FiSearch, FiX } from "react-icons/fi";
import ShopDropdown from "../ShopDropdown/ShopDropdown";
import { useAuth } from "../context/AuthContext.jsx";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Check active routes
  const isActive = (path, exact = false) => {
    return exact 
      ? location.pathname === path
      : location.pathname.startsWith(path);
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

  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `https://ecco-back-4j3f.onrender.com/api/search/suggestions/`,
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
      <div className="topnav1">
        <p>EXPLORE OUR WIDE RANGE OF PRODUCTS</p>
      </div>
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

            <Link to={"/"} className="navbar-brand mx-auto d-md-block d-none w-25 logo-container">
              <img
                src="https://www.zuclothing.com/cdn/shop/files/ZU_438ede84-8d3d-4544-95ca-ceaafda670cf_70x.png?v=1703589164"
                alt="ZU Clothing Logo"
                height="70"
                className="logo-img"
              />
            </Link>

            <div className="d-flex align-items-center gap-3">
              <a
                href="#"
                className="text-dark icon-hover"
                onClick={handleProfileClick}
                style={{ textDecoration: "none" }}
              >
                <i className={`bi bi-person profile-icon ${isActive('/profile') ? 'active-icon' : ''}`}></i>
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
                  <a href="#" className="text-dark icon-hover" onClick={handleSearchClick}>
                    <i className={`bi bi-search search-icon ${isActive('/search') ? 'active-icon' : ''}`}></i>
                  </a>
                )}
              </div>

              <Link to={"/cart/"} className="position-relative text-dark icon-hover">
                <i className={`bi bi-cart cart-icon ${isActive('/cart') ? 'active-icon' : ''}`}></i>
                <span className="cart-badge"></span>
              </Link>
            </div>
          </div>

          <nav className="d-none d-md-flex justify-content-center mt-3">
  <ul className="nav">
    <li className="nav-item">
      <Link 
        to="/" 
        className={`nav-link nav-hover ${isActive('/', true) ? 'active' : ''}`}
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
        className={`nav-link nav-hover ${isActive('/bestseller') ? 'active' : ''}`}
      >
        <span>Best Sellers</span>
      </Link>
    </li>
    
    <li className="nav-item dropdown">
      <Link
        
        className={`nav-link dropdown-toggle nav-hover `}
      >
        <span>New Collection</span>
      </Link>
      <ul className="dropdown-menu">
        <li>
          <Link 
             
            className={`dropdown-item `}
          >
            Winter
          </Link>
        </li>
        <li>
          <Link 
             
            className={`dropdown-item `}
          >
            Summer
          </Link>
        </li>
      </ul>
    </li>
    
    <li className="nav-item">
      <Link 
        to={'/allproducts/'}
        className={`nav-link nav-hover `}
      >
        <span>All Products</span>
      </Link>
    </li>
              <li className="nav-item ">
                <Link 
                  className={`nav-link nav-hover `}
                  to={'/brand/'}
                  
                >
                  <span>Brand</span>
                </Link>
                
              </li>
              <li className="nav-item">
                <Link  className={`nav-link nav-hover `}>
                  <span>Blogs</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to={"/contactus/"} className={`nav-link nav-hover`}>
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