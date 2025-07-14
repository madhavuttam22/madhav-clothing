import React from 'react'
import Header from '../../component/Header/Header'
import Footer from '../../component/Footer/Footer'
import Register from '../../component/Account/Register/Register'

/**
 * RegisterPage Component
 * 
 * The user registration page of the application.
 * Provides a consistent layout structure containing:
 * - Global header navigation
 * - User registration form
 * - Global footer
 * 
 * Typically accessed via '/register' route.
 * Maintains consistent styling and structure with other pages.
 */
const Registerpage = () => {
  return (
    <>
      {/* Application header with navigation */}
      <Header/>
      
      {/* Registration form component */}
      <Register/>
      
      {/* Global footer with links and information */}
      <Footer/>
    </>
  )
}

export default Registerpage