// ========================================
// Smart Campus Bus — Report Management (Admin)
// ========================================

import { db } from "./firebase-config.js";
import { collection, query, onSnapshot, orderBy, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let allReports = [];
let currentReportFilter = 'all';
let unsubscribeReports = null;

document.addEventListener("DOMContentLoaded", () => {
    // Setup Filter Tabs
    const reportFilterTabs = document.querySelectorAll('#report-filter-tabs .filter-tab');
    if (reportFilterTabs) {
        reportFilterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                reportFilterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentReportFilter = tab.dataset.filter;
                renderReports();
            });
        });
    }

    initReports();
});

function initReports() {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    
    unsubscribeReports = onSnapshot(q, (snapshot) => {
        allReports = [];
        snapshot.forEach((docSnap) => {
            allReports.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        updateReportStats();
        renderReports();
    }, (error) => {
        console.error("Error fetching reports:", error);
        const reportGrid = document.getElementById('report-grid');
        if (reportGrid) {
            reportGrid.innerHTML = `
                <div class="empty-state">
                    <p style="color: #ff4d4d;">Failed to load reports. Ensure indices are built.</p>
                </div>
            `;
        }
    });
}

function updateReportStats() {
    const total = allReports.length;
    const pending = allReports.filter(r => r.status === 'pending').length;
    const resolved = allReports.filter(r => r.status === 'completed').length;

    const statTotal = document.getElementById('report-stat-total');
    const statPending = document.getElementById('report-stat-pending');
    const statResolved = document.getElementById('report-stat-completed');

    if (statTotal) statTotal.textContent = total;
    if (statPending) statPending.textContent = pending;
    if (statResolved) statResolved.textContent = resolved;

    // Update Student Report Badge
    const reportBadge = document.getElementById('badge-reports');
    if (reportBadge) {
        if (pending > 0) {
            reportBadge.textContent = pending;
            reportBadge.style.display = 'inline-block';
        } else {
            reportBadge.style.display = 'none';
        }
    }
}

function renderReports() {
    const grid = document.getElementById('report-grid');
    if (!grid) return;

    const filteredReports = currentReportFilter === 'all'
        ? allReports
        : allReports.filter(r => r.status === currentReportFilter);

    if (filteredReports.length === 0) {
        let message = currentReportFilter === 'all' ? "No reports found." : `No ${currentReportFilter} reports.`;
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">🚩</div>
                <p>${message}</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = '';

    filteredReports.forEach(report => {
        const card = document.createElement('div');
        card.className = 'driver-card'; // Reusing driver-card style for consistency

        let dateStr = 'Unknown';
        if (report.createdAt && typeof report.createdAt.toDate === 'function') {
            dateStr = report.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        }

        let statusBadgeClass = '';
        let statusText = '';
        if (report.status === 'pending') { statusBadgeClass = 'status-badge--pending'; statusText = 'Pending'; }
        else if (report.status === 'processing') { statusBadgeClass = 'status-badge--active'; statusText = 'Processing'; }
        else if (report.status === 'completed') { statusBadgeClass = 'status-badge--active'; statusText = 'Completed'; }
        else if (report.status === 'cancelled') { statusBadgeClass = 'status-badge--rejected'; statusText = 'Cancelled'; }
        else { statusBadgeClass = 'status-badge'; statusText = report.status || 'Unknown'; }

        // Action Buttons
        let actionsHtml = '';
        if (report.status === 'pending') {
            actionsHtml = `
                <div class="driver-card__actions">
                    <button class="btn-action" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;" onclick="openReportModal('${report.id}', 'processing')">
                        <span>⏳</span> Mark Processing
                    </button>
                    <button class="btn-action btn-approve" onclick="openReportModal('${report.id}', 'completed')">
                        <span>✅</span> Complete
                    </button>
                    <button class="btn-action btn-reject" onclick="openReportModal('${report.id}', 'cancelled')">
                        <span>❌</span> Cancel
                    </button>
                </div>
            `;
        } else if (report.status === 'processing') {
            actionsHtml = `
                <div class="driver-card__actions">
                    <button class="btn-action btn-approve" onclick="openReportModal('${report.id}', 'completed')">
                        <span>✅</span> Complete
                    </button>
                    <button class="btn-action btn-reject" onclick="openReportModal('${report.id}', 'cancelled')">
                        <span>❌</span> Cancel
                    </button>
                </div>
            `;
        }

        let feedbackHtml = '';
        if (report.adminFeedback) {
            feedbackHtml = `
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(59, 130, 246, 0.05); border-left: 4px solid var(--accent-primary); border-radius: 4px;">
                    <span style="font-size: 0.75rem; color: var(--accent-primary); font-weight: 600; text-transform: uppercase;">Admin Note</span>
                    <p style="color: var(--text-primary); font-size: 0.85rem; margin-top: 0.25rem;">${report.adminFeedback}</p>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="driver-card__header">
                <div class="driver-card__info" style="width: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <span class="driver-card__name" style="font-size: 1.1rem; color: var(--text-primary);">${report.topic}</span>
                        <span class="status-badge ${statusBadgeClass}">${statusText}</span>
                    </div>
                    <span class="driver-card__email" style="font-size: 0.8rem; margin-top: 0.2rem;">By: ${report.userName} (${report.userEmail})</span>
                </div>
            </div>
            
            <div class="driver-card__details" style="display: block; border-bottom: none; padding-bottom: 0; margin-bottom: 1rem;">
                <p style="color: var(--text-primary); font-size: 0.95rem; line-height: 1.5; word-break: break-word; background: var(--bg-surface-hover); padding: 1rem; border-radius: 8px;">
                    ${(report.message || '').replace(/\n/g, '<br>')}
                </p>
                ${feedbackHtml}
                <div style="text-align: right; color: var(--text-muted); font-size: 0.75rem; margin-top: 0.5rem;">
                    ${dateStr}
                </div>
            </div>
            
            ${actionsHtml}
        `;

        grid.appendChild(card);
    });
}

// Global function to open the feedback modal
window.openReportModal = function(reportId, newStatus) {
    const modal = document.getElementById('report-feedback-modal');
    document.getElementById('report-action-id').value = reportId;
    document.getElementById('report-action-status').value = newStatus;
    document.getElementById('report-feedback-message').value = '';
    
    if (newStatus === 'cancelled') {
        document.getElementById('report-feedback-hint').textContent = 'Please provide a reason for cancelling this report (Optional, but recommended).';
    } else {
        document.getElementById('report-feedback-hint').textContent = 'Leave an optional note for the student. They will see this on their dashboard.';
    }

    if (modal) modal.classList.add('active');
};

// Handle modal actions
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('report-feedback-modal');
    const btnClose = document.getElementById('report-feedback-modal-close');
    const btnSkip = document.getElementById('report-feedback-modal-cancel');
    const form = document.getElementById('report-feedback-form');

    if (btnClose) btnClose.addEventListener('click', () => modal.classList.remove('active'));
    
    // Skip & Save (Submit without feedback)
    if (btnSkip) {
        btnSkip.addEventListener('click', () => {
            const id = document.getElementById('report-action-id').value;
            const status = document.getElementById('report-action-status').value;
            executeReportUpdate(id, status, "");
            modal.classList.remove('active');
        });
    }

    // Save with Feedback
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('report-action-id').value;
            const status = document.getElementById('report-action-status').value;
            const feedback = document.getElementById('report-feedback-message').value.trim();
            executeReportUpdate(id, status, feedback);
            modal.classList.remove('active');
        });
    }
});

async function executeReportUpdate(reportId, newStatus, feedbackStr) {
    try {
        const reportRef = doc(db, "reports", reportId);
        const updateData = { 
            status: newStatus,
            updatedAt: serverTimestamp()
        };
        if (feedbackStr) {
            updateData.adminFeedback = feedbackStr;
        }
        await updateDoc(reportRef, updateData);
        if (window.showToast) window.showToast(`Report marked as ${newStatus}!`, 'success');
    } catch (error) {
        console.error("Error updating report status:", error);
        if (window.showToast) window.showToast("Failed to update status.", 'error');
    }
}
