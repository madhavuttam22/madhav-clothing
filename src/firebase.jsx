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
  apiKey: "AIzaSyBhjTfwSoT3fZA-l67yMHevi-lf8Wo7IhM",
  authDomain: "madhav-clothing.firebaseapp.com",
  projectId: "madhav-clothing",
  storageBucket: "madhav-clothing.firebasestorage.app",
  messagingSenderId: "844271926850",
  appId: "1:844271926850:web:a9627c333f140ebbbbf7db"
};

// Initialize Firebase application
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Export authentication service for use throughout the application
export { auth };