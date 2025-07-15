import React, { useEffect } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Outlet, useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    // Force scroll to top and refresh logic
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Header />
      <div key={location.pathname}> {/* This line forces remount */}
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default Layout;
