import { app, auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Keep track of auth state
let currentUser = null;
let currentProfile = null;

// Initialize auth listener
export function initAuthGuard(requireAuth = true, allowedRoles = []) {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUser = user;
                
                try {
                    // Fetch user profile from Firestore
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        currentProfile = docSnap.data();
                        
                        // Check if user is blocked
                        if (currentProfile.status === 'blocked') {
                            if (requireAuth) {
                                alert("Your account has been blocked by the administrator.");
                                await logoutUser();
                                window.location.href = "login.html";
                            }
                            return resolve(null);
                        }

                        // Check role authorization if specified
                        if (allowedRoles.length > 0) {
                            let hasRoleAccess = allowedRoles.includes(currentProfile.role);
                            // Admin check override
                            if (allowedRoles.includes('admin') && (currentProfile.adminLevel === 'main' || currentProfile.adminLevel === 'co')) {
                                hasRoleAccess = true;
                            }
                            
                            if (!hasRoleAccess) {
                                console.warn("Unauthorized role. Redirecting...");
                                window.location.href = "/"; // Redirect to home or generic error page
                                return resolve(null);
                            }
                        }
                        
                        // Check driver approval status if applicable
                        if (currentProfile.role === 'driver' && currentProfile.status !== 'active') {
                            // If they are on a protected page but not approved
                            if (requireAuth) {
                                alert("Your driver account is pending admin approval. You cannot access this page yet.");
                                await logoutUser();
                                window.location.href = `login.html?role=driver&status=${currentProfile.status}`;
                                return resolve(null);
                            }
                        }
                        resolve({ user, profile: currentProfile });
                    } else {
                        console.warn("No user profile found in Firestore. Creating default student profile...");
                        // Auto-create student profile for authenticated user (e.g. Google Sign-In)
                        const fallbackProfile = {
                            uid: user.uid,
                            name: user.displayName || user.email.split('@')[0],
                            email: user.email,
                            role: 'student',
                            status: 'active',
                            assignedBus: null
                        };
                        try {
                            const { setDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
                            await setDoc(docRef, { ...fallbackProfile, createdAt: serverTimestamp() });
                        } catch (e) {
                            console.error("Failed to auto-create profile:", e);
                        }
                        currentProfile = fallbackProfile;
                        resolve({ user, profile: currentProfile });
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    resolve(null);
                }
            } else {
                currentUser = null;
                currentProfile = null;
                if (requireAuth) {
                    window.location.href = "/pages/role-select.html";
                }
                resolve(null);
            }
        });
    });
}

// Global logout function
export async function logoutUser() {
    try {
        await signOut(auth);
        window.location.replace("/");
    } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to sign out. Please try again.");
    }
}

// Helper to get current user info
export function getCurrentUser() {
    return { user: currentUser, profile: currentProfile };
}
