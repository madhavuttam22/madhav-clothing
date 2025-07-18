import React, { useEffect } from 'react'
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
  useEffect(()=>{
    document.title = 'Login | RS Clothing'
  },[])
  return (
    <>
     
      
      {/* Main content: Login form component */}
      <Login/>
      
    </>
  )
}

export default Accountpage