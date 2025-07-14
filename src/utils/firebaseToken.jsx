import { auth } from "../firebase";

/**
 * Gets the current user's Firebase authentication token
 * 
 * @returns {Promise<string|null>} - Resolves with the ID token if user is logged in, 
 *                                  otherwise resolves with null
 * 
 * @example
 * // In an async function:
 * const token = await getFirebaseToken();
 * if (token) {
 *   // Include token in API requests
 * }
 */
export const getFirebaseToken = async () => {
  // Get current Firebase user
  const user = auth.currentUser;
  
  // If user exists, return their ID token
  if (user) {
    return await user.getIdToken();
  }
  
  // No user logged in
  return null;
};