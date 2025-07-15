/**
 * Main Application Component
 * 
 * This is the root component of the React e-commerce application.
 * It sets up routing for all pages and manages global notification state.
 */

import React, { useEffect, useState } from 'react'
import './App.css'
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Homepage from './Pages/HomePage/Homepage';
import { BrowserRouter,Routes,Route } from 'react-router-dom'; 
import Accountpage from './Pages/AccountPage/Accountpage';
import Registerpage from './Pages/AccountPage/Registerpage';
import axios from 'axios';
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

const App = () => {
  // Notification hook for displaying global alerts/notifications
  const { notification, hideNotification } = useNotification();
    
  return (
    <>
      {/* Main application router */}
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path='/' element={<Homepage/>}/>
          <Route path='/order-success/' element={<OrderSuccessPage/>}/>
          <Route path='/login/' element={<Accountpage/>}/>
          <Route path='/register/' element={<Registerpage/>}/>
          <Route path='/allproducts/' element={<AllProductsPage/>}/>
          <Route path='/contactus/' element={<ContactPage/>}/>
          <Route path='/brand/' element={<BrandPage/>}/>
          <Route path='/newcollection/' element={<NewCollectionPage/>}/>
          <Route path="/product/:id/" element={<ProductDetailPage />} />
          <Route path='/bestseller/' element={<BestSellerPage/>}/>
          <Route path="/search/" element={<SearchResults />} />
          <Route path="/category/:category_id/products/" element={<CategoryProductsPage />} />
          <Route path="/forgot-password/" element={<ForgotPassword />} />
          <Route path="/reset-password/:uidb64/:token/" element={<ForgotPassword />} />

          {/* Protected Routes (require authentication) */}
          <Route path='/cart/' element={<ProtectedRoute><Cart/></ProtectedRoute>}/>
          <Route path='/profile/' element={<Profile/>}/>
          <Route path='/myorders/' element={<MyOrders/>}/>
          <Route path='/checkout/' element={<CheckoutPage/>}/>
          </Route>
        </Routes>
      </BrowserRouter>

      {/* Global Notification Component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </>
  )
}

export default App