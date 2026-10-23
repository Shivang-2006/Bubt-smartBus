// ========================================
// Smart Campus Bus — Auth Pages (Login / Register)
// ========================================
// Handles role-based UI theming, form validation,
// password toggle, and real Firebase Authentication.

import { auth, db } from "./firebase-config.js";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendPasswordResetEmail,
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { API_BASE_URL } from "./api.js";

// ── Role Configuration ──
const ROLE_CONFIG = {
    student: {
        icon: "🎓",
        label: "Student",
        cardClass: "auth__card--student",
        badgeClass: "auth__role-badge--student",
        submitClass: "auth__submit--student",
        inputClass: "form-group__input--student",
        hasRegister: true,
    },
    driver: {
        icon: "🚐",
        label: "Driver",
        cardClass: "auth__card--driver",
        badgeClass: "auth__role-badge--driver",
        submitClass: "auth__submit--driver",
        inputClass: "form-group__input--driver",
        hasRegister: true,
    },
    admin: {
        icon: "🛡️",
        label: "Admin",
        cardClass: "auth__card--admin",
        badgeClass: "auth__role-badge--admin",
        submitClass: "auth__submit--admin",
        inputClass: "form-group__input--admin",
        hasRegister: false, // Admin cannot register
    },
};

// Tracks when an explicit sign-in / sign-up flow is running on this page.
// While true, checkExistingSession must NOT auto-redirect, otherwise the
// redirect would race (and bypass) the flow's own validation & prompts.
let isAuthFlowActive = false;

// ── Initialize ──
document.addEventListener("DOMContentLoaded", async () => {
    const role = getRoleFromURL();
    console.log(`🚌 Auth Page Loaded — Role: ${role}`);

    applyRoleTheme(role);
    initRoleDropdown(role);
    initPasswordToggle();
    initFormValidation(role);
    handleAdminRestrictions(role);
    updateNavigationLinks(role);
    initForgotPassword();
    initGoogleSignIn(role);

    checkExistingSession();
});

// ── Prompt Co-Admin Dashboard Choice Modal ──
function promptCoAdminDashboardChoice(profile) {
    return new Promise((resolve) => {
        // Remove any existing modal
        const existing = document.querySelector(".coadmin-modal-overlay");
        if (existing) existing.remove();

        const overlay = document.createElement("div");
        overlay.className = "coadmin-modal-overlay";
        overlay.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.65);
            display: flex; align-items: center; justify-content: center;
            z-index: 9999; backdrop-filter: blur(8px); padding: 1.5rem;
        `;

        overlay.innerHTML = `
            <div style="background: var(--bg-surface); border: 1px solid var(--border-card); border-radius: 16px; max-width: 440px; width: 100%; padding: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.3); text-align: center; font-family: var(--font-family);">
                <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🛡️ 🎓</div>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">Co-Admin Privileges</h3>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5;">
                    Welcome, <strong>${profile.name || 'User'}</strong>! You have access to both Student and Admin portals. Which dashboard would you like to enter?
                </p>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <button id="choice-student" style="display: flex; align-items: center; justify-content: center; gap: 0.6rem; padding: 0.9rem; border-radius: 10px; background: rgba(37, 99, 235, 0.1); color: var(--accent-primary); border: 1.5px solid rgba(37, 99, 235, 0.3); font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s;">
                        <span>🎓</span> Enter Student Dashboard
                    </button>
                    <button id="choice-admin" style="display: flex; align-items: center; justify-content: center; gap: 0.6rem; padding: 0.9rem; border-radius: 10px; background: var(--accent-primary); color: #fff; border: none; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s;">
                        <span>🛡️</span> Enter Admin Dashboard
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector("#choice-student").addEventListener("click", () => {
            overlay.remove();
            resolve("student-dashboard.html");
        });

        overlay.querySelector("#choice-admin").addEventListener("click", () => {
            overlay.remove();
            resolve("admin-dashboard.html");
        });
    });
}

// ── Check Existing Session (Redirect if already logged in) ──
function checkExistingSession() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // An explicit sign-in/sign-up flow owns validation & redirect
            if (isAuthFlowActive) return;
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const profile = docSnap.data();
                    if (profile.status === 'blocked') return;
                    if (profile.role === 'driver' && profile.status !== 'active') return;

                    const params = new URLSearchParams(window.location.search);
                    const currentRoleParam = params.get("role");

                    let target = "student-dashboard.html";
                    if (profile.role === "admin" || profile.adminLevel === "main") {
                        target = "admin-dashboard.html";
                    } else if (profile.role === "driver") {
                        target = "driver-dashboard.html";
                    } else if (profile.role === "student") {
                        target = "student-dashboard.html";
                    } else if (profile.adminLevel === "co") {
                        if (currentRoleParam === "admin") {
                            target = "admin-dashboard.html";
                        } else if (currentRoleParam === "student") {
                            target = "student-dashboard.html";
                        } else {
                            target = await promptCoAdminDashboardChoice(profile);
                        }
                    }

                    console.log(`Active session found (${profile.role}). Redirecting to ${target}`);
                    window.location.replace(target);
                } else {
                    // User is authenticated in Firebase Auth (e.g. from Google login) but no Firestore profile yet
                    console.log("Authenticated user without Firestore profile. Auto-creating student profile...");
                    const newProfile = {
                        uid: user.uid,
                        name: user.displayName || (user.email ? user.email.split('@')[0] : 'Student'),
                        email: user.email,
                        role: 'student',
                        status: 'active',
                        assignedBus: null,
                        createdAt: serverTimestamp()
                    };
                    try {
                        await setDoc(docRef, newProfile);
                    } catch (e) {
                        console.warn("setDoc in checkExistingSession error:", e);
                    }
                    console.log("Redirecting to student-dashboard.html");
                    window.location.replace("student-dashboard.html");
                }
            } catch (err) {
                console.error("Auth session check error:", err);
            }
        }
    });
}

// ── Get Role from URL ──
function getRoleFromURL() {
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");

    // Default to student if no valid role
    if (!role || !ROLE_CONFIG[role]) {
        return "student";
    }

    return role;
}

// ── Apply Role-Based Theme ──
function applyRoleTheme(role) {
    const config = ROLE_CONFIG[role];
    if (!config) return;

    // Update role badge
    const roleBadge = document.getElementById("auth-role-badge");
    const roleIcon = document.getElementById("auth-role-icon");
    const roleLabel = document.getElementById("auth-role-label");

    if (roleBadge) {
        // Remove existing role classes
        Object.values(ROLE_CONFIG).forEach((c) => {
            roleBadge.classList.remove(c.badgeClass);
        });
        roleBadge.classList.add(config.badgeClass);
    }

    if (roleIcon) roleIcon.textContent = config.icon;
    if (roleLabel) roleLabel.textContent = config.label;

    // Update card accent
    const authCard = document.getElementById("auth-card");
    if (authCard) {
        Object.values(ROLE_CONFIG).forEach((c) => {
            authCard.classList.remove(c.cardClass);
        });
        authCard.classList.add(config.cardClass);
    }

    // Update submit button
    const submitBtn = document.getElementById("auth-submit");
    if (submitBtn) {
        Object.values(ROLE_CONFIG).forEach((c) => {
            submitBtn.classList.remove(c.submitClass);
        });
        submitBtn.classList.add(config.submitClass);
    }

    // Update input focus colors
    const inputs = document.querySelectorAll(".form-group__input");
    inputs.forEach((input) => {
        Object.values(ROLE_CONFIG).forEach((c) => {
            input.classList.remove(c.inputClass);
        });
        input.classList.add(config.inputClass);
    });

    // Update page title
    const isLogin = window.location.pathname.includes("login");
    document.title = `${isLogin ? "Login" : "Register"} as ${config.label} | Smart Campus Bus`;
}

// ── Handle Admin Restrictions ──
function handleAdminRestrictions(role) {
    if (role !== "admin") return;

    // If admin tries to access register page, redirect to login
    const isRegister = window.location.pathname.includes("register");
    if (isRegister) {
        window.location.href = "login.html?role=admin";
        return;
    }

    // Hide register link on login page for admin
    const authFooter = document.getElementById("auth-footer");
    if (authFooter) {
        authFooter.style.display = "none";
    }

    // Hide Google Sign-In button and divider for admin (Admin logs in manually)
    const googleBtn = document.getElementById("auth-google-btn");
    if (googleBtn) {
        googleBtn.style.display = "none";
    }
    const divider = document.getElementById("auth-divider");
    if (divider) {
        divider.style.display = "none";
    }
}

// ── Update Navigation Links with Role Param ──
function updateNavigationLinks(role) {
    // Update register link on login page
    const registerLink = document.getElementById("auth-register-link");
    if (registerLink) {
        registerLink.href = `register.html?role=${role}`;
    }

    // Update login link on register page
    const loginLink = document.getElementById("auth-login-link");
    if (loginLink) {
        loginLink.href = `login.html?role=${role}`;
    }
}

// ── Role Dropdown Switcher ──
function initRoleDropdown(currentRole) {
    const switcher = document.getElementById("auth-role-switcher");
    const badgeBtn = document.getElementById("auth-role-badge");
    const dropdown = document.getElementById("auth-role-dropdown");

    if (!switcher || !badgeBtn || !dropdown) return;

    // Toggle dropdown on badge click
    badgeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = switcher.classList.toggle("is-open");
        badgeBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
        if (!switcher.contains(e.target)) {
            switcher.classList.remove("is-open");
            badgeBtn.setAttribute("aria-expanded", "false");
        }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            switcher.classList.remove("is-open");
            badgeBtn.setAttribute("aria-expanded", "false");
        }
    });

    // Handle role option clicks
    const options = switcher.querySelectorAll(".auth__role-option");
    const isRegister = window.location.pathname.includes("register");

    options.forEach((opt) => {
        const targetRole = opt.dataset.role;

        // Highlight active role
        if (targetRole === currentRole) {
            opt.classList.add("auth__role-option--active");
        } else {
            opt.classList.remove("auth__role-option--active");
        }

        opt.addEventListener("click", (e) => {
            e.preventDefault();
            if (targetRole === currentRole) {
                switcher.classList.remove("is-open");
                return;
            }

            // If switching to admin from register page, redirect to login.html?role=admin
            if (isRegister && targetRole === "admin") {
                window.location.href = "login.html?role=admin";
                return;
            }

            const targetPage = isRegister ? "register.html" : "login.html";
            window.location.href = `${targetPage}?role=${targetRole}`;
        });
    });
}

// ── Password Toggle ──
function initPasswordToggle() {
    const toggles = document.querySelectorAll(".form-group__toggle-password");

    const eyeSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    const eyeOffSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';

    toggles.forEach((toggle) => {
        toggle.innerHTML = eyeSvg;
        toggle.addEventListener("click", () => {
            const wrapper = toggle.closest(".form-group__input-wrapper");
            const input = wrapper.querySelector(".form-group__input");

            if (input.type === "password") {
                input.type = "text";
                toggle.innerHTML = eyeOffSvg;
            } else {
                input.type = "password";
                toggle.innerHTML = eyeSvg;
            }
        });
    });
}

// ── Form Validation (UI Only — Phase 1) ──
function initFormValidation(role) {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleLoginSubmit(role);
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleRegisterSubmit(role);
        });

    }
}

// ── Login Form Submit Handler ──
async function handleLoginSubmit(role) {
    let isValid = true;

    // Validate email
    const email = document.getElementById("login-email");
    const emailGroup = document.getElementById("form-group-email");
    if (!email.value || !isValidEmail(email.value)) {
        emailGroup.classList.add("form-group--error");
        isValid = false;
    } else {
        emailGroup.classList.remove("form-group--error");
    }

    // Validate password
    const password = document.getElementById("login-password");
    const passwordGroup = document.getElementById("form-group-password");
    if (!password.value) {
        passwordGroup.classList.add("form-group--error");
        isValid = false;
    } else {
        passwordGroup.classList.remove("form-group--error");
    }

    if (isValid) {
        const submitBtn = document.getElementById("auth-submit");
        const loadingOverlay = document.getElementById("auth-loading");
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = "Signing In...";
        submitBtn.disabled = true;
        if(loadingOverlay) loadingOverlay.style.display = "flex";

        isAuthFlowActive = true;

        try {
            // 1. Authenticate with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
            const user = userCredential.user;

            // 2. Fetch User Profile from Firestore
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const profile = docSnap.data();

                // 3. Verify Role Mismatch & Strict Role Separation
                if (role === 'driver') {
                    if (profile.role === 'student') {
                        await auth.signOut();
                        const msg = 'This account is registered as a Student. A Student account cannot log in as a Driver.';
                        if (window.showToast) window.showToast(msg, 'error', 6000);
                        else alert(msg);
                        return;
                    }
                    if (profile.role !== 'driver') {
                        await auth.signOut();
                        const msg = `This account is registered as a ${profile.role}. Please switch roles.`;
                        if (window.showToast) window.showToast(msg, 'error', 6000);
                        else alert(msg);
                        return;
                    }
                } else if (role === 'student') {
                    if (profile.role === 'driver') {
                        await auth.signOut();
                        const msg = 'This account is registered as a Driver. A Driver account cannot log in as a Student.';
                        if (window.showToast) window.showToast(msg, 'error', 6000);
                        else alert(msg);
                        return;
                    }
                } else if (role === 'admin') {
                    if (profile.role === 'driver') {
                        await auth.signOut();
                        const msg = 'Access Denied: Driver accounts do not have Admin privileges.';
                        if (window.showToast) window.showToast(msg, 'error', 6000);
                        else alert(msg);
                        return;
                    }
                    const isAdmin = profile.role === 'admin' || profile.adminLevel === 'main' || profile.adminLevel === 'co';
                    if (!isAdmin) {
                        await auth.signOut();
                        const msg = 'Access Denied: This Student account does not have Admin privileges.';
                        if (window.showToast) window.showToast(msg, 'error', 6000);
                        else alert(msg);
                        return;
                    }
                }

                // 3.5 Email verification check bypassed - direct login allowed
                
                // 4. Verify Driver Approval Status
                if (role === 'driver' && profile.status === 'pending') {
                    await auth.signOut();
                    if(window.showToast) window.showToast("Your driver account is pending admin approval. You cannot log in yet.", 'warning');
                    else alert("Your driver account is pending admin approval. You cannot log in yet.");
                    return;
                } else if (role === 'driver' && profile.status === 'rejected') {
                    await auth.signOut();
                    if(window.showToast) window.showToast("Your driver account application was rejected.", 'error');
                    else alert("Your driver account application was rejected.");
                    return;
                }

                // 5. Co-Admin choice if logging in from student role (or role-select)
                if (profile.adminLevel === 'co') {
                    let targetDashboard;
                    if (role === 'admin') {
                        targetDashboard = "admin-dashboard.html";
                    } else if (role === 'student') {
                        targetDashboard = await promptCoAdminDashboardChoice(profile);
                    } else {
                        targetDashboard = await promptCoAdminDashboardChoice(profile);
                    }
                    if(window.showToast) window.showToast("Login successful! Redirecting...", 'success');
                    setTimeout(() => {
                        window.location.replace(targetDashboard);
                    }, 500);
                    return;
                }

                // 6. Success - Redirect directly to target dashboard
                let targetPage = "student-dashboard.html";
                if (profile.role === 'admin' || profile.adminLevel === 'main' || profile.adminLevel === 'co') targetPage = "admin-dashboard.html";
                else if (profile.role === 'driver') targetPage = "driver-dashboard.html";

                if(window.showToast) window.showToast("Login successful! Redirecting...", 'success');
                setTimeout(() => {
                    window.location.replace(targetPage);
                }, 800);
                return;
            } else {
                await auth.signOut();
                if(window.showToast) window.showToast("This account is not registered yet. Please create an account first.", 'error');
                else alert("This account is not registered yet. Please create an account first.");
            }
        } catch (error) {
            console.error("Login Error:", error);
            
            let errorMessage = "An error occurred during login.";
            if (error.code === 'auth/invalid-credential') {
                errorMessage = "Invalid email/password or account is not registered yet. Please check or register first.";
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = "This account is not registered yet. Please create an account first.";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Incorrect password. Please try again.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many failed attempts. Please try again later.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            if(window.showToast) window.showToast(errorMessage, 'error');
            else alert(errorMessage);
        }

        // Reset UI if not redirected
        isAuthFlowActive = false;
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        if(loadingOverlay) loadingOverlay.style.display = "none";
    }
}

// ── Register Form Submit Handler ──
async function handleRegisterSubmit(role) {
    if (role === "admin") {
        if (window.showToast) window.showToast("Admin accounts cannot be registered publicly.", "error");
        else alert("Admin accounts cannot be registered publicly.");
        window.location.href = "login.html?role=admin";
        return;
    }

    let isValid = true;

    // Validate name
    const name = document.getElementById("register-name");
    const nameGroup = document.getElementById("form-group-name");
    if (!name.value.trim()) {
        nameGroup.classList.add("form-group--error");
        isValid = false;
    } else {
        nameGroup.classList.remove("form-group--error");
    }

    // Validate email
    const email = document.getElementById("register-email");
    const emailGroup = document.getElementById("form-group-email");
    if (!email.value || !isValidEmail(email.value)) {
        emailGroup.classList.add("form-group--error");
        isValid = false;
    } else {
        emailGroup.classList.remove("form-group--error");
    }

    // Validate password
    const password = document.getElementById("register-password");
    const passwordGroup = document.getElementById("form-group-password");
    if (!password.value || password.value.length < 6) {
        passwordGroup.classList.add("form-group--error");
        isValid = false;
    } else {
        passwordGroup.classList.remove("form-group--error");
    }

    // Validate confirm password
    const confirmPassword = document.getElementById("register-confirm-password");
    const confirmGroup = document.getElementById("form-group-confirm-password");
    if (!confirmPassword.value || confirmPassword.value !== password.value) {
        confirmGroup.classList.add("form-group--error");
        isValid = false;
    } else {
        confirmGroup.classList.remove("form-group--error");
    }

    // Bus selection for drivers is handled by admins in Phase 3+
    let selectedBus = null;

    if (isValid) {
        const submitBtn = document.getElementById("auth-submit");
        const loadingOverlay = document.getElementById("auth-loading");
        const loadingText = document.getElementById("auth-loading-text");
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = "Creating Account...";
        submitBtn.disabled = true;
        if(loadingOverlay) {
            if(loadingText) loadingText.textContent = "Creating Account...";
            loadingOverlay.style.display = "flex";
        }

        isAuthFlowActive = true;

        try {
            // 1. Create User in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
            const user = userCredential.user;

            // 2. Remove Firebase's default email verification link
            console.log("Registration successful, redirecting to OTP verification.");

            // 3. Create User Profile in Firestore
            const status = role === "driver" ? "pending" : "active";
            
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name.value.trim(),
                email: email.value,
                role: role,
                status: "active",
                assignedBus: selectedBus,
                emailVerified: true,
                createdAt: serverTimestamp()
            });

            // 4. Bypass OTP completely — Immediately redirect to respective role dashboard
            if (window.showToast) {
                window.showToast("Account created successfully! Entering dashboard...", 'success', 2000);
            }
            
            let targetDashboard = "/pages/student-dashboard.html";
            if (role === "admin") {
                targetDashboard = "/pages/admin-dashboard.html";
            } else if (role === "driver") {
                targetDashboard = "/pages/driver-dashboard.html";
            }

            setTimeout(() => {
                window.location.replace(targetDashboard);
            }, 600);
            
            return;
            
        } catch (error) {
            console.error("Registration Error:", error);
            
            let errorMessage = "An error occurred during registration.";
            if (error.code === 'auth/email-already-in-use') {
                try {
                    const q = query(collection(db, "users"), where("email", "==", email.value.trim()));
                    const querySnap = await getDocs(q);
                    if (!querySnap.empty) {
                        const existingUser = querySnap.docs[0].data();
                        if (existingUser.role !== role) {
                            errorMessage = `This email is already registered as a ${existingUser.role}. A ${existingUser.role} account cannot be registered as a ${role}.`;
                        } else {
                            errorMessage = `This account is already registered as a ${role}. Please sign in instead.`;
                        }
                    } else {
                        errorMessage = "This account is already registered. Please sign in instead.";
                    }
                } catch (e) {
                    errorMessage = "This account is already registered. Please sign in instead.";
                }
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password is too weak. Must be at least 6 characters.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            if(window.showToast) window.showToast(errorMessage, 'error', 6000);
            else alert(errorMessage);
        }

        // Reset UI if error occurred
        isAuthFlowActive = false;
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        if(loadingOverlay) loadingOverlay.style.display = "none";
    }
}

// ── Email Validation Helper ──
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ── Clear Error on Input ──
document.addEventListener("input", (e) => {
    if (e.target.classList.contains("form-group__input")) {
        const group = e.target.closest(".form-group");
        if (group) {
            group.classList.remove("form-group--error");
        }
    }
});

// ── Forgot Password Logic ──
function initForgotPassword() {
    const forgotLink = document.getElementById("auth-forgot");
    if (forgotLink) {
        forgotLink.addEventListener("click", async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById("login-email");
            const email = emailInput ? emailInput.value : "";
            
            if (!email || !isValidEmail(email)) {
                if(window.showToast) window.showToast("Please enter a valid email address first.", "warning");
                else alert("Please enter a valid email address first.");
                
                if (emailInput) emailInput.focus();
                return;
            }
            
            try {
                const submitBtn = document.getElementById("auth-submit");
                if (submitBtn) submitBtn.disabled = true;
                
                await sendPasswordResetEmail(auth, email);
                
                if(window.showToast) window.showToast(`Password reset link sent to ${email}`, "success", 5000);
                else alert(`Password reset link sent to ${email}`);
                
            } catch (error) {
                console.error("Forgot Password Error:", error);
                let errorMessage = "Failed to send reset email.";
                if (error.code === 'auth/user-not-found') {
                    errorMessage = "No account found with this email.";
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                if(window.showToast) window.showToast(errorMessage, "error");
                else alert(errorMessage);
            } finally {
                const submitBtn = document.getElementById("auth-submit");
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
}
// ── Process Google User Profile & Role Validations ──
async function processGoogleUser(user, role, isRegister) {
    try {
        console.log(`Processing Google user: ${user.email} (role: ${role})`);
        
        // 1. Fetch user profile from Firestore by UID
        const docRef = doc(db, 'users', user.uid);
        let docSnap = null;
        try {
            docSnap = await getDoc(docRef);
        } catch (fetchErr) {
            console.warn("Firestore getDoc error (using auth profile):", fetchErr);
        }

        // 2. If profile already exists in Firestore
        if (docSnap && docSnap.exists()) {
            const profile = docSnap.data();

            // Strict Role Separation
            if (role === 'driver' && profile.role === 'student') {
                await auth.signOut();
                const msg = 'This Google account is registered as a Student. A Student account cannot log in as a Driver.';
                if (window.showToast) window.showToast(msg, 'error', 6000);
                else alert(msg);
                return;
            }
            if (role === 'student' && profile.role === 'driver') {
                await auth.signOut();
                const msg = 'This Google account is registered as a Driver. A Driver account cannot log in as a Student.';
                if (window.showToast) window.showToast(msg, 'error', 6000);
                else alert(msg);
                return;
            }
            if (role === 'admin') {
                const isAdmin = profile.role === 'admin' || profile.adminLevel === 'main' || profile.adminLevel === 'co';
                if (!isAdmin) {
                    await auth.signOut();
                    const msg = 'Access Denied: This account does not have Admin privileges.';
                    if (window.showToast) window.showToast(msg, 'error', 6000);
                    else alert(msg);
                    return;
                }
            }

            // Driver pending/rejected handling
            if (role === 'driver' && profile.status === 'pending') {
                await auth.signOut();
                const msg = 'Your driver account is pending admin approval. You cannot log in yet.';
                if (window.showToast) window.showToast(msg, 'warning');
                else alert(msg);
                return;
            }
            if (role === 'driver' && profile.status === 'rejected') {
                await auth.signOut();
                const msg = 'Your driver account application was rejected.';
                if (window.showToast) window.showToast(msg, 'error');
                else alert(msg);
                return;
            }

            // Co-Admin Choice handling
            if (profile.adminLevel === 'co') {
                let targetDashboard;
                if (role === 'admin') {
                    targetDashboard = "admin-dashboard.html";
                } else if (role === 'student') {
                    targetDashboard = await promptCoAdminDashboardChoice(profile);
                } else {
                    targetDashboard = await promptCoAdminDashboardChoice(profile);
                }
                if (window.showToast) window.showToast('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.replace(targetDashboard);
                }, 500);
                return;
            }

            // Redirect directly to dashboard
            let targetPage = "student-dashboard.html";
            if (profile.role === 'admin' || profile.adminLevel === 'main' || profile.adminLevel === 'co') targetPage = "admin-dashboard.html";
            else if (profile.role === 'driver') targetPage = "driver-dashboard.html";

            if (window.showToast) window.showToast('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.replace(targetPage);
            }, 600);
            return;
        }

        // 3. If profile does NOT exist yet (New User)
        if (role === 'student') {
            const newProfile = {
                uid: user.uid,
                name: user.displayName || (user.email ? user.email.split('@')[0] : 'Student'),
                email: user.email,
                role: 'student',
                status: 'active',
                assignedBus: null,
                createdAt: serverTimestamp()
            };
            try {
                await setDoc(docRef, newProfile);
            } catch (setErr) {
                console.warn("Firestore setDoc warning:", setErr);
            }

            if (window.showToast) window.showToast('Welcome! Your student account is ready.', 'success', 3000);
            setTimeout(() => {
                window.location.replace('student-dashboard.html');
            }, 600);
            return;
        }

        if (role === 'driver') {
            if (!isRegister) {
                await auth.signOut();
                const msg = 'This Driver account is not registered yet. Please register first for admin approval.';
                if (window.showToast) window.showToast(msg, 'error', 5000);
                else alert(msg);
                return;
            }

            const newDriverProfile = {
                uid: user.uid,
                name: user.displayName || (user.email ? user.email.split('@')[0] : 'Driver'),
                email: user.email,
                role: 'driver',
                status: 'pending',
                assignedBus: null,
                createdAt: serverTimestamp()
            };
            await setDoc(docRef, newDriverProfile);
            await auth.signOut();
            const msg = 'Registration submitted! Your driver account is pending admin approval.';
            if (window.showToast) window.showToast(msg, 'warning', 6000);
            else alert(msg);
            setTimeout(() => {
                window.location.href = `login.html?role=driver`;
            }, 2000);
            return;
        }

        // Admin cannot register via Google
        await auth.signOut();
        const msg = 'Admin accounts cannot be registered publicly.';
        if (window.showToast) window.showToast(msg, 'error', 5000);
        else alert(msg);

    } catch (err) {
        console.error("Critical error in processGoogleUser:", err);
        const errorMsg = err.message || "Google authentication failed. Please try again.";
        if (window.showToast) window.showToast(errorMsg, 'error', 6000);
        else alert(errorMsg);
    }
}

// ── Google Sign‑In / Sign‑Up Initialization ──
function initGoogleSignIn(role) {
    const btn = document.getElementById('auth-google-btn');
    if (!btn) return;

    // Admin logs in manually with email/password
    if (role === 'admin') {
        btn.style.display = 'none';
        const divider = document.getElementById('auth-divider');
        if (divider) divider.style.display = 'none';
        return;
    }

    const isRegister = window.location.pathname.includes('register');

    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });

    btn.addEventListener('click', async () => {
        isAuthFlowActive = true;

        const loadingOverlay = document.getElementById('auth-loading');
        const loadingText = document.getElementById('auth-loading-text');
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
        if (loadingText) loadingText.textContent = 'Connecting to Google...';

        try {
            // Always use signInWithPopup — works reliably on localhost AND deployed sites (Vercel, etc.)
            // signInWithRedirect has known cross-origin issues with Firebase 10+ modular SDK
            // on third-party hosting, where getRedirectResult() silently returns null.
            console.log('Initiating Google popup sign-in...');
            const result = await signInWithPopup(auth, provider);
            await processGoogleUser(result.user, role, isRegister);
        } catch (error) {
            console.error('Google Sign‑In Error:', error);
            if (error.code === 'auth/unauthorized-domain') {
                const msg = 'This domain is not authorized in Firebase Console. Please add your Vercel domain to Firebase Authentication > Settings > Authorized Domains.';
                if (window.showToast) window.showToast(msg, 'error', 8000);
                else alert(msg);
            } else if (error.code === 'auth/popup-blocked') {
                const msg = 'Popup was blocked by your browser. Please allow popups for this site and try again.';
                if (window.showToast) window.showToast(msg, 'warning', 6000);
                else alert(msg);
            } else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                const msg = error.message || 'Google authentication failed.';
                if (window.showToast) window.showToast(msg, 'error');
                else alert(msg);
            }
        } finally {
            isAuthFlowActive = false;
            if (loadingOverlay) loadingOverlay.style.display = 'none';
        }
    });
}