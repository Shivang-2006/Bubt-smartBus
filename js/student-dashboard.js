// ========================================
// Smart Campus Bus — Student Dashboard
// ========================================

import { db } from "./firebase-config.js";
import { initAuthGuard, logoutUser } from "./auth-guard.js";
import { sendEmailVerification, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, serverTimestamp, getDocs, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { API_BASE_URL } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Require authentication, allow only students
    const authData = await initAuthGuard(true, ['student']);
    
    if (authData) {
        setupDashboard(authData.user, authData.profile);
        initNavigation();
        initDataListeners();
        initNotifications(authData.user);
        initChat(authData.user, authData.profile);
        initAnnouncements();
        initSettings(authData.user, authData.profile);
        initReportAdmin(authData.user, authData.profile);
        fetchDashboardStats();
        
        // Setup Logout
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener("click", () => logoutUser());
        }
        
        const btnCalcMyLocation = document.getElementById('btn-calc-my-location');
        if (btnCalcMyLocation) {
            btnCalcMyLocation.addEventListener("click", requestStudentLocation);
        }
    }
});

function setupDashboard(user, profile) {
    // Populate user info
    const nameEl = document.getElementById("user-name");
    const welcomeEl = document.getElementById("welcome-message");
    
    if (nameEl) nameEl.textContent = profile.name || "Student";
    if (welcomeEl) welcomeEl.textContent = `Welcome, ${profile.name || "Student"}!`;
    
    // Email verification bypassed - all registered students enter directly
}

async function fetchDashboardStats() {
    try {
        // Active Buses
        const qBuses = query(collection(db, "buses"), where("status", "in", ["running", "active"]));
        const busesSnap = await getDocs(qBuses);
        const activeBusesEl = document.getElementById("stat-active-buses");
        if (activeBusesEl) activeBusesEl.textContent = busesSnap.size;

        // Available Routes
        const routesSnap = await getDocs(collection(db, "routes"));
        const routesEl = document.getElementById("stat-available-routes");
        if (routesEl) routesEl.textContent = routesSnap.size;

        // Active Trips
        const qTrips = query(collection(db, "trips"), where("status", "==", "active"));
        const tripsSnap = await getDocs(qTrips);
        const tripsEl = document.getElementById("stat-todays-trips");
        if (tripsEl) tripsEl.textContent = tripsSnap.size;
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
    }
}

// ── Navigation Logic ──
function initNavigation() {
    const navDashboard = document.getElementById('nav-dashboard');
    const navBuses = document.getElementById('nav-buses');
    const navRoutes = document.getElementById('nav-routes');
    const navSchedules = document.getElementById('nav-schedules');
    
    const sectionDashboard = document.getElementById('section-dashboard');
    const sectionBuses = document.getElementById('section-buses');
    const sectionRoutes = document.getElementById('section-routes');
    const sectionSchedules = document.getElementById('section-schedules');
    const sectionChat = document.getElementById('section-chat');
    const sectionAnnouncements = document.getElementById('section-announcements');
    const sectionReport = document.getElementById('section-report');
    
    const pageTitle = document.getElementById('page-title');

    function resetTabs() {
        if(navDashboard) navDashboard.classList.remove('active');
        if(navBuses) navBuses.classList.remove('active');
        if(navRoutes) navRoutes.classList.remove('active');
        if(navSchedules) navSchedules.classList.remove('active');
        const navChat = document.getElementById('nav-chat');
        if(navChat) navChat.classList.remove('active');
        const navAnnouncements = document.getElementById('nav-announcements');
        if(navAnnouncements) navAnnouncements.classList.remove('active');
        const navSettings = document.getElementById('nav-settings');
        if(navSettings) navSettings.classList.remove('active');
        const navReport = document.getElementById('nav-report');
        if(navReport) navReport.classList.remove('active');
        
        if(sectionDashboard) sectionDashboard.style.display = 'none';
        if(sectionBuses) sectionBuses.style.display = 'none';
        if(sectionRoutes) sectionRoutes.style.display = 'none';
        if(sectionSchedules) sectionSchedules.style.display = 'none';
        if(sectionChat) sectionChat.style.display = 'none';
        if(sectionAnnouncements) sectionAnnouncements.style.display = 'none';
        const sectionSettings = document.getElementById('section-settings');
        if(sectionSettings) sectionSettings.style.display = 'none';
        const sectionReport = document.getElementById('section-report');
        if(sectionReport) sectionReport.style.display = 'none';
        
        const sectionBusDetails = document.getElementById('section-bus-details');
        if(sectionBusDetails) sectionBusDetails.style.display = 'none';
        
        const notifContainer = document.getElementById('notification-container-main');
        if (notifContainer) notifContainer.style.display = 'none';

        currentSelectedBusId = null;

        // Close mobile sidebar if open
        const sidebar = document.querySelector('.admin-sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
    }

    window.switchSection = function(sectionName, title, updateHistory = true) {
        resetTabs();
        const nav = document.getElementById('nav-' + sectionName);
        const section = document.getElementById('section-' + sectionName);
        
        if(nav) nav.classList.add('active');
        if(section) section.style.display = 'block';
        if(title && pageTitle) pageTitle.textContent = title;
        
        if (sectionName === 'dashboard' || sectionName === 'buses') {
            const notifContainer = document.getElementById('notification-container-main');
            if(notifContainer) notifContainer.style.display = 'block';
        }
        
        if (sectionName === 'report') {
            localStorage.setItem('report_last_seen', Date.now().toString());
            const badge = document.getElementById('badge-report');
            if (badge) badge.style.display = 'none';
        }
        
        if (sectionName === 'announcements') {
            localStorage.setItem('announcements_last_seen', Date.now().toString());
            const badge = document.getElementById('badge-announcements');
            if (badge) badge.style.display = 'none';
        }
        
        if (sectionName === 'routes') {
            localStorage.setItem('routes_last_seen', Date.now().toString());
            const badge = document.getElementById('badge-routes');
            if (badge) badge.style.display = 'none';
        }
        
        if (sectionName === 'schedules') {
            localStorage.setItem('schedules_last_seen', Date.now().toString());
            const badge = document.getElementById('badge-schedules');
            if (badge) badge.style.display = 'none';
        }
        
        if (updateHistory) {
            history.replaceState({ section: sectionName, title: title }, "", "#" + sectionName);
        }
    };

    // Set initial state
    history.replaceState({ isRoot: true }, "", window.location.pathname);
    history.pushState({ section: 'dashboard', title: 'Student Portal' }, "", "#dashboard");

    window.addEventListener('popstate', (e) => {
        const state = e.state;
        if (!state) return;

        if (state.isRoot) {
            if (window.innerWidth <= 768) {
                // Mobile: Open sidebar
                const sidebar = document.querySelector('.admin-sidebar');
                const overlay = document.querySelector('.sidebar-overlay');
                if (sidebar) sidebar.classList.add('open');
                if (overlay) overlay.classList.add('open');
                
                // Find active section to push it back
                let currentSection = 'dashboard';
                const activeNav = document.querySelector('.nav__link.active') || document.querySelector('.admin-sidebar .nav-link.active') || document.querySelector('.sidebar-nav .nav-link.active');
                if (activeNav) currentSection = activeNav.id.replace('nav-', '');
                history.pushState({ section: currentSection }, "", "#" + currentSection);
            } else {
                history.back(); // Let desktop user exit
            }
            return;
        }

        // Clean up any overlays/layouts
        const chatLayout = document.querySelector('.chat-layout');
        if (chatLayout) chatLayout.classList.remove('chat-mobile-active');

        if (state.section === 'bus-details') {
            openBusDetails(state.busId, false);
        } else if (state.section === 'chat-inbox') {
            switchSection('chat', 'Bus Chat', false);
            if (window.openChatRoom) window.openChatRoom(state.busId, state.busName, false);
        } else {
            switchSection(state.section, state.title, false);
        }
    });

    if (navDashboard) {
        navDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection('dashboard', "Student Portal");
        });
    }

    if (navBuses) {
        navBuses.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection('buses', "Available Buses");
        });
    }

    if (navRoutes) {
        navRoutes.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection('routes', "Routes & Stops");
        });
    }

    if (navSchedules) {
        navSchedules.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection('schedules', "Schedules");
        });
    }

    const navChat = document.getElementById('nav-chat');
    if (navChat) {
        navChat.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection('chat', "Bus Chat");
        });
    }

    const navAnnouncements = document.getElementById('nav-announcements');
    if (navAnnouncements) {
        navAnnouncements.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection('announcements', "Campus Announcements");
        });
    }

    const navSettings = document.getElementById('nav-settings');
    if (navSettings) {
        navSettings.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection('settings', "Account Settings");
        });
    }

    const navReport = document.getElementById('nav-report');
    if (navReport) {
        navReport.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection('report', "Report Admin");
        });
    }
}

// ── Data Listeners ──
let allBuses = [];
let allRoutes = [];
let allSchedules = [];
let currentMap = null;
let currentBusMarker = null;
let currentSelectedBusId = null;
let stopMarkersLayer = null; // Phase 12: layer group for stop markers
let isShowingMyLocationETA = false;
let studentLocation = null;
let studentLocationMarker = null;

function initDataListeners() {
    listenToBuses();
    listenToRoutes();
    listenToSchedules();
}

function listenToBuses() {
    const q = query(collection(db, "buses"));
    onSnapshot(q, (snapshot) => {
        allBuses = [];
        snapshot.forEach((doc) => {
            allBuses.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort: Running first, then Active, then alphabetical
        allBuses.sort((a, b) => {
            if (a.status === 'running' && b.status !== 'running') return -1;
            if (a.status !== 'running' && b.status === 'running') return 1;
            if (a.status === 'active' && b.status !== 'active') return -1;
            if (a.status !== 'active' && b.status === 'active') return 1;
            return a.busName.localeCompare(b.busName);
        });
        
        renderBuses();
        
        // Phase 16: Live Tracking - Update map if a bus is currently selected
        if (currentSelectedBusId) {
            updateLiveBusLocation(currentSelectedBusId);
        }
    }, (error) => {
        console.error("Error fetching buses:", error);
    });
}

function listenToRoutes() {
    const q = query(collection(db, "routes"));
    onSnapshot(q, (snapshot) => {
        allRoutes = [];
        let hasNewRoutes = false;
        const lastSeen = parseInt(localStorage.getItem('routes_last_seen') || '0', 10);
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            allRoutes.push({ id: doc.id, ...data });
            
            const itemTime = data.updatedAt?.toMillis ? data.updatedAt.toMillis() : (data.createdAt?.toMillis ? data.createdAt.toMillis() : 0);
            if (itemTime > lastSeen) hasNewRoutes = true;
        });
        
        const badge = document.getElementById('badge-routes');
        if (badge) {
            if (hasNewRoutes) {
                badge.textContent = '!';
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
        
        renderRoutes();
    }, (error) => {
        console.error("Error fetching routes:", error);
    });
}

function listenToSchedules() {
    const q = query(collection(db, "schedules"));
    onSnapshot(q, (snapshot) => {
        allSchedules = [];
        let hasNewSchedules = false;
        const lastSeen = parseInt(localStorage.getItem('schedules_last_seen') || '0', 10);
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            allSchedules.push({ id: doc.id, ...data });
            
            const itemTime = data.updatedAt?.toMillis ? data.updatedAt.toMillis() : (data.createdAt?.toMillis ? data.createdAt.toMillis() : 0);
            if (itemTime > lastSeen) hasNewSchedules = true;
        });
        
        const badge = document.getElementById('badge-schedules');
        if (badge) {
            if (hasNewSchedules) {
                badge.textContent = '!';
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
        
        // Sort by time
        allSchedules.sort((a, b) => {
            return a.departureTime.localeCompare(b.departureTime);
        });
        
        renderSchedules();
    }, (error) => {
        console.error("Error fetching schedules:", error);
    });
}

// ── Render Helpers ──
function getStatusBadge(status) {
    if (status === 'running') return '<span class="status-badge status-badge--running">🟢 Running</span>';
    if (status === 'active') return '<span class="status-badge status-badge--active">Active</span>';
    if (status === 'inactive') return '<span class="status-badge">Inactive</span>';
    if (status === 'maintenance') return '<span class="status-badge status-badge--maintenance">Maintenance</span>';
    if (status === 'special_trip') return '<span class="status-badge status-badge--special">Special Trip</span>';
    return `<span class="status-badge">${status || 'Unknown'}</span>`;
}

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

// ── Render Functions ──
function renderBuses() {
    const grid = document.getElementById('bus-grid');
    if (!grid) return;

    if (allBuses.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">🚐</div>
                <p>No buses currently available.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = '';

    allBuses.forEach(bus => {
        const card = document.createElement('div');
        card.className = 'bus-card';
        
        card.style.cursor = 'pointer';
        card.style.transition = 'all 0.3s ease';
        card.onmouseover = () => card.style.transform = 'translateY(-5px)';
        card.onmouseout = () => card.style.transform = 'translateY(0)';
        
        card.innerHTML = `
            <div class="driver-card__header" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <h3 class="driver-card__name" style="margin: 0; font-size: 1.2rem;">${bus.busName}</h3>
                    ${getStatusBadge(bus.status)}
                </div>
                <span class="driver-card__id" style="font-size: 0.85rem; color: var(--text-muted);">${bus.busNumber}</span>
            </div>
            
            <div class="driver-card__details" style="display: block; padding: 0.5rem 0;">
                <div class="detail-item" style="margin-bottom: 0.5rem; text-align: left;">
                    <span class="detail-item__label">🗺️ Current Route</span>
                    <span class="detail-item__value" style="font-weight: 500;">${bus.route || 'Unassigned'}</span>
                </div>
            </div>
            <div style="margin-top: 1rem;">
                <button class="btn btn--primary" style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 0.5rem; font-weight: 600; padding: 0.75rem; border-radius: 8px; border: none; background-color: var(--accent-primary, #6c63ff); color: white; cursor: pointer; transition: background-color 0.2s;">
                    <span style="font-size: 1.2rem;">🗺️</span> View Live Map & Details
                </button>
            </div>
        `;
        
        card.addEventListener('click', () => openBusDetails(bus.id));
        
        grid.appendChild(card);
    });
}

// ── Bus Details & Map Logic ──
window.openBusDetails = function(busId, updateHistory = true) {
    currentSelectedBusId = busId;
    const bus = allBuses.find(b => b.id === busId);
    if (!bus) return;
    
    // Hide buses list, show details
    document.getElementById('section-buses').style.display = 'none';
    const sectionDetails = document.getElementById('section-bus-details');
    sectionDetails.style.display = 'block';
    
    // Setup Header
    document.getElementById('detail-bus-name').textContent = bus.busName;
    document.getElementById('detail-bus-status').innerHTML = getStatusBadge(bus.status);
    
    // Setup Back Button
    document.getElementById('btn-back-buses').onclick = () => {
        history.back(); // Use history API instead of direct toggle
    };

    if (updateHistory) {
        history.pushState({ section: 'bus-details', busId: busId }, "", "#bus-details");
    }

    
    // Map Logic
    const overlay = document.getElementById('map-overlay');
    
    // Initialize map once
    if (!currentMap) {
        currentMap = L.map('bus-map').setView([28.6967, 77.4526], 14); // RKGIT Ghaziabad Coordinates
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(currentMap);
        
        const busIcon = L.divIcon({
            html: '<div style="font-size: 24px; background: rgba(0,212,170,0.2); border-radius: 50%; border: 2px solid #00ffcc; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(0,212,170,0.5);">🚌</div>',
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        
        currentBusMarker = L.marker([28.6967, 77.4526], {icon: busIcon}).addTo(currentMap);
        stopMarkersLayer = L.layerGroup().addTo(currentMap);
    }
    
    // Important: Invalidate size after unhiding to prevent rendering bugs
    setTimeout(() => {
        currentMap.invalidateSize();
    }, 100);
    
    // Phase 16: Initial Live Location setup
    updateLiveBusLocation(busId);
    
    // Phase 12: Render bus stop markers on map
    renderStopMarkers(bus);
    
    // Render specific schedules for this bus
    renderBusSpecificSchedules(busId);
}

// ── Phase 16: Live Tracking Logic ──
function updateLiveBusLocation(busId) {
    const bus = allBuses.find(b => b.id === busId);
    if (!bus || !currentMap || !currentBusMarker) return;
    
    // Dynamically update the status badge on the map page
    const statusBadgeEl = document.getElementById('detail-bus-status');
    if (statusBadgeEl) {
        statusBadgeEl.innerHTML = getStatusBadge(bus.status);
    }
    
    const overlay = document.getElementById('map-overlay');
    
    // Check if running and has valid GPS coordinates
    if (bus.status === 'running' && bus.currentLocation && bus.currentLocation.latitude && bus.currentLocation.longitude) {
        if (overlay) overlay.style.display = 'none';
        
        const newLatLng = [bus.currentLocation.latitude, bus.currentLocation.longitude];
        currentBusMarker.setLatLng(newLatLng);
        currentBusMarker.setOpacity(1);
        
        // Phase 17 & 18: Distance & ETA Calculation
        updateEtaInfo(bus, newLatLng);
        
        // Panning the camera to make it obvious the bus is moving
        currentMap.panTo(newLatLng, { animate: true, duration: 1 }); 
    } else {
        if (overlay) overlay.style.display = 'flex';
        currentBusMarker.setOpacity(0);
        
        // Hide ETA panel if not running
        const etaPanel = document.getElementById('eta-panel');
        if (etaPanel) etaPanel.style.display = 'none';
    }
}

// ── Phase 17 & 18: Distance & ETA Logic ──
function updateEtaInfo(bus, busLatLng) {
    const etaPanel = document.getElementById('eta-panel');
    const stopNameEl = document.getElementById('eta-stop-name');
    const distanceEl = document.getElementById('eta-distance');
    const timeEl = document.getElementById('eta-time');
    const lastUpdatedEl = document.getElementById('eta-last-updated');
    const passedStatusEl = document.getElementById('bus-passed-status');
    const nextStopEl = document.getElementById('bus-next-stop');
    const destLabelEl = document.getElementById('eta-dest-label');
    const btnCalcMyLocation = document.getElementById('btn-calc-my-location');
    
    if (!etaPanel || !stopNameEl || !distanceEl || !timeEl) return;
    
    const route = allRoutes.find(r => r.assignedBus === bus.id);
    if (!route || !route.stops || route.stops.length === 0) {
        etaPanel.style.display = 'none';
        return;
    }

    etaPanel.style.display = 'flex';
    
    // Update Last Updated Time
    if (lastUpdatedEl && bus.currentLocation && bus.currentLocation.timestamp) {
        const lastUpdatedDate = new Date(bus.currentLocation.timestamp);
        const diffMs = Date.now() - lastUpdatedDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) lastUpdatedEl.innerHTML = `Last Updated: <strong>Just now</strong>`;
        else lastUpdatedEl.innerHTML = `Last Updated: <strong>${diffMins} min${diffMins > 1 ? 's' : ''} ago</strong>`;
    } else if (lastUpdatedEl) {
        lastUpdatedEl.innerHTML = `Last Updated: <strong>Unknown</strong>`;
    }

    // Determine Bus Position along the route
    let minDistance = Infinity;
    let nearestStopIndex = -1;
    
    route.stops.forEach((stop, index) => {
        if (stop.latitude && stop.longitude) {
            const dist = getDistanceFromLatLonInMeters(
                busLatLng[0], busLatLng[1], 
                stop.latitude, stop.longitude
            );
            if (dist < minDistance) {
                minDistance = dist;
                nearestStopIndex = index;
            }
        }
    });

    let previousStop = null;
    let nextStop = null;
    let currentStop = route.stops[nearestStopIndex];

    if (minDistance < 50) {
        // At a stop
        previousStop = currentStop;
        nextStop = nearestStopIndex < route.stops.length - 1 ? route.stops[nearestStopIndex + 1] : null;
        if (passedStatusEl) passedStatusEl.innerHTML = `Currently at: <strong>${currentStop.name}</strong>`;
    } else {
        // Between stops - naive assumption based on nearest
        if (nearestStopIndex === 0) {
            previousStop = currentStop;
            nextStop = route.stops.length > 1 ? route.stops[1] : null;
            if (passedStatusEl) passedStatusEl.innerHTML = `Left: <strong>${previousStop.name}</strong>`;
        } else if (nearestStopIndex === route.stops.length - 1) {
            previousStop = route.stops[nearestStopIndex - 1];
            nextStop = currentStop;
            if (passedStatusEl) passedStatusEl.innerHTML = `Approaching final stop`;
        } else {
            previousStop = currentStop;
            nextStop = route.stops[nearestStopIndex + 1];
            if (passedStatusEl) passedStatusEl.innerHTML = `Recently passed: <strong>${previousStop.name}</strong>`;
        }
    }

    if (nextStopEl) {
        if (nextStop) nextStopEl.innerHTML = `<strong>${nextStop.name}</strong>`;
        else nextStopEl.innerHTML = `<em>End of Route</em>`;
    }

    // Target Calculation (Final stop OR Student Location)
    let targetLat, targetLon, targetName, targetDistance;
    
    if (isShowingMyLocationETA && studentLocation) {
        targetLat = studentLocation.latitude;
        targetLon = studentLocation.longitude;
        targetName = "My Location";
        if (destLabelEl) destLabelEl.textContent = "To My Location";
        if (btnCalcMyLocation) btnCalcMyLocation.innerHTML = `<span>📍</span> Using My Location`;
    } else {
        // Default to final stop
        const finalStop = route.stops[route.stops.length - 1];
        targetLat = finalStop.latitude;
        targetLon = finalStop.longitude;
        targetName = finalStop.name;
        if (destLabelEl) destLabelEl.textContent = "To Final Stop";
        if (btnCalcMyLocation) btnCalcMyLocation.innerHTML = `<span>📍</span> Calculate from My Location`;
    }
    
    if (targetLat && targetLon) {
        targetDistance = getDistanceFromLatLonInMeters(
            busLatLng[0], busLatLng[1], 
            targetLat, targetLon
        );
        
        stopNameEl.textContent = targetName;
        
        if (targetDistance < 50 && isShowingMyLocationETA) {
            distanceEl.textContent = `${Math.round(targetDistance)}m`;
            timeEl.textContent = "Arrived!";
            timeEl.style.color = "var(--accent-success)";
        } else {
            if (targetDistance >= 1000) {
                distanceEl.textContent = `${(targetDistance / 1000).toFixed(1)} km`;
            } else {
                distanceEl.textContent = `${Math.round(targetDistance)} m`;
            }
            
            const speedMetersPerSecond = 5.5; 
            const timeInSeconds = targetDistance / speedMetersPerSecond;
            const timeInMinutes = Math.ceil(timeInSeconds / 60);
            
            timeEl.textContent = `${timeInMinutes} min`;
            timeEl.style.color = "#00ffcc"; 
        }
    }
}

function requestStudentLocation() {
    const btnCalcMyLocation = document.getElementById('btn-calc-my-location');
    if (btnCalcMyLocation) {
        btnCalcMyLocation.innerHTML = `<span>⏳</span> Locating...`;
        btnCalcMyLocation.disabled = true;
    }
    
    if (!navigator.geolocation) {
        window.showToast("Geolocation is not supported by your browser.", "error");
        resetLocationButton();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            isShowingMyLocationETA = true;
            studentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            window.showToast("Location captured! ETA updated.", "success");
            
            // Add marker on map
            if (currentMap) {
                if (studentLocationMarker) {
                    currentMap.removeLayer(studentLocationMarker);
                }
                const studentIcon = L.divIcon({
                    html: '<div style="font-size: 24px; background: rgba(37,99,235,0.2); border-radius: 50%; border: 2px solid #2563eb; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(37,99,235,0.5);">🧍</div>',
                    className: '',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });
                studentLocationMarker = L.marker([studentLocation.latitude, studentLocation.longitude], {icon: studentIcon}).addTo(currentMap);
                
                // Adjust map bounds to show both bus and student
                if (currentBusMarker) {
                    const bounds = L.latLngBounds([
                        currentBusMarker.getLatLng(),
                        studentLocationMarker.getLatLng()
                    ]);
                    currentMap.fitBounds(bounds, { padding: [50, 50] });
                }
            }
            
            if (currentSelectedBusId) {
                updateLiveBusLocation(currentSelectedBusId);
            }
            
            if (btnCalcMyLocation) {
                btnCalcMyLocation.disabled = false;
            }
        },
        (error) => {
            console.error("Geolocation error:", error);
            window.showToast("Failed to get location. Please allow location access.", "error");
            resetLocationButton();
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function resetLocationButton() {
    isShowingMyLocationETA = false;
    const btnCalcMyLocation = document.getElementById('btn-calc-my-location');
    if (btnCalcMyLocation) {
        btnCalcMyLocation.innerHTML = `<span>📍</span> Calculate from My Location`;
        btnCalcMyLocation.disabled = false;
    }
}

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius of the earth in m
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// ── Phase 12: Bus Stop Markers ──
function createStopIcon(color, label) {
    return L.divIcon({
        html: `<div style="
            width: 26px; height: 26px;
            background: ${color};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex; align-items: center; justify-content: center;
            font-size: 11px; font-weight: bold; color: white;
        ">${label}</div>`,
        className: '',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
    });
}

function renderStopMarkers(bus) {
    // Clear previous stop markers
    if (stopMarkersLayer) stopMarkersLayer.clearLayers();
    
    // Find the route assigned to this bus
    const route = allRoutes.find(r => r.assignedBus === bus.id);
    
    const legendEl = document.getElementById('stop-legend');
    const noStopsEl = document.getElementById('no-stops-msg');
    
    if (!route || !route.stops || route.stops.length === 0) {
        if (legendEl) legendEl.style.display = 'none';
        if (noStopsEl) noStopsEl.style.display = 'block';
        return;
    }
    
    // Check if any stops have coordinates
    const stopsWithCoords = route.stops.filter(s => s.latitude && s.longitude);
    
    if (stopsWithCoords.length === 0) {
        if (legendEl) legendEl.style.display = 'none';
        if (noStopsEl) {
            noStopsEl.style.display = 'block';
            noStopsEl.textContent = 'Stop locations have not been set by admin yet.';
        }
        return;
    }
    
    // Show legend, hide no-stops message
    if (legendEl) legendEl.style.display = 'flex';
    if (noStopsEl) noStopsEl.style.display = 'none';
    
    const bounds = [];
    const totalStops = route.stops.length;
    
    route.stops.forEach((stop, index) => {
        if (!stop.latitude || !stop.longitude) return;
        
        let color, label, popupPrefix;
        if (index === 0) {
            color = '#00c853'; label = 'S'; popupPrefix = '🟢 Start';
        } else if (index === totalStops - 1) {
            color = '#ff4444'; label = 'E'; popupPrefix = '🔴 End';
        } else {
            color = '#448aff'; label = index.toString(); popupPrefix = '🔵 Stop';
        }
        
        const icon = createStopIcon(color, label);
        const marker = L.marker([stop.latitude, stop.longitude], { icon })
            .bindPopup(`
                <div style="font-family: 'Inter', sans-serif; min-width: 120px;">
                    <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">${popupPrefix}</div>
                    <div style="font-size: 12px; color: #666;">${stop.name}</div>
                    <div style="font-size: 10px; color: #999; margin-top: 3px;">Stop #${stop.order || index + 1}</div>
                </div>
            `);
        
        stopMarkersLayer.addLayer(marker);
        bounds.push([stop.latitude, stop.longitude]);
    });
    
    // Phase 13: Draw connecting route line
    if (bounds.length > 1) {
        const routeLine = L.polyline(bounds, {
            color: '#6c63ff',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 8',
            lineCap: 'round'
        });
        stopMarkersLayer.addLayer(routeLine);
    }
    
    // Fit map to show all stop markers
    if (bounds.length > 0) {
        setTimeout(() => {
            currentMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
        }, 200);
    }
}

function renderBusSpecificSchedules(busId) {
    const grid = document.getElementById('detail-schedule-grid');
    if (!grid) return;
    
    const busSchedules = allSchedules.filter(s => s.busId === busId);
    
    if (busSchedules.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No schedules assigned to this bus yet.</p></div>';
        return;
    }
    
    grid.innerHTML = '';
    busSchedules.forEach(schedule => {
        const card = document.createElement('div');
        card.className = 'bus-card';
        
        let daysText = "All Days";
        if (schedule.operatingDays && schedule.operatingDays.length > 0) {
            daysText = schedule.operatingDays.length === 7 ? "Everyday" : schedule.operatingDays.map(d => d.substring(0,3)).join(', ');
        }
        
        const formattedTime = formatTime12Hour(schedule.departureTime);
        card.innerHTML = `
            <div class="driver-card__header" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <h3 class="driver-card__name" style="margin: 0; font-size: 1.5rem; color: var(--text-light);">
                    🕒 ${formattedTime}
                </h3>
            </div>
            <div class="driver-card__details" style="display: block; padding: 0.5rem 0;">
                <div class="detail-item" style="text-align: left;">
                    <span class="detail-item__label">📅 Operating Days</span>
                    <span class="detail-item__value" style="color: var(--accent-success);">${daysText}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderRoutes() {
    const grid = document.getElementById('route-grid');
    if (!grid) return;

    if (allRoutes.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">🗺️</div>
                <p>No routes available.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = '';

    allRoutes.forEach(route => {
        const card = document.createElement('div');
        card.className = 'bus-card';
        
        const busObj = allBuses.find(b => b.id === route.assignedBus);
        const busName = busObj ? `[${busObj.busName}]` : (route.assignedBusName ? `[${route.assignedBusName}]` : '[Unassigned]');
        
        let stopsHtml = '';
        if (route.stops && route.stops.length > 0) {
            stopsHtml = '<div class="route-stops-list" style="display: flex; flex-direction: column; gap: 0.3rem; margin: 1rem 0; padding-left: 1rem; border-left: 2px solid var(--border-card);">';
            route.stops.forEach((stop, index) => {
                let dotColor = 'var(--text-muted)';
                if (index === 0) dotColor = 'var(--accent-success)';
                if (index === route.stops.length - 1) dotColor = 'var(--accent-warning)';
                
                stopsHtml += `
                    <div style="position: relative; padding-left: 1rem; font-size: 0.85rem; color: var(--text-muted);">
                        <div style="position: absolute; left: -1.4rem; top: 50%; transform: translateY(-50%); width: 8px; height: 8px; border-radius: 50%; background: ${dotColor}; border: 2px solid var(--bg-surface);"></div>
                        ${stop.name}
                    </div>
                `;
            });
            stopsHtml += '</div>';
        }

        card.innerHTML = `
            <div class="driver-card__header" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <h3 class="driver-card__name" style="margin: 0; font-size: 1.1rem;">${route.routeName}</h3>
                    <span class="status-badge ${route.assignedBus ? 'status-badge--active' : 'status-badge'}">${busName}</span>
                </div>
            </div>
            
            <div class="driver-card__details" style="display: block; padding: 0.5rem 0;">
                ${stopsHtml}
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function renderSchedules() {
    const grid = document.getElementById('schedule-grid');
    if (!grid) return;

    if (allSchedules.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">📅</div>
                <p>No schedules available.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = '';

    allSchedules.forEach(schedule => {
        const card = document.createElement('div');
        card.className = 'bus-card';
        
        let daysText = "All Days";
        if (schedule.operatingDays && schedule.operatingDays.length > 0) {
            if (schedule.operatingDays.length === 7) {
                daysText = "Everyday";
            } else {
                daysText = schedule.operatingDays.map(d => d.substring(0,3)).join(', ');
            }
        }
        
        const busObj = allBuses.find(b => b.id === schedule.busId);
        const busName = busObj ? busObj.busName : (schedule.busName || 'Unknown Bus');
        const formattedTime = formatTime12Hour(schedule.departureTime);

        card.innerHTML = `
            <div class="driver-card__header" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <h3 class="driver-card__name" style="margin: 0; font-size: 1.5rem; color: var(--text-light);">
                        🕒 ${formattedTime}
                    </h3>
                </div>
            </div>
            
            <div class="driver-card__details" style="display: block; padding: 0.5rem 0;">
                <div class="detail-item" style="margin-bottom: 0.5rem; text-align: left;">
                    <span class="detail-item__label">🚐 Assigned Bus</span>
                    <span class="detail-item__value" style="font-weight: 500;">${busName}</span>
                </div>
                <div class="detail-item" style="text-align: left;">
                    <span class="detail-item__label">📅 Operating Days</span>
                    <span class="detail-item__value" style="color: var(--accent-success);">${daysText}</span>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// ── Phase 19: Notifications System ──

let localNotifications = [];
let isMuted = localStorage.getItem('smartbus_notifications_muted') === 'true';

function initNotifications(user) {
    const userCreationTime = user && user.metadata && user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : 0;

    const bellBtn = document.getElementById('notification-bell');
    const dropdown = document.getElementById('notification-dropdown');
    const muteToggle = document.getElementById('mute-notifications-toggle');
    const clearBtn = document.getElementById('clear-notifications-btn');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            localNotifications = [];
            localStorage.setItem('smartbus_notifications_cleared', Date.now().toString());
            renderNotifications();
            const badge = document.getElementById('notification-badge');
            if (badge) {
                badge.style.display = 'none';
                badge.textContent = '0';
            }
        });
    }
    
    if (muteToggle) {
        muteToggle.checked = isMuted;
        muteToggle.addEventListener('change', (e) => {
            isMuted = e.target.checked;
            localStorage.setItem('smartbus_notifications_muted', isMuted);
        });
    }
    
    if (bellBtn && dropdown) {
        bellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
            // Hide badge when opening
            const badge = document.getElementById('notification-badge');
            if (badge) {
                badge.style.display = 'none';
                badge.textContent = '0';
            }
            localStorage.setItem('smartbus_notifications_last_seen', Date.now().toString());
        });
        
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !bellBtn.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }
    
    // Listen to global notifications from Firestore
    const qNotif = query(collection(db, "notifications"), orderBy("timestamp", "desc"), limit(20));
    onSnapshot(qNotif, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const data = change.doc.data();
                if (data.timestamp) {
                    const notifDate = data.timestamp.toDate ? data.timestamp.toDate() : new Date();
                    
                    if (notifDate.getTime() < userCreationTime) return;

                    const clearedTime = parseInt(localStorage.getItem('smartbus_notifications_cleared') || '0');
                    const lastSeenTime = parseInt(localStorage.getItem('smartbus_notifications_last_seen') || '0');
                    
                    if (notifDate.getTime() > clearedTime) {
                        const isNew = notifDate.getTime() > lastSeenTime;
                        addLocalNotification({
                            type: data.type,
                            message: data.message,
                            timestamp: notifDate,
                            isNew: isNew
                        }, false);
                    }
                }
            }
        });
        renderNotifications();
    });
}

function addLocalNotification(notif, renderNow = true) {
    // Prevent duplicates
    const exists = localNotifications.some(n => n.message === notif.message && Math.abs(n.timestamp - notif.timestamp) < 60000);
    if (exists) return;
    
    localNotifications.unshift(notif);
    
    // Keep max 20
    if (localNotifications.length > 20) {
        localNotifications.pop();
    }
    
    if (notif.isNew !== false && !isMuted) {
        // Show browser notification badge
        const badge = document.getElementById('notification-badge');
        const dropdown = document.getElementById('notification-dropdown');
        if (badge && (!dropdown || !dropdown.classList.contains('active'))) {
            badge.style.display = 'flex';
            let current = parseInt(badge.textContent) || 0;
            badge.textContent = current + 1;
        }
    }
    
    if (renderNow) renderNotifications();
}

function renderNotifications() {
    const listEl = document.getElementById('notification-list');
    if (!listEl) return;
    
    if (localNotifications.length === 0) {
        listEl.innerHTML = '<div class="notification-empty">No notifications yet.</div>';
        return;
    }
    
    // Sort by timestamp desc
    localNotifications.sort((a, b) => b.timestamp - a.timestamp);
    
    listEl.innerHTML = '';
    localNotifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = 'notification-item';
        
        let icon = '🔔';
        if (notif.type === 'bus_started') icon = '▶️';
        if (notif.type === 'bus_delayed') icon = '⏳';
        if (notif.type === 'bus_arrived') icon = '📍';
        
        let timeStr = 'Just now';
        if (notif.timestamp) {
            const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' };
            timeStr = notif.timestamp.toLocaleDateString('en-US', options);
        }
        
        item.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-text">${notif.message}</div>
                <div class="notification-time">${timeStr}</div>
            </div>
        `;
        listEl.appendChild(item);
    });
}

// ── Phase 20: Group Chat Logic ──

let currentChatBusId = null;
let currentChatUnsubscribe = null;
let currentUserProfile = null;
let chatMessagesCache = [];
let chatMessageLimit = 50;

let chatRoomMetas = {}; // Store lastMessageTime per bus

function updateChatBadges() {
    let totalUnread = 0;
    
    // Update individual bus badges
    document.querySelectorAll('.chat-room-item').forEach(item => {
        const busId = item.dataset.busId;
        if (!busId) return;
        
        const lastSeen = parseInt(localStorage.getItem(`chat_last_seen_${busId}`) || '0', 10);
        const lastMsgTime = chatRoomMetas[busId] || 0;
        
        let badge = item.querySelector('.chat-bus-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'nav-badge chat-bus-badge';
            const nameEl = item.querySelector('.chat-room-name');
            if (nameEl) nameEl.appendChild(badge);
        }
        
        if (lastMsgTime > lastSeen && busId !== currentChatBusId) {
            badge.textContent = '!';
            badge.style.display = 'inline-block';
            badge.style.marginLeft = '8px';
            totalUnread++;
        } else {
            badge.style.display = 'none';
        }
    });

    // Update main nav badge
    const mainBadge = document.getElementById('badge-chat');
    if (mainBadge) {
        if (totalUnread > 0) {
            mainBadge.textContent = totalUnread;
            mainBadge.style.display = 'inline-block';
        } else {
            mainBadge.style.display = 'none';
        }
    }
}

function initChat(user, profile) {
    currentUserProfile = profile;
    const chatRoomList = document.getElementById('chat-room-list');
    if (!chatRoomList) return;
    
    // Fetch all buses for chat list
    const qBuses = query(collection(db, "buses"));
    onSnapshot(qBuses, (snapshot) => {
        chatRoomList.innerHTML = '';
        if (snapshot.empty) {
            chatRoomList.innerHTML = '<div class="empty-state" style="padding: 2rem 1rem;">No buses available</div>';
            return;
        }
        
        snapshot.docs.forEach(docSnap => {
            const bus = docSnap.data();
            const busId = docSnap.id; // Fix: docSnap.id instead of bus.busId
            const busName = bus.busName;
            
            // Ensure chat room exists in Firestore
            ensureChatRoomExists(busId, busName);
            
            const item = document.createElement('div');
            item.className = 'chat-room-item';
            item.dataset.busId = busId; // added dataset for badge update
            if (busId === currentChatBusId) item.classList.add('active');
            
            item.innerHTML = `
                <div class="chat-room-icon">🚌</div>
                <div class="chat-room-info">
                    <div class="chat-room-name" style="display: flex; align-items: center;">${busName}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${bus.busNumber}</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                document.querySelectorAll('.chat-room-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                if (window.openChatRoom) window.openChatRoom(busId, busName);
            });
            
            chatRoomList.appendChild(item);
        });
        
        updateChatBadges(); // Initial badge render
    });

    // Listen to chatRooms metadata for new message timestamps
    const qRooms = query(collection(db, "chatRooms"));
    onSnapshot(qRooms, (snapshot) => {
        snapshot.docs.forEach(docSnap => {
            chatRoomMetas[docSnap.id] = docSnap.data().lastMessageTime?.toMillis() || 0;
        });
        updateChatBadges();
    });
}

async function ensureChatRoomExists(busId, busName) {
    try {
        const roomRef = doc(db, "chatRooms", busId);
        await setDoc(roomRef, {
            busId: busId,
            busName: busName,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.error("Error ensuring chat room exists", e);
    }
}

window.openChatRoom = function(busId, busName, updateHistory = true) {
    currentChatBusId = busId;
    chatMessageLimit = 50;
    
    // Update local storage last seen time
    localStorage.setItem(`chat_last_seen_${busId}`, Date.now().toString());
    updateChatBadges();
    
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML = `
        <div class="chat-header">
            <h3 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                <button class="chat-mobile-back" id="chat-mobile-back" aria-label="Back to bus list">←</button>
                🚌 <span>${busName} - Live Chat</span>
            </h3>
        </div>
        <div class="chat-messages" id="chat-messages-container">
            <div style="text-align: center; color: var(--text-muted); padding: 1rem;">Loading messages...</div>
        </div>
        <div class="chat-input-area">
            <textarea id="chat-input" class="chat-input" placeholder="Type a message..." rows="1"></textarea>
            <button id="chat-send-btn" class="chat-send-btn" disabled>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
        </div>
    `;

    // Add mobile active class to layout to show chat window
    const chatLayout = document.querySelector('.chat-layout');
    if (chatLayout) chatLayout.classList.add('chat-mobile-active');

    // Handle internal back button
    const backBtn = document.getElementById('chat-mobile-back');
    if (backBtn) {
        backBtn.onclick = () => {
            history.back(); // Use history API instead of direct toggle
        };
    }

    if (updateHistory) {
        history.pushState({ section: 'chat-inbox', busId: busId, busName: busName }, "", "#chat-inbox");
    }
    
    const inputEl = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const msgContainer = document.getElementById('chat-messages-container');
    
    // Auto-resize input
    inputEl.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        sendBtn.disabled = this.value.trim() === '';
    });
    
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (inputEl.value.trim() !== '') {
                sendMessage(busId, inputEl.value.trim());
                inputEl.value = '';
                inputEl.style.height = 'auto';
                sendBtn.disabled = true;
            }
        }
    });
    
    sendBtn.addEventListener('click', () => {
        if (inputEl.value.trim() !== '') {
            sendMessage(busId, inputEl.value.trim());
            inputEl.value = '';
            inputEl.style.height = 'auto';
            sendBtn.disabled = true;
        }
    });

    // Pagination scroll listener
    msgContainer.addEventListener('scroll', () => {
        if (msgContainer.scrollTop === 0 && chatMessagesCache.length >= chatMessageLimit) {
            chatMessageLimit += 50;
            loadMessages(busId);
        }
    });
    
    loadMessages(busId);
}

function loadMessages(busId) {
    if (currentChatUnsubscribe) {
        currentChatUnsubscribe();
    }
    
    const messagesRef = collection(db, "chatRooms", busId, "messages");
    const qMsgs = query(messagesRef, orderBy("timestamp", "desc"), limit(chatMessageLimit));
    
    currentChatUnsubscribe = onSnapshot(qMsgs, (snapshot) => {
        const msgContainer = document.getElementById('chat-messages-container');
        if (!msgContainer || currentChatBusId !== busId) return;
        
        chatMessagesCache = [];
        snapshot.forEach(docSnap => {
            chatMessagesCache.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        // Reverse to show oldest first
        chatMessagesCache.reverse();
        
        renderMessages(busId, msgContainer);
    }, (error) => {
        console.error("Chat onSnapshot Error:", error);
        const msgContainer = document.getElementById('chat-messages-container');
        if (msgContainer && error.code === 'permission-denied') {
            msgContainer.innerHTML = '<div style="color: #ff4d4d; text-align: center; padding: 2rem;">Error: Permission Denied. Please update Firestore Rules to allow read/write for chatRooms.</div>';
        } else if (msgContainer && error.message.includes('index')) {
            msgContainer.innerHTML = '<div style="color: #ff4d4d; text-align: center; padding: 2rem;">Error: Index required. Check console for the link to create it.</div>';
        } else if (msgContainer) {
            msgContainer.innerHTML = '<div style="color: #ff4d4d; text-align: center; padding: 2rem;">Error loading messages: ' + error.message + '</div>';
        }
    });
}

async function renderMessages(busId, container) {
    // Keep track of scroll height to maintain scroll position when loading older messages
    const previousScrollHeight = container.scrollHeight;
    const previousScrollTop = container.scrollTop;
    
    container.innerHTML = '';
    
    if (chatMessagesCache.length >= chatMessageLimit) {
        const loadMoreDiv = document.createElement('div');
        loadMoreDiv.style.textAlign = 'center';
        loadMoreDiv.style.padding = '0.5rem';
        loadMoreDiv.innerHTML = '<button class="load-more-btn">Load earlier messages</button>';
        loadMoreDiv.querySelector('.load-more-btn').addEventListener('click', () => {
            chatMessageLimit += 50;
            loadMessages(busId);
        });
        container.appendChild(loadMoreDiv);
    }
    
    if (chatMessagesCache.length === 0) {
        container.innerHTML = '<div class="chat-empty-state"><span class="chat-empty-icon">💬</span><p>No messages yet. Be the first to say hello!</p></div>';
        return;
    }
    
    let currentUserId = currentUserProfile ? currentUserProfile.uid : null;
    
    chatMessagesCache.forEach(msg => {
        const isOwn = msg.senderId === currentUserId;
        const msgWrapper = document.createElement('div');
        msgWrapper.className = 'chat-message-wrapper ' + (isOwn ? 'chat-message-wrapper--own' : 'chat-message-wrapper--other');
        
        let timeStr = 'Sending...';
        if (msg.timestamp && typeof msg.timestamp.toDate === 'function') {
            const date = msg.timestamp.toDate();
            timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
        
        let contentHtml = msg.isDeleted ? '<em>This message was deleted</em>' : msg.text;
        let messageClass = isOwn ? 'chat-message--own' : 'chat-message--other';
        if (msg.isDeleted) messageClass += ' chat-message--deleted';
        
        // Seen indicator logic (only for own non-deleted messages)
        let seenHtml = '';
        if (isOwn && !msg.isDeleted) {
            const readCount = (msg.readBy || []).filter(uid => uid !== currentUserId).length;
            if (readCount > 0) {
                seenHtml = '<span style="color: #4CAF50; font-weight: bold; margin-left: 4px;">✓✓</span>';
            } else {
                seenHtml = '<span style="color: rgba(255,255,255,0.5); margin-left: 4px;">✓</span>';
            }
        }
        
        let editedHtml = msg.isEdited && !msg.isDeleted ? '<span style="font-size: 0.65rem; margin-left: 4px; font-style: italic;">(edited)</span>' : '';

        let actionsHtml = '';
        if (isOwn && !msg.isDeleted) {
            actionsHtml = `
                <div class="chat-message-actions">
                    <button class="chat-action-btn chat-action-btn--edit" onclick="editMessage('${busId}', '${msg.id}', \`${(msg.text || '').replace(/`/g, '\\`')}\`)">✏️</button>
                    <button class="chat-action-btn chat-action-btn--delete" onclick="deleteMessage('${busId}', '${msg.id}')">🗑️</button>
                </div>
            `;
        }

        msgWrapper.innerHTML = `
            ${!isOwn ? `<div class="chat-message-sender">${msg.senderName}</div>` : ''}
            <div class="chat-message ${messageClass}">
                ${contentHtml}
                ${actionsHtml}
            </div>
            <div class="chat-message-meta">
                ${timeStr} ${editedHtml} ${seenHtml}
            </div>
        `;
        
        container.appendChild(msgWrapper);
        
        // Mark as seen if it's someone else's message
        if (!isOwn && !msg.isDeleted) {
            markMessageAsSeen(busId, msg.id, msg.readBy || []);
        }
    });
    
    // Auto-scroll logic
    // If we were at the bottom, stay at the bottom. Otherwise maintain relative position
    if (previousScrollTop === 0 && chatMessageLimit > 50) {
        // We just loaded older messages, maintain scroll pos
        container.scrollTop = container.scrollHeight - previousScrollHeight;
    } else {
        // Normal scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
}

async function sendMessage(busId, text) {
    if (!currentUserProfile) return;
    try {
        const messagesRef = collection(db, "chatRooms", busId, "messages");
        const roomRef = doc(db, "chatRooms", busId);
        
        await addDoc(messagesRef, {
            text: text,
            senderId: currentUserProfile.uid,
            senderName: currentUserProfile.name || "Student",
            timestamp: serverTimestamp(),
            isEdited: false,
            isDeleted: false,
            readBy: [currentUserProfile.uid]
        });
        
        await setDoc(roomRef, {
            lastMessageTime: serverTimestamp()
        }, { merge: true });
        
        // Update local storage since we sent the message
        localStorage.setItem(`chat_last_seen_${busId}`, Date.now().toString());
        updateChatBadges();
        
    } catch (e) {
        console.error("Error sending message", e);
        alert("Error sending message: " + e.message);
    }
}

window.editMessage = async function(busId, msgId, oldText) {
    const newText = prompt("Edit your message:", oldText);
    if (newText !== null && newText.trim() !== '' && newText !== oldText) {
        try {
            const msgRef = doc(db, "chatRooms", busId, "messages", msgId);
            await updateDoc(msgRef, {
                text: newText.trim(),
                isEdited: true
            });
        } catch (e) {
            console.error("Error editing message", e);
        }
    }
};

window.deleteMessage = async function(busId, msgId) {
    if (confirm("Are you sure you want to delete this message?")) {
        try {
            const msgRef = doc(db, "chatRooms", busId, "messages", msgId);
            await updateDoc(msgRef, {
                isDeleted: true,
                text: ""
            });
        } catch (e) {
            console.error("Error deleting message", e);
        }
    }
};

async function markMessageAsSeen(busId, msgId, currentReadBy) {
    if (!currentUserProfile) return;
    const currentUserId = currentUserProfile.uid;
    if (!currentReadBy.includes(currentUserId)) {
        try {
            const msgRef = doc(db, "chatRooms", busId, "messages", msgId);
            const newReadBy = [...currentReadBy, currentUserId];
            await updateDoc(msgRef, {
                readBy: newReadBy
            });
        } catch (e) {
            // Ignore minor errors in read receipts
        }
    }
}

// ── Phase 21: Announcements ──

let studentAnnouncements = [];
let unsubscribeStudentAnnouncements = null;

window.goToAnnouncements = function() {
    const navAnn = document.getElementById('nav-announcements');
    if (navAnn) navAnn.click();
};

function initAnnouncements() {
    const btnViewAll = document.getElementById('btn-view-all-announcements');
    if (btnViewAll) {
        btnViewAll.addEventListener('click', () => {
            window.goToAnnouncements();
        });
    }

    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    
    unsubscribeStudentAnnouncements = onSnapshot(q, (snapshot) => {
        studentAnnouncements = [];
        let hasNewAnnouncements = false;
        const lastSeen = parseInt(localStorage.getItem('announcements_last_seen') || '0', 10);
        
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            studentAnnouncements.push({ id: docSnap.id, ...data });
            
            const itemTime = data.updatedAt?.toMillis ? data.updatedAt.toMillis() : (data.createdAt?.toMillis ? data.createdAt.toMillis() : 0);
            if (itemTime > lastSeen) hasNewAnnouncements = true;
        });
        
        const badge = document.getElementById('badge-announcements');
        if (badge) {
            if (hasNewAnnouncements) {
                badge.textContent = '!';
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
        
        renderStudentAnnouncements();
        updateDashboardBanner();
    });
}

function updateDashboardBanner() {
    const banner = document.getElementById('urgent-announcement-banner');
    const titleEl = document.getElementById('urgent-announcement-title');
    const msgEl = document.getElementById('urgent-announcement-message');
    
    if (!banner || !titleEl || !msgEl) return;
    
    const urgentAnns = studentAnnouncements.filter(a => a.priority === 'urgent');
    
    if (urgentAnns.length > 0) {
        const latest = urgentAnns[0];
        titleEl.textContent = latest.title;
        msgEl.innerHTML = (latest.message || '').replace(/\\n/g, '<br>');
        banner.style.display = 'block';
    } else {
        banner.style.display = 'none';
    }
}

function renderStudentAnnouncements() {
    const grid = document.getElementById('student-announcement-grid');
    if (!grid) return;
    
    if (studentAnnouncements.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">📢</div>
                <p>No announcements at this time.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    
    studentAnnouncements.forEach(ann => {
        const card = document.createElement('div');
        card.className = 'bus-card';
        
        let icon = '📢';
        let typeColor = 'var(--text-muted)';
        
        if (ann.type === 'notice') { icon = '📋'; typeColor = '#3b82f6'; }
        else if (ann.type === 'alert') { icon = '⚠️'; typeColor = '#ef4444'; }
        else if (ann.type === 'schedule_change') { icon = '📅'; typeColor = '#f59e0b'; }
        
        let priorityBadge = '';
        if (ann.priority === 'urgent') {
            priorityBadge = `<span style="background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; border: 1px solid rgba(239, 68, 68, 0.4); margin-left: auto;">URGENT</span>`;
        }
        
        let dateStr = 'Just now';
        if (ann.createdAt && typeof ann.createdAt.toDate === 'function') {
            dateStr = ann.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; width: 100%;">
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; width: 100%;">
                    <span style="font-size: 1.2rem;">${icon}</span>
                    <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-light); word-break: break-word; flex: 1;">${ann.title}</h3>
                    ${priorityBadge}
                </div>
            </div>
            
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; line-height: 1.4; word-break: break-word;">
                ${(ann.message || '').replace(/\\n/g, '<br>')}
            </p>
            
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.8rem; margin-top: auto;">
                <span style="color: ${typeColor}; font-size: 0.8rem; font-weight: 500;">
                    ${ann.type === 'schedule_change' ? 'Schedule Change' : (ann.type === 'alert' ? 'Alert' : 'Notice')} • ${dateStr}
                </span>
                <span style="color: var(--text-muted); font-size: 0.75rem;">
                    Posted by Admin
                </span>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// ── Settings Logic ──
function initSettings(user, profile) {
    const formProfile = document.getElementById('settings-profile-form');
    const formPassword = document.getElementById('settings-password-form');
    const btnDelete = document.getElementById('btn-delete-account');

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
            btn.textContent = 'Updating...';
            btn.disabled = true;

            const newName = inputName.value.trim();

            if (!newName) {
                if (window.showToast) window.showToast("Name is required", 'error');
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
                    if (window.showToast) window.showToast(result.message || "Profile updated successfully!", 'success');
                    
                    // Update local UI state
                    profile.name = newName;
                    
                    const nameEl = document.getElementById("user-name");
                    const welcomeEl = document.getElementById("welcome-message");
                    if (nameEl) nameEl.textContent = profile.name;
                    if (welcomeEl) welcomeEl.textContent = `Welcome, ${profile.name}!`;

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
                if (window.showToast) window.showToast("New passwords do not match", 'error');
                return;
            }

            const btn = document.getElementById('btn-update-password');
            const originalText = btn.textContent;
            btn.textContent = 'Updating...';
            btn.disabled = true;

            try {
                // 1. Re-authenticate user
                const credential = EmailAuthProvider.credential(user.email, currentPwd);
                await reauthenticateWithCredential(user, credential);
                
                // 2. Update password
                await updatePassword(user, newPwd);
                
                if (window.showToast) window.showToast("Password updated successfully!", 'success');
                formPassword.reset();
            } catch (error) {
                console.error("Password update error:", error);
                let msg = "Failed to update password";
                if (error.code === 'auth/invalid-credential') msg = "Incorrect current password";
                if (error.code === 'auth/weak-password') msg = "New password is too weak";
                if (window.showToast) window.showToast(msg, 'error');
            }

            btn.textContent = originalText;
            btn.disabled = false;
        });
    }

    if (btnDelete) {
        btnDelete.addEventListener('click', async () => {
            const confirmed = confirm("Are you sure you want to delete your account? This action cannot be undone.");
            if (!confirmed) return;

            const password = prompt("Please enter your password to confirm account deletion:");
            if (!password) return;

            const originalText = btnDelete.textContent;
            btnDelete.textContent = 'Deleting...';
            btnDelete.disabled = true;

            try {
                // 1. Re-authenticate
                const credential = EmailAuthProvider.credential(user.email, password);
                await reauthenticateWithCredential(user, credential);
                
                // 2. Get token
                const token = await user.getIdToken(true);
                
                // 3. Call backend delete endpoint
                const response = await fetch(`${API_BASE_URL}/Auth/account`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.error || "Failed to delete account from server");
                }
                
                // 4. Delete Firebase Auth user
                await deleteUser(user);
                
                if (window.showToast) window.showToast("Account deleted successfully.", 'success');
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);

            } catch (error) {
                console.error("Account deletion error:", error);
                let msg = error.message || "Failed to delete account";
                if (error.code === 'auth/invalid-credential') msg = "Incorrect password";
                if (window.showToast) window.showToast(msg, 'error');
                
                btnDelete.textContent = originalText;
                btnDelete.disabled = false;
            }
        });
    }
}

// ── Phase 22: Report Admin Logic ──
function initReportAdmin(user, profile) {
    const reportForm = document.getElementById('report-admin-form');
    const previousReportsList = document.getElementById('previous-reports-list');
    
    if (reportForm) {
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const topic = document.getElementById('report-topic').value;
            const message = document.getElementById('report-message').value.trim();
            const btnSubmit = document.getElementById('btn-submit-report');
            
            if (!topic || !message) {
                if (window.showToast) window.showToast("Please fill in both topic and message.", "error");
                return;
            }
            
            const originalText = btnSubmit.innerHTML;
            btnSubmit.innerHTML = '<span>⏳</span> Submitting...';
            btnSubmit.disabled = true;
            
            try {
                const reportsRef = collection(db, "reports");
                await addDoc(reportsRef, {
                    userId: user.uid,
                    userName: profile.name || "Student",
                    userEmail: profile.email || user.email,
                    topic: topic,
                    message: message,
                    status: 'pending',
                    createdAt: serverTimestamp()
                });
                
                if (window.showToast) window.showToast("Report submitted successfully!", "success");
                reportForm.reset();
            } catch (error) {
                console.error("Error submitting report:", error);
                if (window.showToast) window.showToast("Failed to submit report. Please try again.", "error");
            } finally {
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
            }
        });
    }

    if (previousReportsList) {
        // Removed orderBy to prevent composite index requirement. We sort client-side instead.
        const q = query(collection(db, "reports"), where("userId", "==", user.uid));
        onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                previousReportsList.innerHTML = `
                    <div class="empty-state" style="padding: 2rem;">
                        <div class="empty-state__icon">📝</div>
                        <p style="color: var(--text-muted);">You haven't submitted any reports yet.</p>
                    </div>
                `;
                return;
            }
            
            previousReportsList.innerHTML = '';
            
            const reports = [];
            snapshot.forEach(docSnap => {
                reports.push({ id: docSnap.id, ...docSnap.data() });
            });
            
            // Client-side sort by createdAt descending
            reports.sort((a, b) => {
                const timeA = a.createdAt?.toMillis() || 0;
                const timeB = b.createdAt?.toMillis() || 0;
                return timeB - timeA;
            });
            
            let hasUnreadFeedback = false;
            const lastSeenReport = parseInt(localStorage.getItem('report_last_seen') || '0', 10);
            
            reports.forEach(report => {
                if (report.adminFeedback && report.updatedAt) {
                    const updatedAt = typeof report.updatedAt.toMillis === 'function' ? report.updatedAt.toMillis() : 0;
                    if (updatedAt > lastSeenReport) {
                        hasUnreadFeedback = true;
                    }
                }
                
                const card = document.createElement('div');
                card.style.cssText = `
                    padding: 1.5rem; 
                    background: var(--bg-surface); 
                    border: 1px solid var(--border-card); 
                    border-radius: 16px; 
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); 
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                `;
                
                // Add hover effect via JS since inline hover isn't possible
                card.onmouseenter = () => { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'; };
                card.onmouseleave = () => { card.style.transform = 'translateY(0)'; card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)'; };
                
                let dateStr = 'Just now';
                if (report.createdAt && typeof report.createdAt.toDate === 'function') {
                    dateStr = report.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                }
                
                let statusBadge = '';
                if (report.status === 'pending') {
                    statusBadge = '<div style="display: flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 20px; color: var(--accent-warning); font-size: 0.75rem; font-weight: 600;"><span style="width: 6px; height: 6px; background: var(--accent-warning); border-radius: 50%; box-shadow: 0 0 6px var(--accent-warning);"></span> Pending</div>';
                } else if (report.status === 'completed') {
                    statusBadge = '<div style="display: flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 20px; color: var(--accent-success); font-size: 0.75rem; font-weight: 600;"><span style="width: 6px; height: 6px; background: var(--accent-success); border-radius: 50%; box-shadow: 0 0 6px var(--accent-success);"></span> Completed</div>';
                } else if (report.status === 'processing') {
                    statusBadge = '<div style="display: flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 20px; color: #3b82f6; font-size: 0.75rem; font-weight: 600;"><span style="width: 6px; height: 6px; background: #3b82f6; border-radius: 50%; box-shadow: 0 0 6px #3b82f6;"></span> Processing</div>';
                } else if (report.status === 'cancelled') {
                    statusBadge = '<div style="display: flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 20px; color: #ef4444; font-size: 0.75rem; font-weight: 600;"><span style="width: 6px; height: 6px; background: #ef4444; border-radius: 50%;"></span> Cancelled</div>';
                } else {
                    statusBadge = `<div style="padding: 4px 12px; background: var(--bg-surface-hover); border-radius: 20px; color: var(--text-muted); font-size: 0.75rem;">${report.status || 'Unknown'}</div>`;
                }

                let topicIcon = '📋';
                const t = report.topic || '';
                if (t.includes('Bus')) topicIcon = '🚐';
                else if (t.includes('Driver')) topicIcon = '👨‍✈️';
                else if (t.includes('Bug') || t.includes('Technical')) topicIcon = '🐞';
                else if (t.includes('Suggestion')) topicIcon = '💡';

                let feedbackHtml = '';
                if (report.adminFeedback) {
                    feedbackHtml = `
                        <div style="margin-top: 0.5rem; padding: 1rem; background: linear-gradient(to right, rgba(108, 99, 255, 0.1), rgba(108, 99, 255, 0.02)); border-left: 4px solid var(--accent-primary); border-radius: 8px; position: relative;">
                            <div style="position: absolute; top: -10px; left: 1rem; background: var(--accent-primary); color: white; padding: 2px 10px; border-radius: 12px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(108,99,255,0.3);">Admin Reply</div>
                            <p style="color: var(--text-primary); font-size: 0.95rem; margin: 0; margin-top: 0.2rem; line-height: 1.5; font-style: italic;">
                                "${report.adminFeedback}"
                            </p>
                        </div>
                    `;
                }

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(108, 99, 255, 0.1); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border: 1px solid rgba(108, 99, 255, 0.2);">
                                ${topicIcon}
                            </div>
                            <div>
                                <h4 style="margin: 0; color: var(--text-primary); font-size: 1.15rem; font-weight: 600;">${report.topic}</h4>
                                <span style="font-size: 0.8rem; color: var(--text-muted); opacity: 0.8;">${dateStr}</span>
                            </div>
                        </div>
                        ${statusBadge}
                    </div>
                    
                    <div style="background: var(--bg-surface-hover); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-card);">
                        <p style="margin: 0; color: var(--text-light); font-size: 0.95rem; line-height: 1.6; word-break: break-word;">
                            ${(report.message || '').replace(/\n/g, '<br>')}
                        </p>
                    </div>
                    
                    ${feedbackHtml}
                `;
                previousReportsList.appendChild(card);
            });
            
            const reportBadge = document.getElementById('badge-report');
            if (reportBadge) {
                if (hasUnreadFeedback) {
                    reportBadge.textContent = '!';
                    reportBadge.style.display = 'inline-block';
                } else {
                    reportBadge.style.display = 'none';
                }
            }
            
        }, (error) => {
            console.error("Error fetching reports:", error);
            // Ignore index errors silently on UI for now, or display generic msg
            previousReportsList.innerHTML = `
                <div class="empty-state" style="padding: 2rem;">
                    <p style="color: var(--text-muted);">Could not load previous reports. (Index might be building)</p>
                </div>
            `;
        });
    }
}
