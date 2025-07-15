import React from 'react';
import './App.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Homepage from './Pages/HomePage/Homepage';
import Accountpage from './Pages/AccountPage/Accountpage';
import Registerpage from './Pages/AccountPage/Registerpage';
import ProductDetailPage from './Pages/ProductDetailPage/ProductDetailPage';
import Cart from './component/Cart/Cart';
import useNotification from './component/Customhook/useNotification';
import BestSellerPage from './Pages/BestSellerPage/BestSellerPage';
import Profile from './component/Account/Profile/Profile';
import ForgotPassword from './component/Account/Forget/Forget';
import SearchResults from './Pages/SearchResultPage/SearchResultPage';
import CategoryProductsPage from './Pages/CategoryProductsPage/CategoryProductsPage';
import ProtectedRoute from './routes/ProtectedRoute';
import AllProductsPage from './Pages/AllProductsPage/AllProductsPage';
import ContactPage from './Pages/ContactPage/ContactPage';
import BrandPage from './Pages/BrandPage/BrandPage';
import NewCollectionPage from './Pages/NewCollectionPage/NewCollectionPage';
import CheckoutPage from './Pages/CheckoutPage/CheckoutPage';
import OrderSuccessPage from './Pages/OrderSuccessPage/OrderSuccessPage';
import MyOrders from './component/Account/MyOrders/MyOrders';
import Layout from './component/Layout/Layout';
import Notification from './component/Notification/Notification';

const App = () => {
  const { notification, hideNotification } = useNotification();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/order-success/" element={<OrderSuccessPage />} />
          <Route path="/login/" element={<Accountpage />} />
          <Route path="/register/" element={<Registerpage />} />
          <Route path="/allproducts/" element={<AllProductsPage />} />
          <Route path="/contactus/" element={<ContactPage />} />
          <Route path="/brand/" element={<BrandPage />} />
          <Route path="/newcollection/" element={<NewCollectionPage />} />
          <Route path="/product/:id/" element={<ProductDetailPage />} />
          <Route path="/bestseller/" element={<BestSellerPage />} />
          <Route path="/search/" element={<SearchResults />} />
          <Route path="/category/:category_id/products/" element={<CategoryProductsPage />} />
          <Route path="/forgot-password/" element={<ForgotPassword />} />
          <Route path="/reset-password/:uidb64/:token/" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route path="/cart/" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/profile/" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/myorders/" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/checkout/" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        </Route>
      </Routes>

      {/* Global Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </BrowserRouter>
  );
};

export default App;
