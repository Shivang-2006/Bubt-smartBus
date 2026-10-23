// ========================================
// Smart Campus Bus — Driver Dashboard
// ========================================

import { db } from "./firebase-config.js";
import { initAuthGuard, logoutUser } from "./auth-guard.js";
import { sendEmailVerification, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where, getDocs, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { API_BASE_URL } from "./api.js";

const translations = {
    en: {
        hello: "Hello,",
        sign_out: "Sign Out",
        start: "START",
        cancel: "✕ CANCEL",
        stop: "STOP",
        delay: "DELAY",
        ready_next_trip: "Ready for next trip",
        gps_offline: "GPS Offline",
        location_not_available: "Location not available",
        assigned_bus: "ASSIGNED BUS",
        todays_schedule: "TODAY'S DUTY SCHEDULE",
        loading_schedules: "Loading schedules...",
        no_bus: "No Bus Assigned",
        contact_admin: "Please contact admin to assign a bus.",
        cannot_start: "Cannot start trip: No bus assigned",
        no_schedules: "No schedules assigned for today.",
        assigned_duty: "Assigned Duty",
        trip_in_progress: "📍 TRIP IN PROGRESS...",
        connecting_gps: "Connecting to GPS...",
        waiting_signal: "Waiting for signal",
        gps_active: "GPS Active",
        gps_error: "GPS Error",
        connecting: "CONNECTING",
        accuracy: "Accuracy",
        updated: "Updated",
        trip_cancelled: "Trip start cancelled.",
        cannot_start_gps_error: "Cannot start trip.",
        failed_start_db: "Failed to start trip due to database error.",
        confirm_delay: "Are you sure you want to mark the bus as delayed?",
        delay_sent: "Delay notification sent to students.",
        delay_failed: "Failed to send delay notification.",
        stop_failed: "Failed to stop trip.",
        setup_trip: "Setup Trip",
        select_direction: "1. Select Direction",
        select_direction_opt: "-- Select Direction --",
        start_to_end: "Start → End",
        end_to_start: "End → Start",
        select_time: "2. Select Time",
        select_time_opt: "-- Select Time --",
        start_trip: "Start Trip",
        trip_setup_desc: "Click START to setup your trip details and begin broadcasting GPS.",
        trip_setup: "TRIP SETUP",
        settings: "Settings",
        account_settings: "Account Settings",
        settings_desc: "Manage your profile and password settings.",
        profile_info: "Profile Information",
        full_name: "Full Name",
        email_readonly: "Email (Read Only)",
        update_profile: "Update Profile",
        change_password: "Change Password",
        current_password: "Current Password",
        new_password: "New Password",
        confirm_new_password: "Confirm New Password",
        update_password: "Update Password",
        back_to_dashboard: "Back to Dashboard",
        name_required: "Name is required",
        profile_updated: "Profile updated successfully!",
        passwords_dont_match: "New passwords do not match",
        password_updated: "Password updated successfully!",
        incorrect_current_password: "Incorrect current password",
        password_too_weak: "New password is too weak",
        failed_update_password: "Failed to update password",
        updating: "Updating..."
    }
};

// Enforced 100% English across all dashboards
const currentLang = 'en';
try {
    localStorage.setItem('driver_lang', 'en');
} catch (e) {}

function getTranslation(key) {
    return translations.en[key] || key;
}

let currentDriverUser = null;
let assignedBusId = null;
let assignedBusName = "Bus";
let activeTripId = null;

// GPS State (Phase 14)
let gpsWatchId = null;
let lastGpsUpdateTime = 0;
const GPS_UPDATE_INTERVAL_MS = 5000; // 5 seconds
let pendingTripStart = false; // Flag to indicate we are connecting to GPS to start a trip

// DOM Elements
const btnStart = document.getElementById('btn-start-trip');
const btnStop = document.getElementById('btn-stop-trip');
const btnDelay = document.getElementById('btn-delay-bus');
const btnCancelConnecting = document.getElementById('btn-cancel-connecting');
const statusText = document.getElementById('trip-status');
const assignedBusEl = document.getElementById('assigned-bus');
const scheduleSelectorContainer = document.getElementById('schedule-selector-container');
const timeSelect = document.getElementById('trip-time-select');
const directionSelectorContainer = document.getElementById('direction-selector-container');
const directionSelect = document.getElementById('trip-direction-select');
const optForward = document.getElementById('opt-forward');
const optReturn = document.getElementById('opt-return');

let selectedScheduleId = null;
let assignedRoute = null;

// GPS UI Elements
const gpsStatusDiv = document.getElementById('gps-status');
const gpsDot = document.getElementById('gps-dot');
const gpsText = document.getElementById('gps-text');
const gpsDetails = document.getElementById('gps-details');

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations.en[key]) {
            el.textContent = translations.en[key];
        }
    });
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
        langBtn.style.display = 'none';
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    applyTranslations();
    // Require authentication, allow only drivers
    const authData = await initAuthGuard(true, ['driver']);
    
    if (authData) {
        currentDriverUser = authData.user;
        setupDashboard(authData.user, authData.profile);
        
        // Setup Logout
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener("click", () => logoutUser());
        }

        // Setup Settings Button Toggle
        const btnSettings = document.getElementById('btn-settings');
        const btnBackDashboard = document.getElementById('btn-back-dashboard');
        if (btnSettings) {
            btnSettings.addEventListener('click', () => showSettings(true));
        }
        if (btnBackDashboard) {
            btnBackDashboard.addEventListener('click', () => showSettings(false));
        }

        // Initialize Settings Panel
        initSettings(authData.user, authData.profile);
        
        // Fetch specific driver data
        await fetchDriverData();
        
        // Setup Trip Actions
        if(btnStart) btnStart.addEventListener('click', () => {
        // Open the modal instead of starting the trip directly
        document.getElementById('trip-setup-modal').style.display = 'flex';
    });
    
    // Setup Modal Buttons
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnConfirmStart = document.getElementById('btn-confirm-start');
    
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
            document.getElementById('trip-setup-modal').style.display = 'none';
        });
    }
    
    if (btnConfirmStart) {
        btnConfirmStart.addEventListener('click', startTrip);
    }
        if(btnStop) btnStop.addEventListener("click", stopTrip);
        if(btnDelay) btnDelay.addEventListener("click", delayBus);
        if(directionSelect) directionSelect.addEventListener("change", checkStartVisibility);
        if(timeSelect) {
            timeSelect.addEventListener("change", () => {
                selectedScheduleId = timeSelect.value;
                checkStartVisibility();
            });
        }
        if(btnCancelConnecting) {
            btnCancelConnecting.addEventListener("click", () => {
                if (pendingTripStart) {
                    showErrorPopup(getTranslation('trip_cancelled'));
                    resetStartButton();
                    stopGpsTracking();
                }
            });
        }
    }
});

function setupDashboard(user, profile) {
    const nameEl = document.getElementById("user-name");
    
    if (nameEl) nameEl.textContent = profile.name || "Driver";
    
    // Check Email Verification
    const banner = document.getElementById("email-verification-banner");
    const resendBtn = document.getElementById("resend-verification-btn");
    
    if (!user.emailVerified) {
        if (banner) banner.style.display = "flex";
        
        if (resendBtn) {
            resendBtn.addEventListener("click", async () => {
                const originalText = resendBtn.textContent;
                resendBtn.textContent = "Sending...";
                resendBtn.disabled = true;
                
                try {
                    await sendEmailVerification(user);
                    resendBtn.textContent = "Sent! Check inbox.";
                    setTimeout(() => {
                        resendBtn.textContent = originalText;
                        resendBtn.disabled = false;
                    }, 5000);
                } catch (error) {
                    console.error("Error sending verification email:", error);
                    resendBtn.textContent = "Failed. Try again.";
                    resendBtn.disabled = false;
                    alert(error.message);
                }
            });
        }
    }
}

async function fetchDriverData() {
    try {
        // 1. Find assigned bus
        const qBuses = query(collection(db, "buses"), where("assignedDriver", "==", currentDriverUser.uid));
        const busSnapshot = await getDocs(qBuses);
        
        if (!busSnapshot.empty) {
            const busDoc = busSnapshot.docs[0];
            const busData = busDoc.data();
            assignedBusId = busDoc.id;
            assignedBusName = busData.busName;
            
            if (assignedBusEl) assignedBusEl.textContent = busData.busName;
            
            // 2. Fetch Route for this bus
            const qRoute = query(collection(db, "routes"), where("assignedBus", "==", assignedBusId));
            const routeSnapshot = await getDocs(qRoute);
            if (!routeSnapshot.empty) {
                assignedRoute = routeSnapshot.docs[0].data();
                if (optForward && optReturn) {
                    optForward.textContent = `${assignedRoute.startPoint} \u2192 ${assignedRoute.endPoint}`;
                    optReturn.textContent = `${assignedRoute.endPoint} \u2192 ${assignedRoute.startPoint}`;
                }
            } else {
                if (directionSelectorContainer) directionSelectorContainer.style.display = 'none';
            }
            
            // 3. Fetch Schedules for this bus
            fetchSchedules();
            
            // 4. Check for active trips
            checkActiveTrips();
        } else {
            if (assignedBusEl) assignedBusEl.textContent = getTranslation('no_bus');
            if (scheduleListEl) scheduleListEl.innerHTML = `
                <div class="schedule-item">
                    <span class="schedule-time" style="color: var(--text-primary);">${getTranslation('contact_admin')}</span>
                </div>
            `;
            if(btnStart) {
                btnStart.style.opacity = '0.5';
                btnStart.disabled = true;
                statusText.textContent = getTranslation('cannot_start');
            }
            if (directionSelectorContainer) directionSelectorContainer.style.display = 'none';
        }
    } catch (error) {
        console.error("Error fetching driver data:", error);
    }
}

function fetchSchedules() {
    if (!assignedBusId) return;
    
    const qSchedules = query(collection(db, "schedules"), where("busId", "==", assignedBusId));
    onSnapshot(qSchedules, (snapshot) => {
        const schedules = [];
        snapshot.forEach((doc) => {
            schedules.push(doc.data());
        });
        
        schedules.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        
        if (schedules.length === 0) {
            if (timeSelect) {
                timeSelect.innerHTML = `<option value="">-- ${getTranslation('no_schedules')} --</option>`;
            }
            return;
        }
        
        if (timeSelect) {
            timeSelect.innerHTML = `<option value="">-- Select Time --</option>`;
            schedules.forEach((sched) => {
                const opt = document.createElement('option');
                opt.value = sched.id;
                opt.textContent = `${formatTime12Hour(sched.departureTime)} - ${getTranslation('assigned_duty')}`;
                timeSelect.appendChild(opt);
            });
        }
    });
}

function checkActiveTrips() {
    // Look for an active trip by this driver
    const qTrips = query(
        collection(db, "trips"), 
        where("driverId", "==", currentDriverUser.uid),
        where("status", "==", "active"),
        limit(1)
    );
    
    onSnapshot(qTrips, (snapshot) => {
        if (!snapshot.empty) {
            // Restore active state
            activeTripId = snapshot.docs[0].id;
            if(btnStart) btnStart.style.display = 'none';
            if(directionSelectorContainer) directionSelectorContainer.style.display = 'none';
            if(scheduleSelectorContainer) scheduleSelectorContainer.style.display = 'none';
            if(btnStop) btnStop.style.display = 'flex';
            if(btnDelay) btnDelay.classList.remove('hidden');
            if(statusText) {
                statusText.textContent = getTranslation('trip_in_progress');
                statusText.style.color = 'var(--accent-success)';
                statusText.style.borderColor = 'rgba(0, 200, 83, 0.2)';
                statusText.style.background = 'rgba(0, 200, 83, 0.05)';
            }
            // Resume GPS if page was reloaded during active trip
            if (!gpsWatchId) startGpsTracking();
        } else {
            // Stop GPS if it was running and we aren't trying to start
            if (gpsWatchId && !pendingTripStart) stopGpsTracking();
            
            if (pendingTripStart) return; // Don't reset UI if connecting to GPS
            
            resetStartButton();
            if (directionSelectorContainer) directionSelectorContainer.style.display = 'flex';
        }
    });
}

function checkStartVisibility() {
    if (activeTripId || pendingTripStart) return;
    
    // Handle Schedule Container Visibility in Modal
    if (directionSelect && directionSelect.value) {
        if (scheduleSelectorContainer) scheduleSelectorContainer.style.display = 'flex';
    } else {
        if (scheduleSelectorContainer) scheduleSelectorContainer.style.display = 'none';
        selectedScheduleId = null; // reset if they unselect direction
        if (timeSelect) timeSelect.value = '';
    }
    
    // Handle Confirm Button Visibility in Modal
    const btnConfirm = document.getElementById('btn-confirm-start');
    if (btnConfirm) {
        if (selectedScheduleId && directionSelect && directionSelect.value) {
            btnConfirm.style.opacity = '1';
            btnConfirm.style.pointerEvents = 'auto';
        } else {
            btnConfirm.style.opacity = '0.5';
            btnConfirm.style.pointerEvents = 'none';
        }
    }
}

async function startTrip() {
    if (!assignedBusId || !currentDriverUser) return;
    if (!selectedScheduleId) {
        showErrorPopup("Please select a schedule before starting the trip.");
        return;
    }
    
    // Close the setup modal immediately
    const modal = document.getElementById('trip-setup-modal');
    if (modal) modal.style.display = 'none';
    
    // UI changes for connecting state
    btnStart.disabled = true;
    if (directionSelectorContainer) directionSelectorContainer.style.display = 'none';
    
    btnStart.innerHTML = `
        <span class="btn-icon">⏳</span>
        <span class="btn-text" style="font-size: 1rem;">${getTranslation('connecting')}</span>
    `;
    btnStart.style.background = '#f59e0b';
    btnStart.style.boxShadow = '0 10px 30px rgba(245, 158, 11, 0.3)';
    
    if (statusText) {
        statusText.textContent = getTranslation('connecting_gps');
        statusText.style.color = '#f59e0b';
        statusText.style.borderColor = 'rgba(245, 158, 11, 0.2)';
        statusText.style.background = 'rgba(245, 158, 11, 0.05)';
    }
    
    if (btnCancelConnecting) btnCancelConnecting.style.display = 'block';
    
    // 1. Start GPS Tracking with connecting flag
    startGpsTracking(true);
}

async function delayBus() {
    if (!activeTripId || !assignedBusId) return;
    
    if (!confirm(getTranslation('confirm_delay'))) return;
    
    btnDelay.disabled = true;
    try {
        await addDoc(collection(db, "notifications"), {
            busId: assignedBusId,
            type: 'bus_delayed',
            message: `${assignedBusName} is currently delayed due to traffic or other issues.`,
            timestamp: serverTimestamp()
        });
        alert(getTranslation('delay_sent'));
    } catch (error) {
        console.error("Error sending delay notification:", error);
        alert(getTranslation('delay_failed'));
    } finally {
        btnDelay.disabled = false;
    }
}

async function stopTrip() {
    if (!activeTripId || !assignedBusId) return;
    
    btnStop.disabled = true;
    
    try {
        // 1. Mark trip as completed
        await updateDoc(doc(db, "trips", activeTripId), {
            status: 'completed',
            endTime: serverTimestamp()
        });
        
        // 2. Add Notification for trip completion
        await addDoc(collection(db, "notifications"), {
            busId: assignedBusId,
            type: 'bus_stopped',
            message: `${assignedBusName} has completed its trip.`,
            timestamp: serverTimestamp()
        });
        
        // 3. Update Bus Status back to 'active' (idle) and clear GPS
        await updateDoc(doc(db, "buses", assignedBusId), {
            status: 'active',
            currentLocation: null // Clear location when trip stops
        });
        
        activeTripId = null;
        
        // 3. Stop GPS Tracking (Phase 14)
        stopGpsTracking();
        
    } catch (error) {
        console.error("Error stopping trip:", error);
        alert(getTranslation('stop_failed'));
    } finally {
        btnStop.disabled = false;
    }
}

// Formats "14:30" into "02:30 PM"
function formatTime12Hour(time24) {
    if (!time24) return "";
    let [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; 
    let formattedHour = h < 10 ? '0' + h : h;
    return `${formattedHour}:${minutes} ${ampm}`;
}

function startGpsTracking(isStartingTrip = false) {
    if (isStartingTrip) pendingTripStart = true;
    if (!navigator.geolocation) {
        updateGpsUiError("Browser does not support GPS.");
        return;
    }
    if (gpsStatusDiv) gpsStatusDiv.classList.add('visible');
    if (gpsDot) { gpsDot.classList.remove('error'); gpsDot.classList.add('active'); }
    if (gpsText) gpsText.textContent = getTranslation('connecting_gps');
    if (gpsDetails) gpsDetails.textContent = getTranslation('waiting_signal');
    
    // Clear any existing watch
    if (gpsWatchId) navigator.geolocation.clearWatch(gpsWatchId);
    
    gpsWatchId = navigator.geolocation.watchPosition(
        handleGpsSuccess,
        handleGpsError,
        {
            enableHighAccuracy: true, // Force high accuracy / fresh GPS
            timeout: 20000, // Increase timeout to 20s
            maximumAge: 0 // Do not allow cached locations!
        }
    );
}

function stopGpsTracking() {
    if (gpsWatchId) {
        navigator.geolocation.clearWatch(gpsWatchId);
        gpsWatchId = null;
    }
    
    if (gpsStatusDiv) gpsStatusDiv.classList.remove('visible');
    if (gpsDot) { gpsDot.classList.remove('active', 'error'); }
    if (gpsText) gpsText.textContent = getTranslation('gps_offline');
    if (gpsDetails) gpsDetails.textContent = getTranslation('location_not_available');
}

async function handleGpsSuccess(position) {
    const { latitude, longitude, accuracy } = position.coords;
    await processLocationUpdate(latitude, longitude, accuracy);
}

async function processLocationUpdate(latitude, longitude, accuracy) {
    const now = Date.now();
    
    // Update UI immediately
    if (gpsDot) { gpsDot.classList.remove('error'); gpsDot.classList.add('active'); }
    if (gpsText) gpsText.textContent = getTranslation('gps_active');
    if (gpsDetails) gpsDetails.textContent = `${getTranslation('accuracy')}: ±${Math.round(accuracy)}m | ${getTranslation('updated')}: ${new Date().toLocaleTimeString()}`;
    
    if (pendingTripStart) {
        pendingTripStart = false;
        await confirmTripStart();
    }
    
    // Throttle Firestore updates (e.g. every 5 seconds)
    if (now - lastGpsUpdateTime < GPS_UPDATE_INTERVAL_MS) {
        return; // Skip this update to save Firestore writes
    }
    
    if (!assignedBusId) return;
    
    try {
        await updateDoc(doc(db, "buses", assignedBusId), {
            currentLocation: {
                latitude,
                longitude,
                accuracy,
                timestamp: new Date().toISOString()
            }
        });
        lastGpsUpdateTime = now;
        console.log(`[GPS] Location updated: ${latitude}, ${longitude}`);
    } catch (error) {
        console.error("Failed to update GPS in Firestore:", error);
    }
}

function handleGpsError(error) {
    console.error("GPS Error:", error);
    let msg = "GPS Error";
    switch(error.code) {
        case error.PERMISSION_DENIED:
            msg = "Permission Denied by browser.";
            break;
        case error.POSITION_UNAVAILABLE:
            msg = "Location unavailable. (Check Windows Location Settings if on PC)";
            break;
        case error.TIMEOUT:
            msg = "GPS request timed out.";
            break;
    }
    console.warn(`GPS Error Code: ${error.code}, Message: ${error.message}`);
    
    updateGpsUiError(msg);
    
    if (pendingTripStart) {
        showErrorPopup(msg + " " + getTranslation('cannot_start_gps_error'));
        resetStartButton();
        stopGpsTracking();
    }
}

function updateGpsUiError(msg) {
    if (gpsStatusDiv) gpsStatusDiv.classList.add('visible');
    if (gpsDot) { gpsDot.classList.remove('active'); gpsDot.classList.add('error'); }
    if (gpsText) gpsText.textContent = getTranslation('gps_error');
    if (gpsDetails) gpsDetails.textContent = msg;
}

// ── Added Helper Functions ──

async function confirmTripStart() {
    if (btnCancelConnecting) btnCancelConnecting.style.display = 'none';
    try {
        const direction = directionSelect ? directionSelect.value : 'forward';
        let tripStartPoint = 'Start';
        let tripEndPoint = 'End';
        
        if (assignedRoute) {
            tripStartPoint = direction === 'forward' ? assignedRoute.startPoint : assignedRoute.endPoint;
            tripEndPoint = direction === 'forward' ? assignedRoute.endPoint : assignedRoute.startPoint;
        }
        
        // 1. Create Trip Record
        const tripData = {
            driverId: currentDriverUser.uid,
            busId: assignedBusId,
            scheduleId: selectedScheduleId,
            direction: direction,
            startPoint: tripStartPoint,
            endPoint: tripEndPoint,
            status: 'active',
            startTime: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, "trips"), tripData);
        activeTripId = docRef.id;
        
        // 2. Update Bus Status to 'running'
        await updateDoc(doc(db, "buses", assignedBusId), {
            status: 'running',
            currentDirection: direction,
            currentTripId: activeTripId
        });
        
        // 3. Send Notification
        await addDoc(collection(db, "notifications"), {
            busId: assignedBusId,
            type: 'bus_started',
            message: `${assignedBusName} has started its trip.`,
            timestamp: serverTimestamp()
        });
        
    } catch (error) {
        console.error("Error confirming trip start:", error);
        resetStartButton();
        showErrorPopup(getTranslation('failed_start_db'));
        stopGpsTracking();
    }
}

function resetStartButton() {
    pendingTripStart = false;
    activeTripId = null;
    selectedScheduleId = null;
    
    // Clear selections
    if (directionSelect) directionSelect.value = "";
    if (timeSelect) timeSelect.value = "";
    if (scheduleSelectorContainer) scheduleSelectorContainer.style.display = 'none';
    
    if(btnStart) {
        btnStart.disabled = false;
        document.getElementById('trip-setup-modal').style.display = 'none'; // Close modal
        
        btnStart.style.display = 'flex'; // Make sure the big round button is visible again
        btnStart.style.opacity = '1';
        btnStart.style.transform = 'scale(1)';
        btnStart.innerHTML = `
            <span class="btn-icon">▶</span>
            <span class="btn-text">${getTranslation('start')}</span>
        `;
        btnStart.style.background = ''; // reset to class default
        btnStart.style.boxShadow = '';
    }
    if (directionSelectorContainer) directionSelectorContainer.style.display = 'flex';
    if (btnCancelConnecting) btnCancelConnecting.style.display = 'none';
    if(btnStop) btnStop.style.display = 'none';
    if(btnDelay) btnDelay.classList.add('hidden');
    if(statusText) {
        statusText.textContent = getTranslation('ready_next_trip');
        statusText.style.color = 'var(--text-muted)';
        statusText.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        statusText.style.background = 'rgba(255, 255, 255, 0.03)';
    }
}

function showErrorPopup(message) {
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '20px';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.background = 'rgba(239, 68, 68, 0.95)';
    popup.style.color = '#fff';
    popup.style.padding = '15px 25px';
    popup.style.borderRadius = '12px';
    popup.style.boxShadow = '0 10px 25px rgba(239, 68, 68, 0.4)';
    popup.style.zIndex = '9999';
    popup.style.display = 'flex';
    popup.style.alignItems = 'center';
    popup.style.gap = '10px';
    popup.style.fontFamily = "'Inter', sans-serif";
    popup.style.fontWeight = '500';
    popup.style.animation = 'slideDown 0.3s ease-out';
    
    popup.innerHTML = `
        <span style="font-size: 1.5rem;">⚠️</span>
        <span>${message}</span>
        <button style="background:transparent;border:none;color:#fff;font-size:1.2rem;cursor:pointer;margin-left:10px;">&times;</button>
    `;
    
    if (!document.getElementById('popup-styles')) {
        const style = document.createElement('style');
        style.id = 'popup-styles';
        style.textContent = `
            @keyframes slideDown {
                from { top: -50px; opacity: 0; }
                to { top: 20px; opacity: 1; }
            }
            @keyframes fadeOut {
                to { opacity: 0; transform: translate(-50%, -20px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(popup);
    
    const closeBtn = popup.querySelector('button');
    const closePopup = () => {
        popup.style.animation = 'fadeOut 0.3s ease-in forwards';
        setTimeout(() => popup.remove(), 300);
    };
    
    closeBtn.addEventListener('click', closePopup);
    setTimeout(closePopup, 5000); // auto close after 5 seconds
}

function showSettings(show) {
    const dashboardSec = document.getElementById('section-dashboard');
    const settingsSec = document.getElementById('section-settings');
    const btnSettings = document.getElementById('btn-settings');
    
    if (show) {
        if (dashboardSec) dashboardSec.style.display = 'none';
        if (settingsSec) settingsSec.style.display = 'block';
        if (btnSettings) btnSettings.style.display = 'none';
    } else {
        if (dashboardSec) dashboardSec.style.display = 'grid';
        if (settingsSec) settingsSec.style.display = 'none';
        if (btnSettings) btnSettings.style.display = 'block';
    }
}

function initSettings(user, profile) {
    const formProfile = document.getElementById('settings-profile-form');
    const formPassword = document.getElementById('settings-password-form');

    // Populate initial data
    const inputName = document.getElementById('settings-name');
    const inputEmail = document.getElementById('settings-email');
    if (inputName) inputName.value = profile.name || '';
    if (inputEmail) inputEmail.value = profile.email || '';

    if (formProfile) {
        formProfile.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-update-profile');
            const originalText = btn.textContent;
            btn.textContent = getTranslation('updating');
            btn.disabled = true;

            const newName = inputName.value.trim();

            if (!newName) {
                if (window.showToast) window.showToast(getTranslation('name_required'), 'error');
                btn.textContent = originalText;
                btn.disabled = false;
                return;
            }

            try {
                // Get fresh token
                const token = await user.getIdToken(true);
                
                const response = await fetch(`${API_BASE_URL}/Auth/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        Name: newName
                    })
                });

                const result = await response.json();
                
                if (response.ok) {
                    if (window.showToast) window.showToast(result.message || getTranslation('profile_updated'), 'success');
                    
                    // Update local UI state
                    profile.name = newName;
                    
                    const nameEl = document.getElementById("user-name");
                    if (nameEl) nameEl.textContent = profile.name;

                } else {
                    throw new Error(result.error || result.message || "Failed to update profile");
                }

            } catch (error) {
                console.error("Profile update error:", error);
                if (window.showToast) window.showToast(error.message, 'error');
            }

            btn.textContent = originalText;
            btn.disabled = false;
        });
    }

    if (formPassword) {
        formPassword.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPwd = document.getElementById('settings-current-password').value;
            const newPwd = document.getElementById('settings-new-password').value;
            const confirmPwd = document.getElementById('settings-confirm-password').value;
            
            if (newPwd !== confirmPwd) {
                if (window.showToast) window.showToast(getTranslation('passwords_dont_match'), 'error');
                return;
            }

            const btn = document.getElementById('btn-update-password');
            const originalText = btn.textContent;
            btn.textContent = getTranslation('updating');
            btn.disabled = true;

            try {
                // 1. Re-authenticate user
                const credential = EmailAuthProvider.credential(user.email, currentPwd);
                await reauthenticateWithCredential(user, credential);
                
                // 2. Update password
                await updatePassword(user, newPwd);
                
                if (window.showToast) window.showToast(getTranslation('password_updated'), 'success');
                formPassword.reset();
            } catch (error) {
                console.error("Password update error:", error);
                let msg = getTranslation('failed_update_password');
                if (error.code === 'auth/invalid-credential') msg = getTranslation('incorrect_current_password');
                if (error.code === 'auth/weak-password') msg = getTranslation('password_too_weak');
                if (window.showToast) window.showToast(msg, 'error');
            }

            btn.textContent = originalText;
            btn.disabled = false;
        });
    }
}

