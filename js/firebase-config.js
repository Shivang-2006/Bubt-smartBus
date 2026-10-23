// ========================================
// Firebase Web SDK Configuration
// ========================================
// Firebase v10+ (Modular SDK) — CDN Imports

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Firebase Configuration ──
const firebaseConfig = {
    apiKey: "AIzaSyDJmFroVCpTFAxD0n035fd1vCfIrZceyqk",
    authDomain: "smart-campus-bus-2bc13.firebaseapp.com",
    projectId: "smart-campus-bus-2bc13",
    storageBucket: "smart-campus-bus-2bc13.firebasestorage.app",
    messagingSenderId: "445243680063",
    appId: "1:445243680063:web:46cebd5f54d97ef9cb1f8a"
};

// ── Initialize Firebase ──
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("✅ Firebase initialized successfully");

// ── Export for use in other modules ──
export { app, auth, db };

