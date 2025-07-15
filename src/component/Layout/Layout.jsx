import React, { useEffect } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Outlet, useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Header />
<main key={location.pathname}>
  <Outlet />
</main>
<Footer />
    </>
  );
};

export default Layout;
