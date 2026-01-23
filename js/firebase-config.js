// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHYHB81cR19JrF7YILKEDVj8MWH0dH4SE",
  authDomain: "fatimafinds.firebaseapp.com",
  projectId: "fatimafinds",
  storageBucket: "fatimafinds.firebasestorage.app",
  messagingSenderId: "1039056366402",
  appId: "1:1039056366402:web:2b9bca729b6db7ce2336db",
  measurementId: "G-E9T7S1QLQM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);
