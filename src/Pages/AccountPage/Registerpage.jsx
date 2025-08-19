import React, { useEffect } from "react";
import Register from "../../component/Account/Register/Register";

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
  useEffect(() => {
    document.title = "Register | Madhav Clothing";
  }, []);
  return (
    <>
      {/* Registration form component */}
      <Register />
    </>
  );
};

export default Registerpage;
