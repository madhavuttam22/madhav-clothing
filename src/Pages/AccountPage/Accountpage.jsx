import React from 'react'
import Header from '../../component/Header/Header'
import Footer from '../../component/Footer/Footer'
import Login from '../../component/Account/Login/Login'

/**
 * AccountPage Component
 * 
 * The main account/login page of the application. 
 * Serves as a layout wrapper that combines:
 * - Global header
 * - Login form component
 * - Global footer
 * 
 * This page is typically accessed via '/account' or '/login' routes.
 * Provides consistent layout structure across the application.
 */
const Accountpage = () => {
  return (
    <>
      {/* Render the global header component */}
      <Header/>
      
      {/* Main content: Login form component */}
      <Login/>
      
      {/* Render the global footer component */}
      <Footer/>
    </>
  )
}

export default Accountpage