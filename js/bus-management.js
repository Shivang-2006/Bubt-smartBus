// ========================================
// Smart Campus Bus — Bus Management
// ========================================

import { db } from "./firebase-config.js";
import { collection, query, where, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ApiService } from "./api.js";

// State
let allBuses = [];
let allActiveDrivers = [];
let unsubscribeBuses = null;

// DOM Elements
const busGrid = document.getElementById('bus-grid');
const btnAddBus = document.getElementById('btn-add-bus');
const busModal = document.getElementById('bus-modal');
const busForm = document.getElementById('bus-form');
const btnModalClose = document.getElementById('bus-modal-close');
const btnModalCancel = document.getElementById('bus-modal-cancel');
const busModalTitle = document.getElementById('bus-modal-title');
const driverSelect = document.getElementById('bus-driver');
const statusGroup = document.getElementById('bus-status-group');

// ── Initialization ──
export function initBusManagement() {
    setupBusesListener();
    fetchActiveDrivers();
    
    // Modal Listeners
    if (btnAddBus) {
        btnAddBus.addEventListener('click', openAddBusModal);
    }
    
    if (btnModalClose) {
        btnModalClose.addEventListener('click', closeModal);
    }
    
    if (btnModalCancel) {
        btnModalCancel.addEventListener('click', closeModal);
    }
    
    if (busForm) {
        busForm.addEventListener('submit', handleBusSubmit);
    }
}

// Ensure it's initialized when loaded
document.addEventListener("DOMContentLoaded", () => {
    // Small delay to ensure auth state is resolved if needed
    setTimeout(initBusManagement, 500);
});

// ── Real-time Listener ──
function setupBusesListener() {
    const q = query(collection(db, "buses"));
    
    unsubscribeBuses = onSnapshot(q, (snapshot) => {
        allBuses = [];
        snapshot.forEach((doc) => {
            allBuses.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by status (running first) then created date descending
        allBuses.sort((a, b) => {
            if (a.status === 'running' && b.status !== 'running') return -1;
            if (a.status !== 'running' && b.status === 'running') return 1;
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA;
        });

        updateBusStats();
        renderBuses();
    }, (error) => {
        console.error("Error fetching buses:", error);
        if (busGrid) {
            busGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state__icon">⚠️</div>
                    <p>Failed to load buses.</p>
                </div>
            `;
        }
    });
}

// ── Fetch Drivers ──
async function fetchActiveDrivers() {
    try {
        const q = query(
            collection(db, "users"), 
            where("role", "==", "driver"),
            where("status", "==", "active")
        );
        
        const snapshot = await getDocs(q);
        allActiveDrivers = [];
        snapshot.forEach((doc) => {
            allActiveDrivers.push({ id: doc.id, ...doc.data() });
        });
        
        populateDriverDropdown();
    } catch (error) {
        console.error("Error fetching drivers:", error);
    }
}

function populateDriverDropdown() {
    if (!driverSelect) return;
    
    // Keep the first option
    driverSelect.innerHTML = '<option value="">-- Select Driver --</option>';
    
    allActiveDrivers.forEach(driver => {
        const option = document.createElement('option');
        option.value = driver.id;
        option.textContent = `${driver.name} (${driver.email})`;
        driverSelect.appendChild(option);
    });
}

// ── Stats Update ──
function updateBusStats() {
    const total = allBuses.length;
    const active = allBuses.filter(b => b.status === 'active').length;
    const special = allBuses.filter(b => b.status === 'special_trip').length;
    const inactive = allBuses.filter(b => b.status === 'inactive' || b.status === 'maintenance').length;

    document.getElementById('bus-stat-total').textContent = total;
    document.getElementById('bus-stat-active').textContent = active;
    document.getElementById('bus-stat-special').textContent = special;
    document.getElementById('bus-stat-inactive').textContent = inactive;
}

// ── Render Buses ──
function renderBuses() {
    if (!busGrid) return;

    if (allBuses.length === 0) {
        busGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">🚐</div>
                <p>No buses added yet.</p>
            </div>
        `;
        return;
    }

    busGrid.innerHTML = '';

    allBuses.forEach(bus => {
        const card = document.createElement('div');
        card.className = 'bus-card';
        
        let statusBadgeClass = '';
        let statusText = bus.status;
        
        if(bus.status === 'running') { statusBadgeClass = 'status-badge--running'; statusText = '🟢 Running'; }
        else if(bus.status === 'active') { statusBadgeClass = 'status-badge--active'; statusText = 'Active'; }
        else if(bus.status === 'special_trip') { statusBadgeClass = 'status-badge--pending'; statusText = 'Special Trip'; }
        else if(bus.status === 'maintenance') { statusBadgeClass = 'status-badge--rejected'; statusText = 'Maintenance'; }
        else { statusBadgeClass = 'status-badge'; statusText = 'Inactive'; } // default inactive

        const driverName = bus.assignedDriverName || 'Not Assigned';
        const capacity = bus.capacity ? `${bus.capacity} seats` : 'N/A';

        card.innerHTML = `
            <div class="driver-card__header">
                <div class="driver-card__info">
                    <span class="driver-card__name">${bus.busName}</span>
                    <span class="driver-card__email">Number: ${bus.busNumber}</span>
                </div>
                <span class="status-badge ${statusBadgeClass}">${statusText}</span>
            </div>
            
            <div class="driver-card__details">
                <div class="detail-item">
                    <span class="detail-item__label">Driver</span>
                    <span class="detail-item__value">${driverName}</span>
                </div>
                <div class="detail-item" style="text-align: right;">
                    <span class="detail-item__label">Capacity</span>
                    <span class="detail-item__value">${capacity}</span>
                </div>
            </div>
            
            <div class="driver-card__actions">
                <button class="btn-action" style="background: rgba(108, 99, 255, 0.15); color: var(--accent-primary);" onclick="window.editBus('${bus.id}')">
                    <span>✏️</span> Edit
                </button>
                <button class="btn-action btn-reject" onclick="window.deleteBus('${bus.id}')">
                    <span>🗑️</span> Delete
                </button>
            </div>
        `;
        
        busGrid.appendChild(card);
    });
}

// ── Modal Logic ──
function openAddBusModal() {
    busForm.reset();
    document.getElementById('bus-id').value = '';
    busModalTitle.textContent = "Add New Bus";
    statusGroup.style.display = 'none'; // Hide status for new bus (defaults to inactive)
    busModal.classList.add('active');
}

window.editBus = function(busId) {
    const bus = allBuses.find(b => b.id === busId);
    if (!bus) return;
    
    busForm.reset();
    document.getElementById('bus-id').value = bus.id;
    document.getElementById('bus-name').value = bus.busName;
    document.getElementById('bus-number').value = bus.busNumber;
    if(bus.capacity) document.getElementById('bus-capacity').value = bus.capacity;
    if(bus.assignedDriver) document.getElementById('bus-driver').value = bus.assignedDriver;
    
    document.getElementById('bus-status').value = bus.status || 'inactive';
    
    busModalTitle.textContent = "Edit Bus";
    statusGroup.style.display = 'block'; // Show status dropdown when editing
    
    busModal.classList.add('active');
};

function closeModal() {
    busModal.classList.remove('active');
}

// ── Submit Logic ──
async function handleBusSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('bus-modal-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";
    
    try {
        const busId = document.getElementById('bus-id').value;
        const busName = document.getElementById('bus-name').value.trim();
        const busNumber = document.getElementById('bus-number').value.trim();
        const capacityVal = document.getElementById('bus-capacity').value;
        const driverId = document.getElementById('bus-driver').value;
        
        let driverName = null;
        if (driverId) {
            const driver = allActiveDrivers.find(d => d.id === driverId);
            if (driver) driverName = driver.name;
        }

        const busData = {
            busName,
            busNumber,
            capacity: capacityVal ? parseInt(capacityVal) : null,
            assignedDriver: driverId || null,
            assignedDriverName: driverName
        };

        if (busId) {
            // Update
            busData.status = document.getElementById('bus-status').value;
            await ApiService.fetchWithAuth(`/Bus/${busId}`, {
                method: 'PUT',
                body: JSON.stringify(busData)
            });
            if(window.showToast) window.showToast("Bus updated successfully!", "success");
        } else {
            // Add
            busData.status = "inactive";
            await ApiService.fetchWithAuth('/Bus', {
                method: 'POST',
                body: JSON.stringify(busData)
            });
            if(window.showToast) window.showToast("Bus added successfully!", "success");
        }
        
        closeModal();
    } catch (error) {
        console.error("Error saving bus:", error);
        if(window.showToast) window.showToast(`Error: ${error.message}`, "error");
        else alert(`Error saving bus: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// ── Delete Logic ──
window.deleteBus = async function(busId) {
    if (!confirm("Are you sure you want to delete this bus?")) return;
    
    try {
        await ApiService.fetchWithAuth(`/Bus/${busId}`, {
            method: 'DELETE'
        });
        if(window.showToast) window.showToast("Bus deleted successfully!", "success");
    } catch (error) {
        console.error("Error deleting bus:", error);
        if(window.showToast) window.showToast(`Error deleting bus: ${error.message}`, "error");
        else alert(`Error deleting bus: ${error.message}`);
    }
};
