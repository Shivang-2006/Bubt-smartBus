import { db } from "./firebase-config.js";
import { collection, query, where, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// DOM Elements
let statTotalStudents;
let statActiveDrivers;
let statTotalBuses;
let statActiveRoutes;
let userRolesChart;
let driverStatusChart;

export function initAnalytics() {
    statTotalStudents = document.getElementById('analytics-total-students');
    statActiveDrivers = document.getElementById('analytics-active-drivers');
    statTotalBuses = document.getElementById('analytics-total-buses');
    statActiveRoutes = document.getElementById('analytics-active-routes');
    
    fetchStats();
}

async function fetchStats() {
    // 1. Fetch Users
    onSnapshot(collection(db, "users"), (snapshot) => {
        let students = 0;
        let pendingDrivers = 0;
        let activeDrivers = 0;
        let rejectedDrivers = 0;
        
        snapshot.forEach(doc => {
            const user = doc.data();
            if (user.role === 'student') students++;
            else if (user.role === 'driver') {
                if (user.status === 'active') activeDrivers++;
                else if (user.status === 'pending') pendingDrivers++;
                else rejectedDrivers++;
            }
        });
        
        if (statTotalStudents) statTotalStudents.textContent = students;
        if (statActiveDrivers) statActiveDrivers.textContent = activeDrivers;
        
        updateUserRolesChart(students, activeDrivers, pendingDrivers);
        updateDriverStatusChart(activeDrivers, pendingDrivers, rejectedDrivers);
    });

    // 2. Fetch Buses
    onSnapshot(collection(db, "buses"), (snapshot) => {
        if (statTotalBuses) statTotalBuses.textContent = snapshot.size;
    });

    // 3. Fetch Routes
    onSnapshot(collection(db, "routes"), (snapshot) => {
        if (statActiveRoutes) statActiveRoutes.textContent = snapshot.size;
    });
}

function updateUserRolesChart(students, activeDrivers, pendingDrivers) {
    const ctx = document.getElementById('chart-user-roles');
    if (!ctx) return;
    
    if (userRolesChart) {
        userRolesChart.destroy();
    }
    
    userRolesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Students', 'Active Drivers', 'Pending Drivers'],
            datasets: [{
                data: [students, activeDrivers, pendingDrivers],
                backgroundColor: [
                    'rgba(108, 99, 255, 0.8)',
                    'rgba(0, 200, 83, 0.8)',
                    'rgba(255, 170, 0, 0.8)'
                ],
                borderColor: 'rgba(18, 18, 28, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#a0a0b0' }
                }
            }
        }
    });
}

function updateDriverStatusChart(active, pending, rejected) {
    const ctx = document.getElementById('chart-driver-status');
    if (!ctx) return;
    
    if (driverStatusChart) {
        driverStatusChart.destroy();
    }
    
    driverStatusChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Active', 'Pending', 'Rejected'],
            datasets: [{
                data: [active, pending, rejected],
                backgroundColor: [
                    'rgba(0, 200, 83, 0.8)',
                    'rgba(255, 170, 0, 0.8)',
                    'rgba(255, 77, 77, 0.8)'
                ],
                borderColor: 'rgba(18, 18, 28, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#a0a0b0' }
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // Only init if the section exists
    if (document.getElementById('section-analytics')) {
        setTimeout(initAnalytics, 500);
    }
});
