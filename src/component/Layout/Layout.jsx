// src/component/Layout/Layout.jsx
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "../Header/Header";

const Layout = ({ children }) => {
  const location = useLocation();

  // This ensures the page scrolls to top and triggers re-render if needed
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default Layout;
