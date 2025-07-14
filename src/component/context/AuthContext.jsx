// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Authentication Context
 * 
 * Provides user authentication state throughout the application
 * Uses Firebase authentication to track user login state
 */

// Create authentication context with default value
const AuthContext = createContext();

/**
 * AuthProvider Component
 * 
 * Wraps application to provide authentication state to all child components
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to be wrapped
 * @returns {JSX.Element} Context Provider component
 */
export const AuthProvider = ({ children }) => {
  // State to store current authenticated user
  // null = not loaded, undefined = no user, object = authenticated user
  const [user, setUser] = useState(null);

  /**
   * Effect hook to subscribe to Firebase authentication state changes
   * Runs once on component mount and cleans up on unmount
   */
  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Update state with current user (or null if signed out)
      setUser(currentUser);
    });

    // Cleanup function to unsubscribe when component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Provide authentication context to child components
  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context
 * 
 * @returns {Object} Context value containing user authentication state
 * @property {Object|null} user - Current authenticated user or null
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Throw error if used outside of AuthProvider
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};