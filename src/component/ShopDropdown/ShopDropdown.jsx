import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const ShopDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://ecco-back-4j3f.onrender.com/api/categories/"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      <a
        className={`nav-link dropdown-toggle ${isActive('/category') ? 'active' : ''}`}
        href="#"
        data-bs-toggle="dropdown"
      >
        <span>Shop</span>
      </a>
      <ul className="dropdown-menu">
        {loading ? (
          <li>
            <div className="dropdown-item text-muted">Loading...</div>
          </li>
        ) : (
          categories.map((category) => (
            <li key={category.id}>
              <Link
                className={`dropdown-item ${isActive(`/category/${category.id}`) ? 'active-category' : ''}`}
                to={`/category/${category.id}/products/`}
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