import { auth, db } from "./firebase-config.js";
import { collection, getDocs, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getCurrentUser } from "./auth-guard.js";
import { ApiService } from "./api.js";

// State
let allUsers = [];
let userCurrentFilter = 'all';
let userSearchQuery = '';
let adminCurrentFilter = 'all';
let adminSearchQuery = '';
let unsubscribeUsers = null;
let currentUserId = null;

// DOM Elements
const userGrid = document.getElementById('user-grid');
const adminGrid = document.getElementById('admin-grid');
const userFilterTabs = document.querySelectorAll('#user-filter-tabs .filter-tab');
const adminFilterTabs = document.querySelectorAll('#admin-filter-tabs .filter-tab');
const userSearchInput = document.getElementById('search-users');
const adminSearchInput = document.getElementById('search-admins');

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('section-users') || document.getElementById('section-admins')) {
        import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js").then(({ onAuthStateChanged }) => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    currentUserId = user.uid;
                    renderUsers();
                    renderAdmins();
                }
            });
        });
        setupUserManagement();
    }
});

function setupUserManagement() {
    // User Section Setup
    if (userSearchInput) {
        userSearchInput.addEventListener('input', (e) => {
            userSearchQuery = e.target.value.toLowerCase();
            renderUsers();
        });
    }
    if (userFilterTabs.length > 0) {
        userFilterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                userFilterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                userCurrentFilter = tab.dataset.filter;
                renderUsers();
            });
        });
    }

    // Admin Section Setup
    if (adminSearchInput) {
        adminSearchInput.addEventListener('input', (e) => {
            adminSearchQuery = e.target.value.toLowerCase();
            renderAdmins();
        });
    }
    if (adminFilterTabs.length > 0) {
        adminFilterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                adminFilterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                adminCurrentFilter = tab.dataset.filter;
                renderAdmins();
            });
        });
    }

    // Real-time listener for ALL users
    const usersRef = collection(db, "users");
    unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
        allUsers = [];
        snapshot.forEach((doc) => {
            allUsers.push({ id: doc.id, ...doc.data() });
        });

        allUsers.sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA;
        });

        updateUserStats();
        renderUsers();
        renderAdmins();
    }, (error) => {
        console.error("Error fetching users:", error);
    });
}

function updateUserStats() {
    const total = allUsers.length;
    const students = allUsers.filter(u => u.role === 'student').length;
    const drivers = allUsers.filter(u => u.role === 'driver').length;
    const blocked = allUsers.filter(u => u.status === 'blocked').length;

    const elTotal = document.getElementById('user-stat-total');
    if (elTotal) elTotal.textContent = total;
    const elStudents = document.getElementById('user-stat-students');
    if (elStudents) elStudents.textContent = students;
    const elDrivers = document.getElementById('user-stat-drivers');
    if (elDrivers) elDrivers.textContent = drivers;
    const elBlocked = document.getElementById('user-stat-blocked');
    if (elBlocked) elBlocked.textContent = blocked;
}

// Check if user is some kind of admin
function isAdminUser(u) {
    return u.adminLevel === 'main' || u.adminLevel === 'co' || (u.role === 'admin' && u.adminLevel !== null);
}

function renderUsers() {
    if (!userGrid) return;

    let filtered = allUsers.filter(u => !isAdminUser(u));

    if (userCurrentFilter !== 'all') {
        if (userCurrentFilter === 'blocked') {
            filtered = filtered.filter(u => u.status === 'blocked');
        } else {
            filtered = filtered.filter(u => u.role === userCurrentFilter);
        }
    }

    if (userSearchQuery.trim() !== '') {
        filtered = filtered.filter(u => {
            const name = (u.name || '').toLowerCase();
            const email = (u.email || '').toLowerCase();
            return name.includes(userSearchQuery) || email.includes(userSearchQuery);
        });
    }

    if (filtered.length === 0) {
        userGrid.innerHTML = `<div class="empty-state"><div class="empty-state__icon">👥</div><p>No normal users found.</p></div>`;
        return;
    }

    userGrid.innerHTML = '';
    filtered.forEach(user => {
        userGrid.appendChild(createUserCard(user, false));
    });
}

function renderAdmins() {
    if (!adminGrid) return;
    
    const currentUserProfile = allUsers.find(u => u.id === currentUserId);
    const viewerAdminLevel = currentUserProfile?.adminLevel || (currentUserProfile?.role === 'admin' ? 'main' : 'co');

    let filtered = allUsers.filter(u => isAdminUser(u));

    if (adminCurrentFilter !== 'all') {
        if (adminCurrentFilter === 'main') {
            filtered = filtered.filter(u => u.adminLevel === 'main' || (u.role === 'admin' && !u.adminLevel));
        } else if (adminCurrentFilter === 'co') {
            filtered = filtered.filter(u => u.adminLevel === 'co');
        }
    }

    if (adminSearchQuery.trim() !== '') {
        filtered = filtered.filter(u => {
            const name = (u.name || '').toLowerCase();
            const email = (u.email || '').toLowerCase();
            return name.includes(adminSearchQuery) || email.includes(adminSearchQuery);
        });
    }

    if (filtered.length === 0) {
        adminGrid.innerHTML = `<div class="empty-state"><div class="empty-state__icon">🛡️</div><p>No admins found.</p></div>`;
        return;
    }

    adminGrid.innerHTML = '';
    filtered.forEach(user => {
        adminGrid.appendChild(createUserCard(user, true, viewerAdminLevel, currentUserId));
    });
}

function createUserCard(user, isAdminGrid, viewerAdminLevel = null, currentUserId = null) {
    const card = document.createElement('div');
    card.className = 'driver-card';
    
    const dateStr = user.createdAt ? user.createdAt.toDate().toLocaleDateString() : 'Unknown';
    let statusBadgeClass = 'status-badge--active';
    let statusText = 'Active';
    let roleEmoji = user.role === 'admin' ? '👑' : (user.role === 'driver' ? '🚐' : '🎓');
    let displayedRole = user.role || 'Unknown';

    if (isAdminUser(user)) {
        if (user.adminLevel === 'main' || (user.role === 'admin' && !user.adminLevel)) {
            roleEmoji = '👑';
            displayedRole = 'Main Admin' + (user.role && user.role !== 'admin' ? ` (${user.role})` : '');
        } else {
            roleEmoji = '🛡️';
            displayedRole = 'Co-Admin' + (user.role && user.role !== 'admin' ? ` (${user.role})` : '');
        }
    }

    if (user.status === 'blocked') {
        statusBadgeClass = 'status-badge--rejected';
        statusText = 'Blocked';
    } else if (user.role === 'driver' && user.status === 'pending') {
        statusBadgeClass = 'status-badge--pending';
        statusText = 'Pending';
    } else if (user.role === 'driver' && user.status === 'rejected') {
        statusBadgeClass = 'status-badge--rejected';
        statusText = 'Rejected';
    }

    let actionsHtml = '';

    if (!isAdminGrid) {
        // User Grid logic
        if (user.status === 'blocked') {
            actionsHtml += `<button class="btn-action btn-approve" onclick="toggleUserBlock('${user.id}', 'active', '${user.role}')"><span>✅</span> Unblock</button>`;
        } else {
            actionsHtml += `<button class="btn-action btn-reject" onclick="if(confirm('Block this user?')) toggleUserBlock('${user.id}', 'blocked', '${user.role}')"><span>🚫</span> Block</button>`;
        }
        actionsHtml += `<button class="btn-action btn-outline" style="border: 1px solid var(--accent-primary); color: var(--accent-primary); flex: 1;" onclick="if(confirm('Grant Co-Admin access?')) toggleAdminRole('${user.id}', 'co')"><span>🛡️</span> Make Co-Admin</button>`;
    } else {
        // Admin Grid logic
        const isTargetMainAdmin = user.adminLevel === 'main' || (user.role === 'admin' && !user.adminLevel);
        const isTargetCoAdmin = user.adminLevel === 'co';

        if (isTargetMainAdmin) {
            actionsHtml += `<div style="width: 100%; text-align: center; color: var(--accent-primary); font-size: 0.85rem; padding: 0.5rem; font-weight: 600;">👑 Main Admin Account</div>`;
        } else if (isTargetCoAdmin) {
            // Both Main and Co admins can remove Co-admins
            if (viewerAdminLevel === 'main') {
                actionsHtml += `<button class="btn-action btn-approve" style="flex: 1;" onclick="if(confirm('Transfer Main Admin role?')) makeMainAdmin('${user.id}', '${currentUserId}')"><span>👑</span> Make Main</button>`;
                actionsHtml += `<button class="btn-action btn-reject" style="flex: 1;" onclick="if(confirm('Remove Co-Admin?')) toggleAdminRole('${user.id}', null)"><span>❌</span> Remove Admin</button>`;
            } else if (viewerAdminLevel === 'co') {
                actionsHtml += `<button class="btn-action btn-reject" style="flex: 1;" onclick="if(confirm('Remove Co-Admin?')) toggleAdminRole('${user.id}', null)"><span>❌</span> Remove Admin</button>`;
            }
        }
    }

    if (actionsHtml) {
        actionsHtml = `<div class="driver-card__actions" style="flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem;">${actionsHtml}</div>`;
    }

    card.innerHTML = `
        <div class="driver-card__header">
            <div class="driver-card__info">
                <span class="driver-card__name">${user.name || 'Unknown User'}</span>
                <span class="driver-card__email">${user.email || 'No email provided'}</span>
            </div>
            <span class="status-badge ${statusBadgeClass}">${statusText}</span>
        </div>
        <div class="driver-card__details">
            <div class="detail-item">
                <span class="detail-item__label">Role</span>
                <span class="detail-item__value" style="text-transform: capitalize;">${roleEmoji} ${displayedRole}</span>
            </div>
            <div class="detail-item" style="text-align: right;">
                <span class="detail-item__label">Joined On</span>
                <span class="detail-item__value">${dateStr}</span>
            </div>
        </div>
        ${actionsHtml}
    `;
    return card;
}

window.toggleUserBlock = async function (userId, newStatus, role) {
    try {
        await ApiService.fetchWithAuth(`/Auth/user/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        const actionText = newStatus === 'blocked' ? 'blocked' : 'unblocked';
        if (window.showToast) window.showToast(`User successfully ${actionText}.`, 'success');
        else alert(`User successfully ${actionText}.`);
    } catch (error) {
        console.error("Error toggling user block status:", error);
        if (window.showToast) window.showToast(`Failed to update status: ${error.message}`, 'error');
        else alert(`Failed to update status: ${error.message}`);
    }
};

window.toggleAdminRole = async function (userId, newLevel) {
    try {
        await ApiService.fetchWithAuth(`/Auth/user/${userId}/admin-level`, {
            method: 'PUT',
            body: JSON.stringify({ adminLevel: newLevel })
        });
        const actionText = newLevel === 'co' ? 'granted Co-Admin access' : 'removed from Admins';
        if (window.showToast) window.showToast(`User successfully ${actionText}.`, 'success');
        else alert(`User successfully ${actionText}.`);
    } catch (error) {
        console.error("Error toggling admin role:", error);
        if (window.showToast) window.showToast(`Failed to update admin role: ${error.message}`, 'error');
        else alert(`Failed to update admin role: ${error.message}`);
    }
};

window.makeMainAdmin = async function (targetUserId, currentUserId) {
    if (!currentUserId || currentUserId === 'undefined') return alert("Error: Current user ID not found.");
    try {
        await ApiService.fetchWithAuth(`/Auth/user/${targetUserId}/transfer-main-admin`, {
            method: 'POST'
        });
        if (window.showToast) window.showToast("Main Admin role transferred successfully.", 'success');
        setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
        console.error("Error transferring main admin role:", error);
        if (window.showToast) window.showToast(`Failed to transfer role: ${error.message}`, 'error');
        else alert(`Failed to transfer role: ${error.message}`);
    }
};
