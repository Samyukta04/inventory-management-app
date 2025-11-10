// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEVde9LIILto_CRIbkMSlavkh9trpqbkM",
  authDomain: "inventory-management-1dc35.firebaseapp.com",
  projectId: "inventory-management-1dc35",
  storageBucket: "inventory-management-1dc35.appspot.com",
  messagingSenderId: "1077980473979",
  appId: "1:1077980473979:web:0e3f0f39d4e3e02eeb90de",
  measurementId: "G-2RHD5G60SD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics only on client side
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

const firestore = getFirestore(app);
const auth = getAuth(app);

export { firestore, auth, GoogleAuthProvider, analytics };
