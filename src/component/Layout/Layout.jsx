import React, { useEffect } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Outlet, useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on route change
  }, [location.pathname]);

  return (
    <>
      <Header />
      <main key={location.key}> {/* This ensures page re-renders */}
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
