// ========================================
// Smart Campus Bus — Route Management
// ========================================

import { db } from "./firebase-config.js";
import { collection, query, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ApiService } from "./api.js";
// State
let allRoutes = [];
let allBuses = [];
let unsubscribeRoutes = null;
let stopCount = 0;

// Map Picker State (Phase 12 & 13)
let pickerMap = null;
let pickerMarkers = {}; // key: 'start' | 'end' | 'stop-N', value: L.marker
let activePickTarget = null; // which field is currently being picked
let pickerPolyline = null; // Phase 13: live route preview

// DOM Elements
const routeGrid = document.getElementById('route-grid');
const btnAddRoute = document.getElementById('btn-add-route');
const routeModal = document.getElementById('route-modal');
const routeForm = document.getElementById('route-form');
const btnModalClose = document.getElementById('route-modal-close');
const btnModalCancel = document.getElementById('route-modal-cancel');
const routeModalTitle = document.getElementById('route-modal-title');
const routeBusSelect = document.getElementById('route-bus');
const btnAddStop = document.getElementById('btn-add-stop');
const routeStopsContainer = document.getElementById('route-stops-container');

// ── Initialization ──
export function initRouteManagement() {
    setupRoutesListener();
    fetchBuses();
    
    // Listeners
    if (btnAddRoute) btnAddRoute.addEventListener('click', openAddRouteModal);
    if (btnModalClose) btnModalClose.addEventListener('click', closeModal);
    if (btnModalCancel) btnModalCancel.addEventListener('click', closeModal);
    if (routeForm) routeForm.addEventListener('submit', handleRouteSubmit);
    if (btnAddStop) btnAddStop.addEventListener('click', () => addStopInput());
    
    // Pick location buttons (Start / End)
    document.querySelectorAll('.btn-pick-location').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target; // 'start' or 'end'
            setActivePickTarget(target);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initRouteManagement, 600);
});

// ── Map Picker Logic (Phase 12) ──
function initMapPicker() {
    if (pickerMap) {
        // Map already initialized, just reset view
        pickerMap.setView([23.8122, 90.3582], 14);
        return;
    }
    
    const mapEl = document.getElementById('route-map-picker');
    if (!mapEl || typeof L === 'undefined') return;
    
    pickerMap = L.map('route-map-picker').setView([23.8122, 90.3582], 14); // BUBT coordinates
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(pickerMap);
    
    // Add Search Geocoder Control
    if (L.Control.Geocoder) {
        L.Control.geocoder({
            defaultMarkGeocode: false, // Don't place a default marker
            placeholder: "Search for a place (e.g., Mirpur 10)...",
            geocoder: L.Control.Geocoder.nominatim({
                geocodingQueryParams: {
                    countrycodes: 'bd' // Bias search to Bangladesh
                }
            })
        })
        .on('markgeocode', function(e) {
            const center = e.geocode.center;
            pickerMap.flyTo(center, 18); // Zoom much closer for precise placing
            
            // Show toast instruction
            if (window.showToast) {
                window.showToast("Location found! Now select a stop and click on the map to place it.", "success", 4000);
            }
        })
        .addTo(pickerMap);
    }
    
    // Click handler — place marker for active pick target
    pickerMap.on('click', (e) => {
        if (!activePickTarget) return;
        
        const { lat, lng } = e.latlng;
        placeMarkerForTarget(activePickTarget, lat, lng);
        updateCoordsDisplay(activePickTarget, lat, lng);
        
        // Phase 13: Update preview route line
        updateRoutePreviewLine();
        
        // Clear active state
        const statusEl = document.getElementById('map-picker-status');
        if (statusEl) statusEl.textContent = `✅ Location set for "${getTargetLabel(activePickTarget)}". Select another stop or continue.`;
        
        // Remove picking class from buttons
        document.querySelectorAll('.btn-pick-location.picking').forEach(b => b.classList.remove('picking'));
        activePickTarget = null;
    });
}

function setActivePickTarget(target) {
    activePickTarget = target;
    
    // Update UI to show which is active
    document.querySelectorAll('.btn-pick-location').forEach(b => b.classList.remove('picking'));
    const btn = document.querySelector(`.btn-pick-location[data-target="${target}"]`);
    if (btn) btn.classList.add('picking');
    
    const statusEl = document.getElementById('map-picker-status');
    if (statusEl) statusEl.textContent = `🎯 Click on the map to set location for: "${getTargetLabel(target)}"`;
}

function getTargetLabel(target) {
    if (target === 'start') return 'Start Point';
    if (target === 'end') return 'End Point';
    // For intermediate stops
    const container = document.getElementById(`container-${target}`);
    if (container) {
        const input = container.querySelector('.stop-input');
        return input?.value || `Stop ${target.replace('stop-', '#')}`;
    }
    return target;
}

function createMarkerIcon(color, label) {
    return L.divIcon({
        html: `<div style="
            width: 28px; height: 28px; 
            background: ${color}; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: bold; color: white;
        ">${label}</div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
}

function placeMarkerForTarget(target, lat, lng) {
    // Remove existing marker for this target
    if (pickerMarkers[target]) {
        pickerMap.removeLayer(pickerMarkers[target]);
    }
    
    let color, label;
    if (target === 'start') {
        color = '#00c853'; label = 'S';
    } else if (target === 'end') {
        color = '#ff4444'; label = 'E';
    } else {
        color = '#448aff'; label = target.replace('stop-', '');
    }
    
    const icon = createMarkerIcon(color, label);
    pickerMarkers[target] = L.marker([lat, lng], { icon }).addTo(pickerMap);
}

function updateCoordsDisplay(target, lat, lng) {
    if (target === 'start') {
        document.getElementById('route-start-lat').value = lat;
        document.getElementById('route-start-lng').value = lng;
        const coordsEl = document.getElementById('route-start-coords');
        coordsEl.textContent = `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        coordsEl.classList.add('has-coords');
    } else if (target === 'end') {
        document.getElementById('route-end-lat').value = lat;
        document.getElementById('route-end-lng').value = lng;
        const coordsEl = document.getElementById('route-end-coords');
        coordsEl.textContent = `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        coordsEl.classList.add('has-coords');
    } else {
        // Intermediate stop
        const container = document.getElementById(`container-${target}`);
        if (container) {
            container.querySelector('.stop-lat').value = lat;
            container.querySelector('.stop-lng').value = lng;
            const coordsEl = container.querySelector('.stop-coords');
            if (coordsEl) {
                coordsEl.textContent = `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                coordsEl.classList.add('has-coords');
            }
        }
    }
}

function clearAllPickerMarkers() {
    Object.keys(pickerMarkers).forEach(key => {
        if (pickerMap && pickerMarkers[key]) {
            pickerMap.removeLayer(pickerMarkers[key]);
        }
    });
    pickerMarkers = {};
    
    if (pickerPolyline && pickerMap) {
        pickerMap.removeLayer(pickerPolyline);
        pickerPolyline = null;
    }
}

// ── Phase 13: Live Route Preview ──
function updateRoutePreviewLine() {
    if (!pickerMap) return;
    
    if (pickerPolyline) {
        pickerMap.removeLayer(pickerPolyline);
        pickerPolyline = null;
    }
    
    const bounds = [];
    
    // Gather coordinates in logical order: start -> intermediate stops -> end
    const startLat = parseFloat(document.getElementById('route-start-lat').value);
    const startLng = parseFloat(document.getElementById('route-start-lng').value);
    if (!isNaN(startLat) && !isNaN(startLng)) {
        bounds.push([startLat, startLng]);
    }
    
    const stopContainers = document.getElementById('route-stops-container')?.querySelectorAll('.route-stop-item') || [];
    stopContainers.forEach(container => {
        const lat = parseFloat(container.querySelector('.stop-lat')?.value);
        const lng = parseFloat(container.querySelector('.stop-lng')?.value);
        if (!isNaN(lat) && !isNaN(lng)) {
            bounds.push([lat, lng]);
        }
    });
    
    const endLat = parseFloat(document.getElementById('route-end-lat').value);
    const endLng = parseFloat(document.getElementById('route-end-lng').value);
    if (!isNaN(endLat) && !isNaN(endLng)) {
        bounds.push([endLat, endLng]);
    }
    
    if (bounds.length > 1) {
        pickerPolyline = L.polyline(bounds, {
            color: '#6c63ff',
            weight: 3,
            opacity: 0.5,
            dashArray: '6, 6',
            lineCap: 'round'
        }).addTo(pickerMap);
    }
}

// ── Real-time Listener ──
function setupRoutesListener() {
    const q = query(collection(db, "routes"));
    
    unsubscribeRoutes = onSnapshot(q, (snapshot) => {
        allRoutes = [];
        snapshot.forEach((doc) => {
            allRoutes.push({ id: doc.id, ...doc.data() });
        });
        
        allRoutes.sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA;
        });

        updateRouteStats();
        renderRoutes();
    }, (error) => {
        console.error("Error fetching routes:", error);
        if (routeGrid) {
            routeGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state__icon">⚠️</div>
                    <p>Failed to load routes.</p>
                </div>
            `;
        }
    });
}

// ── Fetch Buses ──
function fetchBuses() {
    const q = query(collection(db, "buses"));
    onSnapshot(q, (snapshot) => {
        allBuses = [];
        snapshot.forEach((doc) => {
            allBuses.push({ id: doc.id, ...doc.data() });
        });
        populateBusDropdown();
        // Also re-render routes to update dynamic bus names if needed
        renderRoutes();
    }, (error) => {
        console.error("Error fetching buses:", error);
    });
}

function populateBusDropdown() {
    if (!routeBusSelect) return;
    routeBusSelect.innerHTML = '<option value="">-- Select Bus --</option>';
    allBuses.forEach(bus => {
        const option = document.createElement('option');
        option.value = bus.id;
        option.textContent = `${bus.busName} (${bus.busNumber})`;
        routeBusSelect.appendChild(option);
    });
}

// ── Stats ──
function updateRouteStats() {
    const total = allRoutes.length;
    const assigned = allRoutes.filter(r => r.assignedBus).length;
    const unassigned = total - assigned;

    document.getElementById('route-stat-total').textContent = total;
    document.getElementById('route-stat-assigned').textContent = assigned;
    document.getElementById('route-stat-unassigned').textContent = unassigned;
}

// ── Render ──
function renderRoutes() {
    if (!routeGrid) return;

    if (allRoutes.length === 0) {
        routeGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">🗺️</div>
                <p>No routes added yet.</p>
            </div>
        `;
        return;
    }

    routeGrid.innerHTML = '';

    allRoutes.forEach(route => {
        const card = document.createElement('div');
        card.className = 'bus-card'; // Reusing bus-card styles
        
        const busObj = allBuses.find(b => b.id === route.assignedBus);
        const busName = busObj ? `[${busObj.busName}]` : (route.assignedBusName ? `[${route.assignedBusName}]` : '[Unassigned]');
        
        // Build stops list visualization
        let stopsHtml = '';
        if (route.stops && route.stops.length > 0) {
            stopsHtml = '<div class="route-stops-list">';
            route.stops.forEach(stop => {
                const hasCoords = stop.latitude && stop.longitude;
                const coordsBadge = hasCoords 
                    ? '<span style="font-size: 0.7rem; color: var(--accent-success); margin-left: 0.3rem;">📍</span>' 
                    : '';
                stopsHtml += `<div class="route-stops-list__item">${stop.name}${coordsBadge}</div>`;
            });
            stopsHtml += '</div>';
        } else {
            // Fallback to start/end if no explicit stops array is present
            stopsHtml = `
                <div class="route-stops-list">
                    <div class="route-stops-list__item">${route.startPoint}</div>
                    <div class="route-stops-list__item">${route.endPoint}</div>
                </div>
            `;
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
            
            <div class="driver-card__actions" style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-card);">
                <button class="btn-action" style="background: rgba(108, 99, 255, 0.15); color: var(--accent-primary);" onclick="window.editRoute('${route.id}')">
                    <span>✏️</span> Edit
                </button>
                <button class="btn-action btn-reject" onclick="window.deleteRoute('${route.id}')">
                    <span>🗑️</span> Delete
                </button>
            </div>
        `;
        
        routeGrid.appendChild(card);
    });
}

// ── Dynamic Stops ──
function addStopInput(value = '', lat = '', lng = '') {
    stopCount++;
    const stopId = `stop-${stopCount}`;
    
    const div = document.createElement('div');
    div.className = 'route-stop-item';
    div.id = `container-${stopId}`;
    div.style.flexWrap = 'wrap';
    
    div.innerHTML = `
        <div class="form-group__input-wrapper" style="flex: 1;">
            <input type="text" class="form-group__input stop-input" placeholder="Stop Name" value="${value}" required>
        </div>
        <button type="button" class="btn-pick-location" data-target="${stopId}" title="Pick location on map">📍 Pick</button>
        <button type="button" class="btn-remove-stop" onclick="window.removeStop('${stopId}')" title="Remove stop">×</button>
        <input type="hidden" class="stop-lat" value="${lat}">
        <input type="hidden" class="stop-lng" value="${lng}">
        <div class="stop-coords ${lat ? 'has-coords' : ''}" style="width: 100%; padding-left: 0.5rem;">${lat ? `📍 ${parseFloat(lat).toFixed(5)}, ${parseFloat(lng).toFixed(5)}` : 'No location set'}</div>
    `;
    
    // Attach pick button listener
    const pickBtn = div.querySelector('.btn-pick-location');
    pickBtn.addEventListener('click', () => {
        setActivePickTarget(stopId);
    });
    
    routeStopsContainer.appendChild(div);
    
    // If coordinates exist, show marker on map
    if (lat && lng && pickerMap) {
        placeMarkerForTarget(stopId, parseFloat(lat), parseFloat(lng));
    }
}

window.removeStop = function(stopId) {
    // Also remove marker
    if (pickerMarkers[stopId] && pickerMap) {
        pickerMap.removeLayer(pickerMarkers[stopId]);
        delete pickerMarkers[stopId];
    }
    const el = document.getElementById(`container-${stopId}`);
    if (el) el.remove();
    
    // Update preview line
    updateRoutePreviewLine();
};

// ── Modal Logic ──
function openAddRouteModal() {
    routeForm.reset();
    document.getElementById('route-id').value = '';
    routeStopsContainer.innerHTML = '';
    stopCount = 0;
    
    // Reset coordinate fields
    document.getElementById('route-start-lat').value = '';
    document.getElementById('route-start-lng').value = '';
    document.getElementById('route-end-lat').value = '';
    document.getElementById('route-end-lng').value = '';
    document.getElementById('route-start-coords').textContent = 'No location set';
    document.getElementById('route-start-coords').classList.remove('has-coords');
    document.getElementById('route-end-coords').textContent = 'No location set';
    document.getElementById('route-end-coords').classList.remove('has-coords');
    activePickTarget = null;
    document.querySelectorAll('.btn-pick-location.picking').forEach(b => b.classList.remove('picking'));
    
    const statusEl = document.getElementById('map-picker-status');
    if (statusEl) statusEl.textContent = 'Select a stop field, then click the map to set its location.';
    
    // Add one empty stop by default
    addStopInput();
    
    routeModalTitle.textContent = "Add New Route";
    routeModal.classList.add('active');
    
    // Initialize map picker after modal is visible
    setTimeout(() => {
        clearAllPickerMarkers();
        initMapPicker();
        if (pickerMap) pickerMap.invalidateSize();
    }, 200);
}

window.editRoute = function(routeId) {
    const route = allRoutes.find(r => r.id === routeId);
    if (!route) return;
    
    routeForm.reset();
    document.getElementById('route-id').value = route.id;
    document.getElementById('route-name').value = route.routeName;
    document.getElementById('route-start').value = route.startPoint;
    document.getElementById('route-end').value = route.endPoint;
    
    if (route.assignedBus) {
        document.getElementById('route-bus').value = route.assignedBus;
    }
    
    // Reset coordinate fields
    document.getElementById('route-start-lat').value = '';
    document.getElementById('route-start-lng').value = '';
    document.getElementById('route-end-lat').value = '';
    document.getElementById('route-end-lng').value = '';
    document.getElementById('route-start-coords').textContent = 'No location set';
    document.getElementById('route-start-coords').classList.remove('has-coords');
    document.getElementById('route-end-coords').textContent = 'No location set';
    document.getElementById('route-end-coords').classList.remove('has-coords');
    activePickTarget = null;
    document.querySelectorAll('.btn-pick-location.picking').forEach(b => b.classList.remove('picking'));
    
    // Populate stops
    routeStopsContainer.innerHTML = '';
    stopCount = 0;
    
    // Set start/end coordinates from the stops array
    if (route.stops && route.stops.length > 0) {
        const firstStop = route.stops[0];
        const lastStop = route.stops[route.stops.length - 1];
        
        if (firstStop.latitude && firstStop.longitude) {
            document.getElementById('route-start-lat').value = firstStop.latitude;
            document.getElementById('route-start-lng').value = firstStop.longitude;
            const coordsEl = document.getElementById('route-start-coords');
            coordsEl.textContent = `📍 ${parseFloat(firstStop.latitude).toFixed(5)}, ${parseFloat(firstStop.longitude).toFixed(5)}`;
            coordsEl.classList.add('has-coords');
        }
        
        if (lastStop.latitude && lastStop.longitude) {
            document.getElementById('route-end-lat').value = lastStop.latitude;
            document.getElementById('route-end-lng').value = lastStop.longitude;
            const coordsEl = document.getElementById('route-end-coords');
            coordsEl.textContent = `📍 ${parseFloat(lastStop.latitude).toFixed(5)}, ${parseFloat(lastStop.longitude).toFixed(5)}`;
            coordsEl.classList.add('has-coords');
        }
        
        if (route.stops.length > 2) {
            // Exclude first and last which are start/end
            const intermediateStops = route.stops.slice(1, -1);
            intermediateStops.forEach(stop => {
                addStopInput(stop.name, stop.latitude || '', stop.longitude || '');
            });
        }
    }
    
    if (routeStopsContainer.children.length === 0) {
        addStopInput(); // Provide at least one empty slot
    }
    
    routeModalTitle.textContent = "Edit Route";
    routeModal.classList.add('active');
    
    // Initialize map picker after modal is visible & show existing markers
    setTimeout(() => {
        clearAllPickerMarkers();
        initMapPicker();
        if (pickerMap) {
            pickerMap.invalidateSize();
            
            // Place markers for existing coordinates
            const startLat = parseFloat(document.getElementById('route-start-lat').value);
            const startLng = parseFloat(document.getElementById('route-start-lng').value);
            const endLat = parseFloat(document.getElementById('route-end-lat').value);
            const endLng = parseFloat(document.getElementById('route-end-lng').value);
            
            const bounds = [];
            
            if (!isNaN(startLat) && !isNaN(startLng)) {
                placeMarkerForTarget('start', startLat, startLng);
                bounds.push([startLat, startLng]);
            }
            if (!isNaN(endLat) && !isNaN(endLng)) {
                placeMarkerForTarget('end', endLat, endLng);
                bounds.push([endLat, endLng]);
            }
            
            // Place intermediate stop markers
            const stopContainers = routeStopsContainer.querySelectorAll('.route-stop-item');
            stopContainers.forEach(container => {
                const lat = parseFloat(container.querySelector('.stop-lat')?.value);
                const lng = parseFloat(container.querySelector('.stop-lng')?.value);
                const targetId = container.id.replace('container-', '');
                if (!isNaN(lat) && !isNaN(lng)) {
                    placeMarkerForTarget(targetId, lat, lng);
                    bounds.push([lat, lng]);
                }
            });
            
            // Fit map to show all markers
            if (bounds.length > 0) {
                pickerMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
            }
            
            // Draw preview line
            updateRoutePreviewLine();
        }
    }, 300);
};

function closeModal() {
    routeModal.classList.remove('active');
    activePickTarget = null;
}

// ── Submit Logic ──
async function handleRouteSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('route-modal-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";
    
    try {
        const routeId = document.getElementById('route-id').value;
        const routeName = document.getElementById('route-name').value.trim();
        const startPoint = document.getElementById('route-start').value.trim();
        const endPoint = document.getElementById('route-end').value.trim();
        const busId = document.getElementById('route-bus').value;
        
        // Get start/end coordinates
        const startLat = parseFloat(document.getElementById('route-start-lat').value) || null;
        const startLng = parseFloat(document.getElementById('route-start-lng').value) || null;
        const endLat = parseFloat(document.getElementById('route-end-lat').value) || null;
        const endLng = parseFloat(document.getElementById('route-end-lng').value) || null;
        
        // Gather intermediate stops with coordinates
        const stopItems = routeStopsContainer.querySelectorAll('.route-stop-item');
        const intermediateStops = [];
        stopItems.forEach(item => {
            const name = item.querySelector('.stop-input')?.value.trim();
            const lat = parseFloat(item.querySelector('.stop-lat')?.value) || null;
            const lng = parseFloat(item.querySelector('.stop-lng')?.value) || null;
            if (name) {
                intermediateStops.push({ name, latitude: lat, longitude: lng });
            }
        });
        
        // Build full stops array
        const allStops = [];
        let order = 1;
        
        allStops.push({ name: startPoint, order: order++, latitude: startLat, longitude: startLng });
        intermediateStops.forEach(stop => {
            allStops.push({ name: stop.name, order: order++, latitude: stop.latitude, longitude: stop.longitude });
        });
        allStops.push({ name: endPoint, order: order++, latitude: endLat, longitude: endLng });
        
        // Find bus details
        let busName = null;
        if (busId) {
            const bus = allBuses.find(b => b.id === busId);
            if (bus) busName = bus.busName;
        }

        const routeData = {
            routeName,
            startPoint,
            endPoint,
            stops: allStops,
            assignedBus: busId || null,
            assignedBusName: busName
        };

        if (routeId) {
            // Update
            await ApiService.fetchWithAuth(`/Route/${routeId}`, {
                method: 'PUT',
                body: JSON.stringify(routeData)
            });
            
            if(window.showToast) window.showToast("Route updated successfully!", "success");
        } else {
            // Add
            await ApiService.fetchWithAuth('/Route', {
                method: 'POST',
                body: JSON.stringify(routeData)
            });
            
            if(window.showToast) window.showToast("New route added successfully!", "success");
        }
        
        closeModal();
    } catch (error) {
        console.error("Error saving route:", error);
        if(window.showToast) window.showToast(`Error: ${error.message}`, "error");
        else alert(`Error saving route: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// ── Delete Logic ──
window.deleteRoute = async function(routeId) {
    if (!confirm("Are you sure you want to delete this route?")) return;
    
    try {
        await ApiService.fetchWithAuth(`/Route/${routeId}`, {
            method: 'DELETE'
        });
        if(window.showToast) window.showToast("Route deleted successfully!", "success");
    } catch (error) {
        console.error("Error deleting route:", error);
        if(window.showToast) window.showToast(`Error deleting route: ${error.message}`, "error");
        else alert(`Error deleting route: ${error.message}`);
    }
};
