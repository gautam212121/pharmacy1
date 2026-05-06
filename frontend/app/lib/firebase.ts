import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAS2fX-midOHi4IQAkShhX_cj8cqKwW4iM",
  authDomain: "e-commerce-dabe5.firebaseapp.com",
  projectId: "e-commerce-dabe5",
  storageBucket: "e-commerce-dabe5.firebasestorage.app",
  messagingSenderId: "873298397622",
  appId: "1:873298397622:web:c2945efca7e4cbf22e1917",
  measurementId: "G-HHZKKT0PD7",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);