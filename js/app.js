// ========================================
// Smart Campus Bus — Main Application
// ========================================

import { app, auth, db } from "./firebase-config.js";
import { initAuthGuard } from "./auth-guard.js";

// ── App Initialization ──
document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚌 Smart Campus Bus App Initialized");

    // Initialize animations
    initCounterAnimation();
    initScrollAnimations();
    initHeaderScroll();

    // Check if user is already logged in (update buttons to Dashboard)
    const authData = await initAuthGuard(false);
    if (authData && authData.profile) {
        const profile = authData.profile;
        const role = profile.role;

        let dashboardUrl = "/pages/student-dashboard.html";
        let roleIcon = "🎓";
        let roleName = "Student";

        if (role === 'admin' || profile.adminLevel === 'main' || profile.adminLevel === 'co') {
            dashboardUrl = "/pages/admin-dashboard.html";
            roleIcon = "🛡️";
            roleName = "Admin";
        } else if (role === 'driver') {
            dashboardUrl = "/pages/driver-dashboard.html";
            roleIcon = "🚐";
            roleName = "Driver";
        }

        // Update header button
        const btnRegister = document.getElementById("btn-register");
        if (btnRegister) {
            btnRegister.textContent = `Dashboard (${roleIcon} ${roleName}) →`;
            btnRegister.href = dashboardUrl;
        }

        // Update hero CTA button
        const btnGetStarted = document.getElementById("btn-get-started");
        if (btnGetStarted) {
            btnGetStarted.textContent = `Go to Dashboard →`;
            btnGetStarted.href = dashboardUrl;
        }
    }
});

// ── Counter Animation (Hero Stats) ──
function initCounterAnimation() {
    const counters = document.querySelectorAll("[data-count]");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute("data-count"), 10);
                    animateCounter(el, target);
                    observer.unobserve(el);
                }
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
}

function animateCounter(element, target) {
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * target);

        element.textContent = current.toLocaleString() + (target >= 100 ? "+" : "");

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ── Scroll Reveal Animations ──
function initScrollAnimations() {
    const animateElements = document.querySelectorAll(
        ".feature-card, .step, .role-card"
    );

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger the animation delay
                    setTimeout(() => {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                    }, index * 80);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    animateElements.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        observer.observe(el);
    });
}

// ── Header Background on Scroll ──
function initHeaderScroll() {
    const header = document.getElementById("header");
    if (!header) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.style.background = "var(--bg-surface)";
            header.style.boxShadow = "var(--shadow-md)";
        } else {
            header.style.background = "var(--bg-glass)";
            header.style.boxShadow = "none";
        }
    });
}
