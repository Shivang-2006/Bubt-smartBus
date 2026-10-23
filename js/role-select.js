import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Check if user is already logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const profile = docSnap.data();
                if (profile.status === 'blocked') return;
                if (profile.role === 'driver' && profile.status !== 'active') return;

                let target = "/pages/student-dashboard.html";
                if (profile.role === "admin" || profile.adminLevel === "main" || profile.adminLevel === "co") {
                    target = "/pages/admin-dashboard.html";
                } else if (profile.role === "driver") {
                    target = "/pages/driver-dashboard.html";
                }
                console.log(`Active session found (${profile.role}). Redirecting to ${target}`);
                window.location.replace(target);
            }
        } catch (e) {
            console.error("Role select auth check error:", e);
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚌 Role Selection Page Loaded");

    initCardAnimations();
    initCardKeyboardNav();
});

// ── Staggered Card Entrance Animations ──
function initCardAnimations() {
    const cards = document.querySelectorAll(".role-select-card");

    cards.forEach((card, index) => {
        // Initial state for entrance animation
        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";

        // Stagger the animation
        setTimeout(() => {
            card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, 100 + index * 120);
    });
}

// ── Keyboard Navigation for Role Cards ──
function initCardKeyboardNav() {
    const cards = document.querySelectorAll(".role-select-card");

    cards.forEach((card) => {
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                card.click();
            }
        });
    });
}
