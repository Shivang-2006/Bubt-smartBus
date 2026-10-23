// ========================================
// Smart Campus Bus — Announcement Management (Phase 21)
// ========================================

import { auth, db } from "./firebase-config.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ApiService } from "./api.js";
let allAnnouncements = [];
let unsubscribeAnnouncements = null;

// DOM Elements
let announcementGrid;
let statTotal;
let statUrgent;
let btnAddAnnouncement;

// Modal Elements
let announcementModal;
let modalCloseBtn;
let modalCancelBtn;
let announcementForm;
let inputId;
let inputTitle;
let inputType;
let inputPriority;
let inputMessage;
let modalTitle;

export function initAnnouncementManagement() {
    // Query DOM Elements
    announcementGrid = document.getElementById('announcement-grid');
    statTotal = document.getElementById('announcement-stat-total');
    statUrgent = document.getElementById('announcement-stat-urgent');
    btnAddAnnouncement = document.getElementById('btn-add-announcement');

    announcementModal = document.getElementById('announcement-modal');
    modalCloseBtn = document.getElementById('announcement-modal-close');
    modalCancelBtn = document.getElementById('announcement-modal-cancel');
    announcementForm = document.getElementById('announcement-form');
    inputId = document.getElementById('announcement-id');
    inputTitle = document.getElementById('announcement-title');
    inputType = document.getElementById('announcement-type');
    inputPriority = document.getElementById('announcement-priority');
    inputMessage = document.getElementById('announcement-message');
    modalTitle = document.getElementById('announcement-modal-title');

    listenToAnnouncements();
    setupEventListeners();
}



function listenToAnnouncements() {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    
    unsubscribeAnnouncements = onSnapshot(q, (snapshot) => {
        allAnnouncements = [];
        snapshot.forEach((docSnap) => {
            allAnnouncements.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        updateStats();
        renderAnnouncements();
    }, (error) => {
        console.error("Error fetching announcements:", error);
        if (announcementGrid) {
            announcementGrid.innerHTML = `<div class="empty-state"><p style="color: red;">Error loading announcements. Check permissions.</p></div>`;
        }
    });
}

function updateStats() {
    if (statTotal) statTotal.textContent = allAnnouncements.length;
    if (statUrgent) statUrgent.textContent = allAnnouncements.filter(a => a.priority === 'urgent').length;
}

function renderAnnouncements() {
    if (!announcementGrid) return;

    if (allAnnouncements.length === 0) {
        announcementGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">📢</div>
                <p>No announcements available.</p>
            </div>
        `;
        return;
    }

    announcementGrid.innerHTML = '';

    allAnnouncements.forEach(ann => {
        const card = document.createElement('div');
        card.className = 'bus-card'; // Reuse styling
        
        let icon = '📢';
        let typeColor = 'var(--text-muted)';
        
        if (ann.type === 'notice') { icon = '📋'; typeColor = '#3b82f6'; }
        else if (ann.type === 'alert') { icon = '⚠️'; typeColor = '#ef4444'; }
        else if (ann.type === 'schedule_change') { icon = '📅'; typeColor = '#f59e0b'; }
        
        let priorityBadge = '';
        if (ann.priority === 'urgent') {
            priorityBadge = `<span style="background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; border: 1px solid rgba(239, 68, 68, 0.4); margin-left: auto;">URGENT</span>`;
        }
        
        let dateStr = 'Unknown Date';
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
                ${ann.message.replace(/\\n/g, '<br>')}
            </p>
            
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.8rem; margin-top: auto;">
                <span style="color: ${typeColor}; font-size: 0.8rem; font-weight: 500;">
                    ${ann.type === 'schedule_change' ? 'Schedule Change' : (ann.type === 'alert' ? 'Alert' : 'Notice')} • ${dateStr}
                </span>
                
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn--outline btn-edit-ann" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">✏️ Edit</button>
                    <button class="btn btn--outline btn-delete-ann" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; border-color: rgba(239, 68, 68, 0.3); color: #ef4444;">🗑️</button>
                </div>
            </div>
        `;

        card.querySelector('.btn-edit-ann').addEventListener('click', () => openModal('edit', ann));
        card.querySelector('.btn-delete-ann').addEventListener('click', () => deleteAnnouncement(ann.id, ann.title));

        announcementGrid.appendChild(card);
    });
}

function setupEventListeners() {
    if (btnAddAnnouncement) {
        btnAddAnnouncement.addEventListener('click', () => openModal('add'));
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);
    
    if (announcementModal) {
        announcementModal.addEventListener('click', (e) => {
            if (e.target === announcementModal) closeModal();
        });
    }

    if (announcementForm) {
        announcementForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = announcementForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            try {
                const isEdit = !!inputId.value;
                const id = isEdit ? inputId.value : null;
                
                const annData = {
                    title: inputTitle.value.trim(),
                    type: inputType.value,
                    priority: inputPriority.value,
                    message: inputMessage.value.trim(),
                    targetAudience: 'all',
                    status: 'active'
                };
                
                if (isEdit) {
                    await ApiService.fetchWithAuth(`/Announcement/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify(annData)
                    });
                } else {
                    await ApiService.fetchWithAuth('/Announcement', {
                        method: 'POST',
                        body: JSON.stringify(annData)
                    });
                }
                
                if (typeof window.showToast === 'function') {
                    window.showToast(`Announcement ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
                }
                
                closeModal();
            } catch (error) {
                console.error("Error saving announcement:", error);
                if (typeof window.showToast === 'function') {
                    window.showToast("Error saving announcement", 'error');
                } else {
                    alert("Error saving announcement: " + error.message);
                }
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

function openModal(mode, annData = null) {
    if (!announcementModal) return;
    
    announcementForm.reset();
    
    if (mode === 'edit' && annData) {
        modalTitle.textContent = 'Edit Announcement';
        inputId.value = annData.id;
        inputTitle.value = annData.title;
        inputType.value = annData.type || 'notice';
        inputPriority.value = annData.priority || 'normal';
        inputMessage.value = annData.message;
    } else {
        modalTitle.textContent = 'Create Announcement';
        inputId.value = '';
    }
    
    announcementModal.classList.add('active');
}

function closeModal() {
    if (announcementModal) announcementModal.classList.remove('active');
}

async function deleteAnnouncement(id, title) {
    if (!confirm(`Are you sure you want to delete the announcement "${title}"?`)) return;
    
    try {
        await ApiService.fetchWithAuth(`/Announcement/${id}`, {
            method: 'DELETE'
        });
        if (typeof window.showToast === 'function') {
            window.showToast("Announcement deleted", 'success');
        }
    } catch (error) {
        console.error("Error deleting announcement:", error);
        if (typeof window.showToast === 'function') {
            window.showToast(`Error deleting announcement: ${error.message}`, 'error');
        } else {
            alert(`Error deleting announcement: ${error.message}`);
        }
    }
}

// Initialize if we're on the admin page
document.addEventListener("DOMContentLoaded", () => {
    // Only init if the section exists
    if (document.getElementById('section-announcements')) {
        initAnnouncementManagement();
    }
});
