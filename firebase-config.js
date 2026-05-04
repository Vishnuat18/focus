import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getDatabase, ref, set, get, child, onValue } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";
import { getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, deleteDoc, increment } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhRAWoDuOEG7nOxHPqyYhXKLPLYDjPDIc",
  authDomain: "smack-ef855.firebaseapp.com",
  databaseURL: "https://smack-ef855-default-rtdb.firebaseio.com",
  projectId: "smack-ef855",
  storageBucket: "smack-ef855.firebasestorage.app",
  messagingSenderId: "340654520846",
  appId: "1:340654520846:web:93d16b76e52cdb87c45a5f",
  measurementId: "G-M5GTH10QH3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const fs = getFirestore(app);
const analytics = getAnalytics(app);

// Exporting for use in other scripts
export { 
    auth, db, fs, analytics, 
    ref, set, get, child, onValue,
    doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where,
    onSnapshot, addDoc, serverTimestamp, orderBy, deleteDoc, increment
};
