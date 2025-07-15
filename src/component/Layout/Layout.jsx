// // import { Outlet, useLocation } from 'react-router-dom';
// // import Header from '../Header/Header';
// // import Footer from '../Footer/Footer';
// // import { useEffect } from 'react';

// // const Layout = () => {
// //   const location = useLocation();

// //   useEffect(() => {
// //     window.scrollTo(0, 0);
// //   }, [location.pathname]);

// //   return (
// //     <>
// //       <Header />
// //       <main>
// //         <Outlet />
// //       </main>
// //       <Footer />
// //     </>
// //   );
// // };

// // export default Layout;

// const Layout = () => {
//   const location = useLocation();

//   return (
//     <>
//       <Header />
//       {/* 👇 Move the key directly to Outlet level */}
//       <Outlet key={location.pathname} />
//       <Footer />
//     </>
//   );
// };


// Layout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const Layout = () => {
  const location = useLocation();

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
