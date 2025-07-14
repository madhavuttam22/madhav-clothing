/**
 * Firebase Configuration and Initialization
 * 
 * This file configures and initializes Firebase services for the e-commerce application.
 * Currently implements Firebase Authentication service.
 */

// Import required Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Authentication service import

/**
 * Firebase configuration object
 * @constant {Object} firebaseConfig
 * @property {string} apiKey - API key for Firebase project
 * @property {string} authDomain - Authorized domain for authentication
 * @property {string} projectId - Firebase project ID
 * @property {string} storageBucket - Cloud Storage bucket
 * @property {string} messagingSenderId - Cloud Messaging sender ID
 * @property {string} appId - Firebase app ID
 * @property {string} measurementId - Google Analytics measurement ID (optional)
 */
const firebaseConfig = {
  apiKey: "AIzaSyApAwk0A5SC5Iesj0MEIuiBu8BKbhwQc5M",
  authDomain: "ecommerce-auth-b6280.firebaseapp.com",
  projectId: "ecommerce-auth-b6280",
  storageBucket: "ecommerce-auth-b6280.firebasestorage.app",
  messagingSenderId: "66138807030",
  appId: "1:66138807030:web:7975adb0705668607eaad7",
  measurementId: "G-8YZZE3BRSX"
};

// Initialize Firebase application
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Export authentication service for use throughout the application
export { auth };