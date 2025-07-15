import React, { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer"; // (Assuming you have a footer component)

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Header />
      <main>
        <Outlet /> {/* ← This renders the current route's content */}
      </main>
      <Footer /> {/* Optional if you want footer on all pages */}
    </>
  );
};

export default Layout;
