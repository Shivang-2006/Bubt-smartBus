// ========================================
// Smart Campus Bus — Schedule Management
// ========================================

import { db } from "./firebase-config.js";
import { collection, query, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ApiService } from "./api.js";
// State
let allSchedules = [];
let allBuses = [];
let unsubscribeSchedules = null;

// DOM Elements
const scheduleGrid = document.getElementById('schedule-grid');
const btnAddSchedule = document.getElementById('btn-add-schedule');
const scheduleModal = document.getElementById('schedule-modal');
const scheduleForm = document.getElementById('schedule-form');
const btnModalClose = document.getElementById('schedule-modal-close');
const btnModalCancel = document.getElementById('schedule-modal-cancel');
const scheduleModalTitle = document.getElementById('schedule-modal-title');
const scheduleBusSelect = document.getElementById('schedule-bus');

// ── Initialization ──
export function initScheduleManagement() {
    setupSchedulesListener();
    fetchBuses();
    
    // Listeners
    if (btnAddSchedule) btnAddSchedule.addEventListener('click', openAddScheduleModal);
    if (btnModalClose) btnModalClose.addEventListener('click', closeModal);
    if (btnModalCancel) btnModalCancel.addEventListener('click', closeModal);
    if (scheduleForm) scheduleForm.addEventListener('submit', handleScheduleSubmit);
    
    // Time UI Listeners
    const btnAddTime = document.getElementById('btn-add-time');
    const timeInput = document.getElementById('schedule-time-input');
    const quickTimeBtns = document.querySelectorAll('.quick-time-btn');
    
    if (btnAddTime && timeInput) {
        btnAddTime.addEventListener('click', () => {
            if (timeInput.value) {
                addTimeTag(timeInput.value);
                timeInput.value = '';
            }
        });
    }
    
    quickTimeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            addTimeTag(e.target.dataset.time);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initScheduleManagement, 700);
});

// ── Time Tags Logic ──
let selectedTimes = [];

function addTimeTag(time24) {
    if (!time24 || selectedTimes.includes(time24)) return;
    selectedTimes.push(time24);
    // Sort times
    selectedTimes.sort((a, b) => a.localeCompare(b));
    renderTimeTags();
}

window.removeTimeTag = function(time24) {
    selectedTimes = selectedTimes.filter(t => t !== time24);
    renderTimeTags();
};

function renderTimeTags() {
    const container = document.getElementById('selected-times-container');
    const noTimesMsg = document.getElementById('no-times-msg');
    
    if (!container) return;
    
    // Clear existing tags
    const tags = container.querySelectorAll('.time-tag');
    tags.forEach(t => t.remove());
    
    if (selectedTimes.length === 0) {
        if (noTimesMsg) noTimesMsg.style.display = 'block';
    } else {
        if (noTimesMsg) noTimesMsg.style.display = 'none';
        
        selectedTimes.forEach(time => {
            const tag = document.createElement('div');
            tag.className = 'time-tag';
            tag.style.cssText = 'display: inline-flex; align-items: center; background: rgba(108, 99, 255, 0.2); color: var(--accent-primary); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.85rem; gap: 0.3rem;';
            tag.innerHTML = `
                <span>${formatTime12Hour(time)}</span>
                <button type="button" onclick="window.removeTimeTag('${time}')" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1rem; line-height: 1; padding: 0;">&times;</button>
            `;
            container.appendChild(tag);
        });
    }
}

// ── Real-time Listener ──
function setupSchedulesListener() {
    const q = query(collection(db, "schedules"));
    
    unsubscribeSchedules = onSnapshot(q, (snapshot) => {
        allSchedules = [];
        snapshot.forEach((doc) => {
            allSchedules.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by departure time
        allSchedules.sort((a, b) => {
            return a.departureTime.localeCompare(b.departureTime);
        });

        updateScheduleStats();
        renderSchedules();
    }, (error) => {
        console.error("Error fetching schedules:", error);
        if (scheduleGrid) {
            scheduleGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state__icon">⚠️</div>
                    <p>Failed to load schedules.</p>
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
        renderSchedules();
    }, (error) => {
        console.error("Error fetching buses:", error);
    });
}

function populateBusDropdown() {
    if (!scheduleBusSelect) return;
    scheduleBusSelect.innerHTML = '<option value="">-- Select Bus --</option>';
    allBuses.forEach(bus => {
        const option = document.createElement('option');
        option.value = bus.id;
        option.textContent = `${bus.busName} (${bus.busNumber})`;
        scheduleBusSelect.appendChild(option);
    });
}

// ── Stats ──
function updateScheduleStats() {
    const total = allSchedules.length;
    document.getElementById('schedule-stat-total').textContent = total;
}

// Formats "14:30" into "02:30 PM"
function formatTime12Hour(time24) {
    if (!time24) return "";
    let [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    let formattedHour = h < 10 ? '0' + h : h;
    return `${formattedHour}:${minutes} ${ampm}`;
}

// ── Render ──
function renderSchedules() {
    if (!scheduleGrid) return;

    if (allSchedules.length === 0) {
        scheduleGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">📅</div>
                <p>No schedules added yet.</p>
            </div>
        `;
        return;
    }

    scheduleGrid.innerHTML = '';

    allSchedules.forEach(schedule => {
        const card = document.createElement('div');
        card.className = 'bus-card';
        
        let daysText = "All Days";
        if (schedule.operatingDays && schedule.operatingDays.length > 0) {
            if (schedule.operatingDays.length === 7) {
                daysText = "Everyday";
            } else {
                // Get short names: Mon, Tue etc.
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
            
            <div class="driver-card__actions" style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-card);">
                <button class="btn-action" style="background: rgba(108, 99, 255, 0.15); color: var(--accent-primary);" onclick="window.editSchedule('${schedule.id}')">
                    <span>✏️</span> Edit
                </button>
                <button class="btn-action btn-reject" onclick="window.deleteSchedule('${schedule.id}')">
                    <span>🗑️</span> Delete
                </button>
            </div>
        `;
        
        scheduleGrid.appendChild(card);
    });
}

// ── Modal Logic ──
function openAddScheduleModal() {
    scheduleForm.reset();
    document.getElementById('schedule-id').value = '';
    
    // Reset times
    selectedTimes = [];
    renderTimeTags();
    document.getElementById('schedule-time-input').value = '';
    
    // Check all days by default
    const checkboxes = document.querySelectorAll('input[name="schedule-days"]');
    checkboxes.forEach(cb => cb.checked = true);
    
    scheduleModalTitle.textContent = "Add New Schedule";
    scheduleModal.classList.add('active');
}

window.editSchedule = function(scheduleId) {
    const schedule = allSchedules.find(s => s.id === scheduleId);
    if (!schedule) return;
    
    scheduleForm.reset();
    document.getElementById('schedule-id').value = schedule.id;
    document.getElementById('schedule-bus').value = schedule.busId;
    
    // For edit, we populate only the specific time of this document
    selectedTimes = [schedule.departureTime];
    renderTimeTags();
    document.getElementById('schedule-time-input').value = '';
    
    const checkboxes = document.querySelectorAll('input[name="schedule-days"]');
    checkboxes.forEach(cb => {
        cb.checked = schedule.operatingDays && schedule.operatingDays.includes(cb.value);
    });
    
    scheduleModalTitle.textContent = "Edit Schedule";
    scheduleModal.classList.add('active');
};

function closeModal() {
    scheduleModal.classList.remove('active');
}

// ── Submit Logic ──
async function handleScheduleSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('schedule-modal-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";
    
    try {
        const scheduleId = document.getElementById('schedule-id').value;
        const busId = document.getElementById('schedule-bus').value;
        
        if (selectedTimes.length === 0) {
            throw new Error("Please add at least one departure time.");
        }
        
        // Get selected days
        const checkboxes = document.querySelectorAll('input[name="schedule-days"]:checked');
        const operatingDays = Array.from(checkboxes).map(cb => cb.value);
        
        if(operatingDays.length === 0) {
            throw new Error("Please select at least one operating day.");
        }
        
        // Find bus details
        let busName = null;
        if (busId) {
            const bus = allBuses.find(b => b.id === busId);
            if (bus) busName = bus.busName;
        }

        if (scheduleId) {
            const firstTime = selectedTimes[0];
            
            await ApiService.fetchWithAuth(`/Schedule/${scheduleId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    busId,
                    busName,
                    departureTime: firstTime,
                    operatingDays
                })
            });
            
            // If they added extra times while editing, create new docs for them
            if (selectedTimes.length > 1) {
                const batchPromises = selectedTimes.slice(1).map(time => {
                    return ApiService.fetchWithAuth('/Schedule', {
                        method: 'POST',
                        body: JSON.stringify({
                            busId,
                            busName,
                            departureTime: time,
                            operatingDays
                        })
                    });
                });
                await Promise.all(batchPromises);
            }
            
            if(window.showToast) window.showToast("Schedule updated successfully!", "success");
        } else {
            // Add mode - Create multiple schedules for multiple times
            const batchPromises = selectedTimes.map(time => {
                return ApiService.fetchWithAuth('/Schedule', {
                    method: 'POST',
                    body: JSON.stringify({
                        busId,
                        busName,
                        departureTime: time,
                        operatingDays
                    })
                });
            });
            
            await Promise.all(batchPromises);
            
            if(window.showToast) window.showToast(`${selectedTimes.length} schedules created successfully!`, "success");
        }
        
        closeModal();
    } catch (error) {
        console.error("Error saving schedule:", error);
        if(window.showToast) window.showToast(`Error: ${error.message}`, "error");
        else alert(`Error saving schedule: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// ── Delete Logic ──
window.deleteSchedule = async function(scheduleId) {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    
    try {
        await ApiService.fetchWithAuth(`/Schedule/${scheduleId}`, {
            method: 'DELETE'
        });
        if(window.showToast) window.showToast("Schedule deleted successfully!", "success");
    } catch (error) {
        console.error("Error deleting schedule:", error);
        if(window.showToast) window.showToast(`Error deleting schedule: ${error.message}`, "error");
        else alert(`Error deleting schedule: ${error.message}`);
    }
};
