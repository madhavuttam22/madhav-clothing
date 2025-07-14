import { auth } from "../firebase";

/**
 * Checks user authentication status and handles redirection if not authenticated
 * 
 * @param {function} navigate - Navigation function from react-router-dom
 * @param {string} [currentPath="/"] - The current path to store in state for redirect after login
 * @returns {Promise<string|null>} - Returns Firebase ID token if authenticated, otherwise null
 * 
 * @example
 * // In a component:
 * const token = await checkAuthAndRedirect(navigate, '/protected-route');
 * if (token) {
 *   // make authenticated request
 * }
 */
const checkAuthAndRedirect = async (navigate, currentPath = "/") => {
  // Get current Firebase user
  const user = auth.currentUser;

  // If no user is logged in, redirect to login page
  if (!user) {
    navigate("/login", { 
      state: { 
        from: currentPath  // Store current path for post-login redirect
      } 
    });
    return null;
  }

  // User is authenticated - get and return ID token
  const token = await user.getIdToken();
  return token;
};

export default checkAuthAndRedirect;