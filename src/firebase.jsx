// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ✅ THIS IMPORT IS MANDATORY

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApAwk0A5SC5Iesj0MEIuiBu8BKbhwQc5M",
  authDomain: "ecommerce-auth-b6280.firebaseapp.com",
  projectId: "ecommerce-auth-b6280",
  storageBucket: "ecommerce-auth-b6280.firebasestorage.app",
  messagingSenderId: "66138807030",
  appId: "1:66138807030:web:7975adb0705668607eaad7",
  measurementId: "G-8YZZE3BRSX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); // ✅ initialize the app
const auth = getAuth(app); // ✅ use the app here

export { auth };