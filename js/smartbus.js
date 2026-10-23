/**
 * BUBT SmartBus — Modern Unified Transit Engine
 * 100% English • Zero OTP • Instant Demo Logins • Real-Time Interactive Simulator
 */

// ── Initial Mock Campus Transit Data ──
const DEFAULT_ROUTES = [
    {
        id: 'route_1',
        name: 'Route 1: Mirpur-10 Express',
        code: 'BL-01',
        color: '#3b82f6',
        frequency: '10 mins',
        hours: '07:00 AM – 09:30 PM',
        status: 'On Route',
        stops: [
            { name: 'BUBT Main Campus (Mirpur 2)', lat: 23.8122, lng: 90.3582, eta: 'At Station' },
            { name: 'Sony Cinema Square', lat: 23.8090, lng: 90.3620, eta: '4 min' },
            { name: 'Mirpur-10 Circle Gate', lat: 23.8071, lng: 90.3686, eta: '8 min' },
            { name: 'Kazipara Bus Stand', lat: 23.7990, lng: 90.3735, eta: '12 min' },
            { name: 'Shewrapara Overpass', lat: 23.7895, lng: 90.3750, eta: '16 min' },
            { name: 'Agargaon Science Hub', lat: 23.7780, lng: 90.3770, eta: '22 min' }
        ]
    },
    {
        id: 'route_2',
        name: 'Route 2: Uttara Commuter',
        code: 'RD-02',
        color: '#10b981',
        frequency: '15 mins',
        hours: '06:45 AM – 09:00 PM',
        status: 'On Route',
        stops: [
            { name: 'BUBT Main Campus (Mirpur 2)', lat: 23.8122, lng: 90.3582, eta: 'At Station' },
            { name: 'Mirpur-1 Commerce College', lat: 23.8015, lng: 90.3540, eta: '6 min' },
            { name: 'Technical Junction', lat: 23.7845, lng: 90.3525, eta: '14 min' },
            { name: 'Airport Road Crossing', lat: 23.8480, lng: 90.4030, eta: '28 min' },
            { name: 'Uttara House Building (Sector 7)', lat: 23.8685, lng: 90.3980, eta: '35 min' }
        ]
    },
    {
        id: 'route_3',
        name: 'Route 3: Motijheel Line',
        code: 'GN-03',
        color: '#f59e0b',
        frequency: '12 mins',
        hours: '07:15 AM – 08:30 PM',
        status: 'Delayed',
        stops: [
            { name: 'BUBT Main Campus (Mirpur 2)', lat: 23.8122, lng: 90.3582, eta: 'At Station' },
            { name: 'Farmgate Ananda Point', lat: 23.7570, lng: 90.3880, eta: '18 min' },
            { name: 'Shahbagh Square', lat: 23.7380, lng: 90.3955, eta: '26 min' },
            { name: 'Paltan Intersection', lat: 23.7335, lng: 90.4120, eta: '32 min' },
            { name: 'Motijheel Commercial Area', lat: 23.7290, lng: 90.4185, eta: '38 min' }
        ]
    },
    {
        id: 'route_4',
        name: 'Route 4: Savar Shuttle',
        code: 'PP-04',
        color: '#8b5cf6',
        frequency: '20 mins',
        hours: '06:30 AM – 08:00 PM',
        status: 'At Station',
        stops: [
            { name: 'BUBT Main Campus (Mirpur 2)', lat: 23.8122, lng: 90.3582, eta: 'At Station' },
            { name: 'Gabtoli Inter-District Terminal', lat: 23.7815, lng: 90.3440, eta: '10 min' },
            { name: 'Aminbazar Bridge', lat: 23.7870, lng: 90.3320, eta: '18 min' },
            { name: 'Hemayetpur Point', lat: 23.8050, lng: 90.2780, eta: '28 min' },
            { name: 'Savar Bus Stand', lat: 23.8465, lng: 90.2580, eta: '42 min' }
        ]
    }
];

const DEFAULT_BUSES = [
    {
        id: 'bus_101',
        name: 'Brahmaputra-1',
        busNumber: 'DHA-001',
        plateNumber: 'DH-11-2041',
        routeId: 'route_1',
        routeName: 'Mirpur 10 - Campus',
        driverName: 'Rafiqul Islam',
        capacity: 45,
        currentOccupancy: 28,
        status: 'Active',
        speedKmh: 32,
        currentStopIndex: 1
    },
    {
        id: 'bus_102',
        name: 'Buriganga-002',
        busNumber: 'DHA-2',
        plateNumber: 'DH-11-3092',
        routeId: 'route_2',
        routeName: 'Uttara - Campus',
        driverName: 'Abdul Karim',
        capacity: 40,
        currentOccupancy: 32,
        status: 'Active',
        speedKmh: 28,
        currentStopIndex: 2
    },
    {
        id: 'bus_103',
        name: 'Padma Express',
        busNumber: 'DHA-003',
        plateNumber: 'DH-11-8410',
        routeId: 'route_3',
        routeName: 'Motijheel - Campus',
        driverName: 'Jahangir Alam',
        capacity: 50,
        currentOccupancy: 42,
        status: 'Active',
        speedKmh: 24,
        currentStopIndex: 0
    },
    {
        id: 'bus_104',
        name: 'Meghna Shuttle',
        busNumber: 'DHA-004',
        plateNumber: 'DH-11-5521',
        routeId: 'route_4',
        routeName: 'Savar - Campus',
        driverName: 'Selim Hossain',
        capacity: 45,
        currentOccupancy: 19,
        status: 'Active',
        speedKmh: 35,
        currentStopIndex: 0
    },
    {
        id: 'bus_105',
        name: 'Jamuna Line',
        busNumber: 'DHA-005',
        plateNumber: 'DH-11-9876',
        routeId: null,
        routeName: 'Current Route Unassigned',
        driverName: 'Tariqul Islam',
        capacity: 45,
        currentOccupancy: 0,
        status: 'Inactive',
        speedKmh: 0,
        currentStopIndex: 0
    }
];

const DEFAULT_CHAT = [
    { id: 1, author: 'Alex Chen', role: 'Student', text: 'Brahmaputra-1 just departed Sony Cinema square, moving on schedule!', time: '2 mins ago', isSelf: false },
    { id: 2, author: 'Sultana Razia', role: 'Student', text: 'Are there seats available on Buriganga-002 towards Uttara?', time: '4 mins ago', isSelf: false },
    { id: 3, author: 'Rafiqul Islam', role: 'Driver', text: 'Hello riders, Brahmaputra-1 has ~17 seats available. Next stop Mirpur-10 Circle.', time: '5 mins ago', isSelf: false },
    { id: 4, author: 'Tanvir Ahmed', role: 'Student', text: 'Thanks driver! Waiting at Mirpur-10 Circle Gate.', time: '7 mins ago', isSelf: false }
];

// ── Local Storage Data Store ──
class SmartBusStore {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('smartbus_routes_v3')) {
            localStorage.setItem('smartbus_routes_v3', JSON.stringify(DEFAULT_ROUTES));
        }
        if (!localStorage.getItem('smartbus_buses_v3')) {
            localStorage.setItem('smartbus_buses_v3', JSON.stringify(DEFAULT_BUSES));
        }
        if (!localStorage.getItem('smartbus_chat_v3')) {
            localStorage.setItem('smartbus_chat_v3', JSON.stringify(DEFAULT_CHAT));
        }
    }

    getRoutes() {
        return JSON.parse(localStorage.getItem('smartbus_routes_v3')) || DEFAULT_ROUTES;
    }

    getBuses() {
        return JSON.parse(localStorage.getItem('smartbus_buses_v3')) || DEFAULT_BUSES;
    }

    saveBuses(buses) {
        localStorage.setItem('smartbus_buses_v3', JSON.stringify(buses));
    }

    getChat() {
        return JSON.parse(localStorage.getItem('smartbus_chat_v3')) || DEFAULT_CHAT;
    }

    addChatMessage(msg) {
        const chat = this.getChat();
        chat.push(msg);
        localStorage.setItem('smartbus_chat_v3', JSON.stringify(chat));
        return chat;
    }

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('smartbus_session')) || null;
        } catch {
            return null;
        }
    }

    setCurrentUser(user) {
        if (user) {
            localStorage.setItem('smartbus_session', JSON.stringify(user));
        } else {
            localStorage.removeItem('smartbus_session');
        }
    }
}

const store = new SmartBusStore();

// ── Application Router & Controller ──
class SmartBusApp {
    constructor() {
        this.store = store;
        this.currentRouteId = 'route_1';
        this.map = null;
        this.mapMarkers = [];
        this.mapRouteLine = null;
        this.busSimulationTimer = null;
        this.driverActiveTrip = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.handleRoute();
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Dynamic copyright year in footer
        const yearEl = document.getElementById('footer-copy-year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();

        // Start periodic bus location simulation for live tracking
        this.startBusSimulation();
    }

    // ── Routing ──
    navigate(path, pushState = true) {
        if (pushState) {
            window.history.pushState({}, '', path);
        }
        this.handleRoute();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    handleRoute() {
        const fullPath = window.location.pathname.toLowerCase();
        const user = this.store.getCurrentUser();

        // Close auth modal if open
        this.closeAuthModal();

        // Backward compatibility mappings
        if (fullPath.includes('/pages/student-dashboard') || fullPath === '/dashboard/student') {
            this.renderStudentDashboard(user);
        } else if (fullPath.includes('/pages/driver-dashboard') || fullPath === '/dashboard/driver') {
            this.renderDriverDashboard(user);
        } else if (fullPath.includes('/pages/admin-dashboard') || fullPath === '/dashboard/admin') {
            this.renderAdminDashboard(user);
        } else if (fullPath.includes('/pages/role-select') || fullPath === '/roles') {
            this.renderRoleSelection();
        } else if (fullPath.includes('/pages/login') || fullPath.includes('/pages/register') || fullPath === '/auth') {
            this.renderLandingPage();
            this.openAuthModal(fullPath.includes('register') ? 'register' : 'signin');
        } else {
            this.renderLandingPage();
            if (window.location.hash) {
                const targetHash = window.location.hash;
                setTimeout(() => {
                    const targetEl = document.querySelector(targetHash);
                    if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
                }, 80);
            }
        }

        this.updateNavbar(user);
    }

    updateNavbar(user) {
        const navActions = document.getElementById('header-nav-actions');
        const navLinks = document.getElementById('nav');

        if (navLinks) {
            if (user) {
                const dashPath = `/dashboard/${user.role}`;
                const isDash = window.location.pathname.startsWith('/dashboard');
                navLinks.innerHTML = `
                    <a href="${dashPath}" class="nav__link ${isDash ? 'is-active' : ''}" id="nav-link-dash" style="${isDash ? 'color:var(--accent-primary); font-weight:700;' : ''}">Dashboard</a>
                    <a href="/#features" class="nav__link" data-section="features">Features</a>
                    <a href="/#how-it-works" class="nav__link" data-section="how-it-works">How It Works</a>
                    <a href="/#roles" class="nav__link" data-section="roles">Roles</a>
                `;
                document.getElementById('nav-link-dash')?.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigate(dashPath);
                });
            } else {
                navLinks.innerHTML = `
                    <a href="/#features" class="nav__link" data-section="features">Features</a>
                    <a href="/#how-it-works" class="nav__link" data-section="how-it-works">How It Works</a>
                    <a href="/#roles" class="nav__link" data-section="roles">Roles</a>
                `;
            }
        }

        if (!navActions) return;

        if (user) {
            let roleIcon = '🎓';
            let roleLabel = 'Student';
            let dashPath = '/dashboard/student';

            if (user.role === 'driver') {
                roleIcon = '🚐';
                roleLabel = 'Driver';
                dashPath = '/dashboard/driver';
            } else if (user.role === 'admin') {
                roleIcon = '🛡️';
                roleLabel = 'Admin';
                dashPath = '/dashboard/admin';
            }

            navActions.innerHTML = `
                <div style="display:flex; align-items:center; gap:0.6rem;">
                    <a href="${dashPath}" class="dash-role-badge dash-role-badge--${user.role}" id="nav-user-badge" style="cursor:pointer; text-decoration:none;">
                        <span>${roleIcon}</span>
                        <span>${user.name.split(' ')[0]} (${roleLabel})</span>
                    </a>
                    <button id="nav-btn-logout" class="btn btn--outline btn--sm" style="padding:0.45rem 0.9rem; font-size:0.75rem;">
                        Sign Out
                    </button>
                </div>
            `;

            document.getElementById('nav-user-badge')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigate(dashPath);
            });

            document.getElementById('nav-btn-logout')?.addEventListener('click', () => {
                this.logout();
            });
        } else {
            navActions.innerHTML = `
                <div style="display:flex; align-items:center; gap:0.6rem;">
                    <button id="btn-quick-demo-nav" class="btn btn--outline btn--sm" style="display:flex; align-items:center; gap:4px;">
                        <span>⚡</span>
                        <span>Quick Demo</span>
                    </button>
                    <button id="btn-open-login" class="btn btn--primary btn--sm">
                        Login / Register
                    </button>
                </div>
            `;

            document.getElementById('btn-open-login')?.addEventListener('click', () => {
                this.openAuthModal('signin');
            });
            document.getElementById('btn-quick-demo-nav')?.addEventListener('click', () => {
                this.openAuthModal('signin');
            });
        }
    }

    // ── View Renderers ──
    hideAllViews() {
        document.querySelectorAll('.app-view-section').forEach(el => el.style.display = 'none');
        const header = document.getElementById('header');
        if (header) {
            const isStudent = window.location.pathname.startsWith('/dashboard/student') || window.location.pathname.startsWith('/pages/student');
            header.style.display = isStudent ? 'none' : 'block';
        }
    }

    renderLandingPage() {
        this.hideAllViews();
        const el = document.getElementById('view-landing');
        if (el) el.style.display = 'block';
    }

    renderRoleSelection() {
        this.renderLandingPage();
        setTimeout(() => {
            const el = document.getElementById('roles');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    }

    renderStudentDashboard(user) {
        if (!user) {
            this.showToast('Please sign in to access Student Dashboard.', 'warning');
            this.navigate('/roles');
            this.openAuthModal('signin');
            return;
        }

        this.hideAllViews();
        const el = document.getElementById('view-student');
        if (!el) return;
        el.style.display = 'block';

        // Set user name in header and profile
        const userPillName = document.getElementById('student-user-pill-name');
        if (userPillName) userPillName.textContent = user.name;

        const welcomeHeading = document.getElementById('dashboard-welcome-heading');
        if (welcomeHeading) welcomeHeading.textContent = `Welcome back, ${user.name}!`;

        const settingsName = document.getElementById('settings-student-name');
        if (settingsName) settingsName.value = user.name;

        const settingsEmail = document.getElementById('settings-student-email');
        if (settingsEmail) settingsEmail.value = user.email;

        // Render sections
        this.renderStudentBusCards();
        this.renderStudentRoutesTab();
        this.renderStudentSchedulesTab();
        this.renderRiderChat();

        // Check hash anchor to activate selected tab (default: 'buses')
        let initialTab = 'buses';
        const hash = window.location.hash.replace('#', '');
        if (['dashboard', 'buses', 'routes', 'schedules', 'chat', 'announcements', 'settings', 'report', 'bus-details'].includes(hash)) {
            initialTab = hash;
        }
        this.switchStudentTab(initialTab, false);
    }

    switchStudentTab(tabId, updateHash = true) {
        // Update active link in sidebar
        document.querySelectorAll('#student-admin-nav .admin-nav__link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.getElementById(`nav-student-${tabId}`);
        if (activeLink) activeLink.classList.add('active');

        // Update header page title
        const titles = {
            'buses': 'Available Buses',
            'bus-details': 'Bus Live Telemetry & Map',
            'dashboard': 'Student Dashboard',
            'routes': 'Campus Routes & Stops',
            'schedules': 'Timetables & Schedules',
            'chat': 'Bus Community Chat',
            'announcements': 'Campus Transit Announcements',
            'settings': 'Account Settings',
            'report': 'Report Issue to Administration'
        };
        const titleEl = document.getElementById('student-page-title');
        if (titleEl) titleEl.textContent = titles[tabId] || 'Student Dashboard';

        // Hide all tab panes and reveal target
        document.querySelectorAll('.student-tab-pane').forEach(p => p.style.display = 'none');
        const targetPane = document.getElementById(`student-tab-${tabId}`);
        if (targetPane) targetPane.style.display = 'block';

        // Close mobile sidebar if open
        document.getElementById('student-sidebar')?.classList.remove('open');
        document.getElementById('student-sidebar-overlay')?.classList.remove('open');

        // Update URL hash cleanly
        if (updateHash && window.history.replaceState) {
            window.history.replaceState(null, '', `/dashboard/student#${tabId}`);
        }

        // If switching to map view, invalidate map size
        if (tabId === 'bus-details') {
            setTimeout(() => {
                this.initInteractiveMap();
                if (this.map) this.map.invalidateSize();
            }, 100);
        }
    }

    renderStudentBusCards() {
        const grid = document.getElementById('student-bus-grid');
        if (!grid) return;

        const buses = this.store.getBuses();

        grid.innerHTML = buses.map(bus => {
            const isActive = bus.status === 'Active';
            return `
                <div class="student-bus-card" data-bus-id="${bus.id}">
                    <div class="student-bus-card__header">
                        <div>
                            <h3 class="student-bus-card__title">${bus.name}</h3>
                            <div class="student-bus-card__code">Code: ${bus.busNumber} &bull; License: ${bus.plateNumber}</div>
                        </div>
                        <span class="status-badge" style="${isActive ? 'background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3);' : 'background:rgba(148,163,184,0.15); color:#94a3b8; border:1px solid rgba(148,163,184,0.3);'}">
                            ${isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:0.5rem;">
                        <div class="student-bus-card__route">
                            📖 Route: <strong>${bus.routeName || 'Current Route Unassigned'}</strong>
                        </div>
                        <div class="student-bus-card__meta">
                            <span>👤 Driver: <strong>${bus.driverName}</strong></span>
                            <span>👥 Load: <strong>${bus.currentOccupancy}/${bus.capacity} seats</strong></span>
                            ${isActive ? `<span style="color:var(--accent-secondary);">⚡ Speed: <strong>${bus.speedKmh} km/h</strong></span>` : ''}
                        </div>
                    </div>

                    <button class="student-bus-card__btn-view" data-bus-id="${bus.id}">
                        <span style="font-size:1.15rem;">🗺️</span> View Live Map &amp; Details
                    </button>
                </div>
            `;
        }).join('');

        // Bind clicks on buttons and cards
        grid.querySelectorAll('.student-bus-card__btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const busId = btn.getAttribute('data-bus-id');
                this.openBusDetails(busId);
            });
        });

        grid.querySelectorAll('.student-bus-card').forEach(card => {
            card.addEventListener('click', () => {
                const busId = card.getAttribute('data-bus-id');
                this.openBusDetails(busId);
            });
        });
    }

    openBusDetails(busId) {
        const buses = this.store.getBuses();
        const bus = buses.find(b => b.id === busId) || buses[0];
        if (!bus) return;

        this.currentRouteId = bus.routeId || 'route_1';

        // Update detail labels
        const nameEl = document.getElementById('detail-bus-name');
        if (nameEl) nameEl.textContent = bus.name;

        const statusEl = document.getElementById('detail-bus-status');
        if (statusEl) {
            const isActive = bus.status === 'Active';
            statusEl.innerHTML = `
                <span class="status-badge" style="${isActive ? 'background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3);' : 'background:rgba(148,163,184,0.15); color:#94a3b8; border:1px solid rgba(148,163,184,0.3);'}">
                    ${isActive ? 'Active &bull; On Route' : 'Inactive &bull; Standby'}
                </span>
            `;
        }

        const routeCodeEl = document.getElementById('detail-route-code');
        if (routeCodeEl) routeCodeEl.textContent = bus.routeName || 'Unassigned Line';

        // ETA panel values
        const etaDestEl = document.getElementById('detail-eta-destination');
        if (etaDestEl) etaDestEl.textContent = 'BUBT Main Campus (Mirpur 2)';

        const etaDistEl = document.getElementById('detail-eta-distance');
        if (etaDistEl) etaDistEl.textContent = bus.status === 'Active' ? '2.4 km' : '--';

        const etaTimeEl = document.getElementById('detail-eta-time');
        if (etaTimeEl) etaTimeEl.textContent = bus.status === 'Active' ? '~6 mins' : 'Standby';

        const etaNextStopEl = document.getElementById('detail-eta-next-stop');
        if (etaNextStopEl) etaNextStopEl.textContent = bus.status === 'Active' ? 'Sony Cinema Square' : 'Campus Hub Depot';

        // Switch to bus-details tab
        this.switchStudentTab('bus-details');

        // Render stop timeline
        this.renderStopsTimeline();

        // Update map
        setTimeout(() => {
            this.initInteractiveMap();
            if (this.map) {
                this.map.invalidateSize();
                this.updateInteractiveMap();
            }
        }, 120);
    }

    renderStudentRoutesTab() {
        const container = document.getElementById('student-routes-detailed-container');
        if (!container) return;

        const routes = this.store.getRoutes();
        container.innerHTML = routes.map(r => `
            <div style="background:var(--bg-surface); border:1px solid var(--border-card); border-radius:12px; padding:1.25rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
                    <div>
                        <h3 style="margin:0; font-size:1.1rem; color:var(--text-primary); font-weight:700;">${r.name}</h3>
                        <span style="font-size:0.8rem; color:var(--text-muted); font-family:monospace;">Code: ${r.code}</span>
                    </div>
                    <span class="badge-status badge-status--active">${r.status}</span>
                </div>
                <div style="display:flex; gap:1.5rem; font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem; flex-wrap:wrap;">
                    <span>⏱️ Frequency: <strong>Every ${r.frequency}</strong></span>
                    <span>🕒 Hours: <strong>${r.hours}</strong></span>
                    <span>📍 Stops: <strong>${r.stops.length} stations</strong></span>
                </div>
                <div style="background:var(--bg-primary); padding:0.75rem 1rem; border-radius:8px; border:1px solid var(--border-card); font-size:0.85rem; color:var(--text-primary);">
                    <strong>Route Path:</strong> ${r.stops.map(s => s.name).join(' &rarr; ')}
                </div>
            </div>
        `).join('');
    }

    renderStudentSchedulesTab() {
        const container = document.getElementById('student-schedules-container');
        if (!container) return;

        const routes = this.store.getRoutes();
        container.innerHTML = routes.map(r => `
            <div class="dash-card">
                <div class="dash-card__header">
                    <h3 class="dash-card__title">${r.name}</h3>
                    <span style="font-size:0.75rem; font-weight:700; color:var(--accent-primary);">${r.code}</span>
                </div>
                <div class="dash-card__body">
                    <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.75rem;">
                        Operating: <strong>${r.hours}</strong>
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.8rem; text-align:left;">
                        <thead>
                            <tr style="border-bottom:1px solid var(--border-card); color:var(--text-muted);">
                                <th style="padding:4px 0;">Shift</th>
                                <th style="padding:4px 0;">Time</th>
                                <th style="padding:4px 0;">Interval</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid var(--border-subtle);">
                                <td style="padding:6px 0; color:var(--text-primary);">Morning Peak</td>
                                <td style="padding:6px 0;">07:00 AM – 10:00 AM</td>
                                <td style="padding:6px 0; color:var(--accent-secondary); font-weight:600;">${r.frequency}</td>
                            </tr>
                            <tr style="border-bottom:1px solid var(--border-subtle);">
                                <td style="padding:6px 0; color:var(--text-primary);">Midday Regular</td>
                                <td style="padding:6px 0;">10:00 AM – 04:00 PM</td>
                                <td style="padding:6px 0;">15 mins</td>
                            </tr>
                            <tr>
                                <td style="padding:6px 0; color:var(--text-primary);">Evening Peak</td>
                                <td style="padding:6px 0;">04:00 PM – 08:30 PM</td>
                                <td style="padding:6px 0; color:var(--accent-secondary); font-weight:600;">10 mins</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `).join('');
    }

    renderDriverDashboard(user) {
        if (!user) {
            this.showToast('Please sign in to access Driver Dashboard.', 'warning');
            this.navigate('/roles');
            this.openAuthModal('signin');
            return;
        }

        this.hideAllViews();
        const el = document.getElementById('view-driver');
        if (!el) return;
        el.style.display = 'block';

        const greetingEl = document.getElementById('driver-greeting-name');
        if (greetingEl) greetingEl.textContent = user.name;

        this.renderDriverController();
    }

    renderAdminDashboard(user) {
        if (!user) {
            this.showToast('Please sign in to access Admin Dashboard.', 'warning');
            this.navigate('/roles');
            this.openAuthModal('signin');
            return;
        }

        this.hideAllViews();
        const el = document.getElementById('view-admin');
        if (!el) return;
        el.style.display = 'block';

        const greetingEl = document.getElementById('admin-greeting-name');
        if (greetingEl) greetingEl.textContent = user.name;

        this.renderAdminFleetTable();
        this.renderAdminRoutesSummary();
    }

    renderStopsTimeline() {
        const timelineEl = document.getElementById('student-stops-timeline');
        if (!timelineEl) return;

        const routes = this.store.getRoutes();
        const selectedRoute = routes.find(r => r.id === this.currentRouteId) || routes[0];
        const buses = this.store.getBuses().filter(b => b.routeId === selectedRoute.id);
        const activeBus = buses[0] || { currentStopIndex: 1 };

        timelineEl.innerHTML = `
            <div style="margin-bottom:0.75rem; font-weight:700; font-size:0.9rem; color:var(--text-primary); display:flex; justify-content:space-between;">
                <span>Stops on ${selectedRoute.code}</span>
                <span style="color:var(--accent-primary);">Active Bus: ${activeBus.busNumber || 'BUS-01'}</span>
            </div>
            <div class="stop-progress-list">
                ${selectedRoute.stops.map((stop, idx) => {
                    let stepClass = 'is-upcoming';
                    if (idx < activeBus.currentStopIndex) stepClass = 'is-passed';
                    else if (idx === activeBus.currentStopIndex) stepClass = 'is-current';

                    return `
                        <div class="stop-step ${stepClass}">
                            <div class="stop-step__marker">${idx + 1}</div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <strong style="font-size:0.875rem; color:var(--text-primary);">${stop.name}</strong>
                                <span style="font-size:0.78rem; font-weight:600; color:${stepClass === 'is-current' ? 'var(--accent-primary)' : 'var(--text-muted)'};">
                                    ${stepClass === 'is-current' ? 'Approaching Now' : stop.eta}
                                </span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // ── Interactive Map Simulation (Leaflet.js) ──
    initInteractiveMap() {
        const mapContainer = document.getElementById('live-map-container');
        if (!mapContainer) return;

        if (this.map) {
            this.map.invalidateSize();
            this.updateInteractiveMap();
            return;
        }

        // Initialize Leaflet Map centered at BUBT Campus (Mirpur 2, Dhaka)
        if (typeof L !== 'undefined') {
            this.map = L.map('live-map-container', {
                zoomControl: true,
                attributionControl: false
            }).setView([23.8122, 90.3582], 14);

            // Keyless OpenStreetMap tiles (100% free, zero watermarks)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                subdomains: ['a', 'b', 'c']
            }).addTo(this.map);

            this.updateInteractiveMap();
        }
    }

    updateInteractiveMap() {
        if (!this.map || typeof L === 'undefined') return;

        // Clear existing markers & polyline
        this.mapMarkers.forEach(m => this.map.removeLayer(m));
        this.mapMarkers = [];
        if (this.mapRouteLine) {
            this.map.removeLayer(this.mapRouteLine);
            this.mapRouteLine = null;
        }

        const routes = this.store.getRoutes();
        const selectedRoute = routes.find(r => r.id === this.currentRouteId) || routes[0];
        const stops = selectedRoute.stops;

        // Draw Route Line
        const latLngs = stops.map(s => [s.lat, s.lng]);
        this.mapRouteLine = L.polyline(latLngs, {
            color: selectedRoute.color || '#3b82f6',
            weight: 5,
            opacity: 0.85,
            dashArray: '1, 8',
            lineJoin: 'round'
        }).addTo(this.map);

        // Add Stop Markers
        stops.forEach((s, idx) => {
            const isCampus = idx === 0;
            const markerHtml = `
                <div style="background:${isCampus ? '#10b981' : '#1e293b'}; color:#fff; border:2px solid ${isCampus ? '#34d399' : '#64748b'}; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; box-shadow:0 2px 8px rgba(0,0,0,0.5);">
                    ${idx + 1}
                </div>
            `;
            const icon = L.divIcon({
                html: markerHtml,
                className: 'custom-stop-icon',
                iconSize: [26, 26],
                iconAnchor: [13, 13]
            });

            const marker = L.marker([s.lat, s.lng], { icon })
                .addTo(this.map)
                .bindPopup(`
                    <div style="font-family:sans-serif; padding:4px;">
                        <strong style="color:#0f172a; font-size:13px;">${s.name}</strong><br>
                        <span style="font-size:11px; color:#475569;">ETA: ${s.eta}</span>
                    </div>
                `);

            this.mapMarkers.push(marker);
        });

        // Add Active Bus Marker
        const buses = this.store.getBuses().filter(b => b.routeId === selectedRoute.id);
        const activeBus = buses[0] || { currentStopIndex: 1, busNumber: 'BUS-01', speedKmh: 28, capacity: 45, currentOccupancy: 28 };
        const currentStop = stops[activeBus.currentStopIndex] || stops[0];

        const busIconHtml = `
            <div style="background:#3b82f6; color:#fff; width:40px; height:40px; border-radius:50%; border:3px solid #fff; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 0 20px rgba(59,130,246,0.8); animation:pulse 1.8s infinite;">
                🚌
            </div>
        `;
        const busIcon = L.divIcon({
            html: busIconHtml,
            className: 'custom-bus-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        const busMarker = L.marker([currentStop.lat, currentStop.lng], { icon: busIcon })
            .addTo(this.map)
            .bindPopup(`
                <div style="font-family:sans-serif; padding:6px; min-width:140px;">
                    <div style="font-size:13px; font-weight:800; color:#1e293b;">${activeBus.busNumber}</div>
                    <div style="font-size:11px; color:#10b981; font-weight:700;">🟢 Live Broadcasting</div>
                    <div style="font-size:11px; color:#475569; margin-top:4px;">Approaching: <strong>${currentStop.name}</strong></div>
                    <div style="font-size:11px; color:#475569;">Occupancy: <strong>${activeBus.currentOccupancy}/${activeBus.capacity} seats</strong></div>
                    <div style="font-size:11px; color:#475569;">Speed: <strong>${activeBus.speedKmh} km/h</strong></div>
                </div>
            `);

        this.mapMarkers.push(busMarker);
        this.map.fitBounds(this.mapRouteLine.getBounds(), { padding: [40, 40] });
    }

    startBusSimulation() {
        if (this.busSimulationTimer) clearInterval(this.busSimulationTimer);
        
        this.busSimulationTimer = setInterval(() => {
            const buses = this.store.getBuses();
            let changed = false;

            buses.forEach(b => {
                if (b.status === 'Active') {
                    const route = this.store.getRoutes().find(r => r.id === b.routeId);
                    if (route && route.stops.length > 0) {
                        b.currentStopIndex = (b.currentStopIndex + 1) % route.stops.length;
                        changed = true;
                    }
                }
            });

            if (changed) {
                this.store.saveBuses(buses);
                // Update map & stops if student dashboard is visible
                const studentView = document.getElementById('view-student');
                if (studentView && studentView.style.display !== 'none') {
                    this.updateInteractiveMap();
                    this.renderStopsTimeline();
                }
            }
        }, 8000); // Progress stop every 8 seconds in simulation
    }

    // ── Rider Notice Board / Chat ──
    renderRiderChat() {
        const messagesContainer = document.getElementById('rider-chat-messages');
        if (!messagesContainer) return;

        const chat = this.store.getChat();
        const user = this.store.getCurrentUser();

        messagesContainer.innerHTML = chat.map(m => {
            const isSelf = user && (m.author === user.name || m.isSelf);
            return `
                <div class="chat-bubble-item ${isSelf ? 'chat-bubble-item--self' : 'chat-bubble-item--other'}">
                    <div class="chat-author">${m.author} (${m.role})</div>
                    <div>${m.text}</div>
                    <div style="font-size:0.68rem; opacity:0.75; text-align:right; margin-top:2px;">${m.time}</div>
                </div>
            `;
        }).join('');

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendRiderChatMessage() {
        const input = document.getElementById('rider-chat-input');
        if (!input || !input.value.trim()) return;

        const user = this.store.getCurrentUser() || { name: 'Campus Rider', role: 'Student' };
        const newMsg = {
            id: Date.now(),
            author: user.name,
            role: user.role === 'driver' ? 'Driver' : (user.role === 'admin' ? 'Admin' : 'Student'),
            text: input.value.trim(),
            time: 'Just now',
            isSelf: true
        };

        this.store.addChatMessage(newMsg);
        input.value = '';
        this.renderRiderChat();
    }

    // ── Driver Trip Controller ──
    renderDriverController() {
        const busNumEl = document.getElementById('driver-assigned-bus-number');
        const plateEl = document.getElementById('driver-assigned-plate');
        const routeSelect = document.getElementById('driver-route-select');
        const passCountEl = document.getElementById('driver-passenger-count');
        const stopNameEl = document.getElementById('driver-current-stop-name');
        const statusBadgeEl = document.getElementById('driver-trip-status-badge');

        const buses = this.store.getBuses();
        const assignedBus = buses[0]; // Primary driver bus
        const routes = this.store.getRoutes();

        if (busNumEl) busNumEl.textContent = assignedBus.busNumber;
        if (plateEl) plateEl.textContent = assignedBus.plateNumber;
        if (passCountEl) passCountEl.textContent = assignedBus.currentOccupancy;

        if (routeSelect && routeSelect.children.length === 0) {
            routeSelect.innerHTML = routes.map(r => `
                <option value="${r.id}" ${r.id === assignedBus.routeId ? 'selected' : ''}>${r.name}</option>
            `).join('');
        }

        const activeRoute = routes.find(r => r.id === (routeSelect?.value || assignedBus.routeId)) || routes[0];
        const currentStop = activeRoute.stops[assignedBus.currentStopIndex] || activeRoute.stops[0];
        if (stopNameEl) stopNameEl.textContent = currentStop.name;

        if (statusBadgeEl) {
            statusBadgeEl.textContent = assignedBus.status === 'Active' ? 'TRIP IN PROGRESS' : 'STANDBY';
            statusBadgeEl.className = `badge-status ${assignedBus.status === 'Active' ? 'badge-status--active' : 'badge-status--idle'}`;
        }
    }

    driverStartTrip() {
        const buses = this.store.getBuses();
        const bus = buses[0];
        bus.status = 'Active';
        bus.speedKmh = 32;
        this.store.saveBuses(buses);
        this.showToast('Trip started! Live GPS telemetry is broadcasting to campus.', 'success');
        this.renderDriverController();
    }

    driverNextStop() {
        const buses = this.store.getBuses();
        const bus = buses[0];
        const routes = this.store.getRoutes();
        const route = routes.find(r => r.id === bus.routeId) || routes[0];

        bus.currentStopIndex = (bus.currentStopIndex + 1) % route.stops.length;
        // Random passenger boarding / deboarding
        const delta = Math.floor(Math.random() * 7) - 3;
        bus.currentOccupancy = Math.max(0, Math.min(bus.capacity, bus.currentOccupancy + delta));
        
        this.store.saveBuses(buses);
        const nextStop = route.stops[bus.currentStopIndex];
        this.showToast(`Arrived at next stop: ${nextStop.name}`, 'success');
        this.renderDriverController();
    }

    driverCompleteTrip() {
        const buses = this.store.getBuses();
        const bus = buses[0];
        bus.status = 'Idle';
        bus.speedKmh = 0;
        bus.currentOccupancy = 0;
        this.store.saveBuses(buses);
        this.showToast('Trip completed. Bus status updated to Idle.', 'success');
        this.renderDriverController();
    }

    driverChangeOccupancy(delta) {
        const buses = this.store.getBuses();
        const bus = buses[0];
        bus.currentOccupancy = Math.max(0, Math.min(bus.capacity, bus.currentOccupancy + delta));
        this.store.saveBuses(buses);
        const countEl = document.getElementById('driver-passenger-count');
        if (countEl) countEl.textContent = bus.currentOccupancy;
    }

    // ── Admin Fleet Management ──
    renderAdminFleetTable() {
        const tbody = document.getElementById('admin-fleet-table-body');
        if (!tbody) return;

        const buses = this.store.getBuses();
        const routes = this.store.getRoutes();

        tbody.innerHTML = buses.map(b => {
            const route = routes.find(r => r.id === b.routeId);
            let statusBadge = 'badge-status--active';
            if (b.status === 'Idle') statusBadge = 'badge-status--idle';
            if (b.status === 'Maintenance') statusBadge = 'badge-status--maintenance';

            return `
                <tr>
                    <td style="font-weight:700; color:var(--text-primary);">${b.busNumber}</td>
                    <td style="font-family:monospace; color:var(--text-secondary);">${b.plateNumber}</td>
                    <td>${route ? route.name : 'Unassigned'}</td>
                    <td>${b.driverName}</td>
                    <td>${b.currentOccupancy} / ${b.capacity} seats</td>
                    <td><span class="badge-status ${statusBadge}">${b.status}</span></td>
                    <td>
                        <button class="btn btn--outline btn--sm" onclick="window.smartbusApp.deleteBus('${b.id}')" style="padding:4px 8px; font-size:11px; color:#ef4444; border-color:rgba(239,68,68,0.3);">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderAdminRoutesSummary() {
        const container = document.getElementById('admin-routes-summary');
        if (!container) return;

        const routes = this.store.getRoutes();
        container.innerHTML = routes.map(r => `
            <div style="background:var(--bg-primary); border:1px solid var(--border-card); border-radius:12px; padding:1rem; margin-bottom:0.75rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <strong style="color:var(--text-primary); font-size:0.95rem;">${r.name} (${r.code})</strong>
                    <span style="font-size:0.75rem; color:var(--accent-primary); font-weight:700;">${r.stops.length} Stops</span>
                </div>
                <div style="font-size:0.8rem; color:var(--text-secondary);">
                    Frequency: Every ${r.frequency} • Hours: ${r.hours}
                </div>
            </div>
        `).join('');
    }

    addNewBus(busData) {
        const buses = this.store.getBuses();
        const newBus = {
            id: 'bus_' + Date.now(),
            busNumber: busData.busNumber,
            plateNumber: busData.plateNumber,
            routeId: busData.routeId,
            driverName: busData.driverName || 'Assigned Driver',
            capacity: parseInt(busData.capacity, 10) || 45,
            currentOccupancy: 0,
            status: 'Active',
            speedKmh: 0,
            currentStopIndex: 0
        };

        buses.push(newBus);
        this.store.saveBuses(buses);
        this.showToast(`Bus ${newBus.busNumber} successfully added to campus fleet!`, 'success');
        this.renderAdminFleetTable();
    }

    deleteBus(busId) {
        let buses = this.store.getBuses();
        buses = buses.filter(b => b.id !== busId);
        this.store.saveBuses(buses);
        this.showToast('Bus removed from fleet.', 'info');
        this.renderAdminFleetTable();
    }

    // ── Authentication Flows (Zero OTP, Instant Demo) ──
    loginDemo(role) {
        let user;
        if (role === 'driver') {
            user = { id: 'usr_demo_driver', name: 'Rafiqul Islam', email: 'driver@bubt.edu', role: 'driver' };
        } else if (role === 'admin') {
            user = { id: 'usr_demo_admin', name: 'Sarah Jenkins', email: 'admin@bubt.edu', role: 'admin' };
        } else {
            user = { id: 'usr_demo_student', name: 'Alex Chen', email: 'student@bubt.edu', role: 'student' };
        }

        this.store.setCurrentUser(user);
        this.closeAuthModal();
        this.showToast(`Logged in as ${user.name} (${user.role.toUpperCase()})!`, 'success');
        this.navigate(`/dashboard/${user.role}`);
    }

    loginCustom(email, password) {
        if (!email || !password) {
            this.showToast('Please enter both email and password.', 'warning');
            return;
        }

        // Determine role from email or default to student
        let role = 'student';
        let name = email.split('@')[0];
        name = name.charAt(0).toUpperCase() + name.slice(1);

        if (email.includes('driver')) role = 'driver';
        else if (email.includes('admin')) role = 'admin';

        const user = {
            id: 'usr_' + Date.now(),
            name: name,
            email: email,
            role: role
        };

        this.store.setCurrentUser(user);
        this.closeAuthModal();
        this.showToast(`Welcome back, ${user.name}!`, 'success');
        this.navigate(`/dashboard/${user.role}`);
    }

    registerCustom(name, email, password, role) {
        if (!name || !email || !password) {
            this.showToast('Please fill out all registration fields.', 'warning');
            return;
        }

        const user = {
            id: 'usr_' + Date.now(),
            name: name.trim(),
            email: email.trim(),
            role: role || 'student'
        };

        this.store.setCurrentUser(user);
        this.closeAuthModal();
        this.showToast(`Account created! Welcome to BUBT SmartBus, ${user.name}.`, 'success');
        this.navigate(`/dashboard/${user.role}`);
    }

    logout() {
        this.store.setCurrentUser(null);
        this.showToast('Signed out successfully.', 'info');
        this.navigate('/');
    }

    // ── Auth Modal Controls ──
    openAuthModal(tab = 'signin') {
        const modal = document.getElementById('auth-modal');
        if (!modal) return;

        modal.classList.add('is-active');
        this.switchAuthTab(tab);
    }

    closeAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.classList.remove('is-active');
    }

    switchAuthTab(tab) {
        const btnSignIn = document.getElementById('tab-btn-signin');
        const btnRegister = document.getElementById('tab-btn-register');
        const formSignIn = document.getElementById('auth-form-signin');
        const formRegister = document.getElementById('auth-form-register');

        if (tab === 'register') {
            btnSignIn?.classList.remove('is-active');
            btnRegister?.classList.add('is-active');
            if (formSignIn) formSignIn.style.display = 'none';
            if (formRegister) formRegister.style.display = 'block';
        } else {
            btnRegister?.classList.remove('is-active');
            btnSignIn?.classList.add('is-active');
            if (formRegister) formRegister.style.display = 'none';
            if (formSignIn) formSignIn.style.display = 'block';
        }
    }

    // ── Toast Notification Helper ──
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        let icon = type === 'error' ? '❌' : (type === 'warning' ? '⚠️' : '✅');

        toast.innerHTML = `
            <div class="toast__icon">${icon}</div>
            <div class="toast__content"><div class="toast__message">${message}</div></div>
            <button class="toast__close" aria-label="Close">&times;</button>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.classList.add('toast--visible'), 10);

        toast.querySelector('.toast__close')?.addEventListener('click', () => {
            toast.classList.remove('toast--visible');
            setTimeout(() => toast.remove(), 250);
        });

        setTimeout(() => {
            toast.classList.remove('toast--visible');
            setTimeout(() => toast.remove(), 250);
        }, 4000);
    }

    // ── Global Event Bindings ──
    bindEvents() {
        // Student Sidebar Navigation Tabs
        document.querySelectorAll('#student-admin-nav .admin-nav__link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.getAttribute('data-tab');
                if (tab) this.switchStudentTab(tab);
            });
        });

        // Student Sidebar Logo
        document.getElementById('student-sidebar-logo')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigate('/');
        });

        // Student Logout
        document.getElementById('student-btn-logout')?.addEventListener('click', () => {
            this.logout();
        });

        // Back to Buses Button
        document.getElementById('btn-back-to-buses')?.addEventListener('click', () => {
            this.switchStudentTab('buses');
        });

        // Notification Bell & Dropdown
        document.getElementById('student-notif-bell')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('student-notif-dropdown')?.classList.toggle('active');
        });

        document.getElementById('student-clear-notifs-btn')?.addEventListener('click', () => {
            const list = document.getElementById('student-notif-list');
            if (list) list.innerHTML = '<div style="padding:1.5rem; text-align:center; color:var(--text-muted); font-size:0.85rem;">No new notifications.</div>';
            const badge = document.getElementById('student-notif-badge');
            if (badge) badge.style.display = 'none';
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#student-notif-container')) {
                document.getElementById('student-notif-dropdown')?.classList.remove('active');
            }
        });

        // Mobile Sidebar Toggles
        document.getElementById('student-mobile-toggle')?.addEventListener('click', () => {
            document.getElementById('student-sidebar')?.classList.toggle('open');
            document.getElementById('student-sidebar-overlay')?.classList.toggle('open');
        });

        document.getElementById('student-mobile-close-btn')?.addEventListener('click', () => {
            document.getElementById('student-sidebar')?.classList.remove('open');
            document.getElementById('student-sidebar-overlay')?.classList.remove('open');
        });

        document.getElementById('student-sidebar-overlay')?.addEventListener('click', () => {
            document.getElementById('student-sidebar')?.classList.remove('open');
            document.getElementById('student-sidebar-overlay')?.classList.remove('open');
        });

        // Incident Report Form Submit
        document.getElementById('student-report-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.showToast('Incident report successfully submitted to Campus Transport Office.', 'success');
            e.target.reset();
            this.switchStudentTab('buses');
        });

        // Logo Click: Smoothly navigate to landing page
        document.getElementById('logo')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Delegated Section Navigation (Features, How It Works, Roles)
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href*="#features"], a[href*="#how-it-works"], a[href*="#roles"]');
            if (!anchor) return;

            e.preventDefault();
            const href = anchor.getAttribute('href') || '';
            const targetSectionId = href.split('#')[1];
            if (!targetSectionId) return;

            const isLanding = window.location.pathname === '/' && document.getElementById('view-landing')?.style.display !== 'none';
            if (!isLanding) {
                this.navigate('/', true);
            }

            // Update URL hash cleanly
            if (window.history.pushState) {
                window.history.pushState(null, '', `/#${targetSectionId}`);
            }

            setTimeout(() => {
                const targetEl = document.getElementById(targetSectionId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 60);
        });

        // Modal Close Button
        document.getElementById('auth-modal-close')?.addEventListener('click', () => this.closeAuthModal());
        
        // Modal Backdrop Click
        document.getElementById('auth-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'auth-modal') this.closeAuthModal();
        });

        // Tab Switchers
        document.getElementById('tab-btn-signin')?.addEventListener('click', () => this.switchAuthTab('signin'));
        document.getElementById('tab-btn-register')?.addEventListener('click', () => this.switchAuthTab('register'));

        // Quick Demo Buttons
        document.getElementById('demo-login-student')?.addEventListener('click', () => this.loginDemo('student'));
        document.getElementById('demo-login-driver')?.addEventListener('click', () => this.loginDemo('driver'));
        document.getElementById('demo-login-admin')?.addEventListener('click', () => this.loginDemo('admin'));

        // Hero and Role Card CTAs
        document.getElementById('hero-btn-try')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openAuthModal('signin');
        });

        document.getElementById('role-card-student-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.loginDemo('student');
        });

        document.getElementById('role-card-driver-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.loginDemo('driver');
        });

        document.getElementById('role-card-admin-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.loginDemo('admin');
        });

        // Sign In Form Submit
        document.getElementById('auth-form-signin')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signin-email')?.value;
            const password = document.getElementById('signin-password')?.value;
            this.loginCustom(email, password);
        });

        // Register Form Submit
        document.getElementById('auth-form-register')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name')?.value;
            const email = document.getElementById('register-email')?.value;
            const password = document.getElementById('register-password')?.value;
            const role = document.getElementById('register-role')?.value;
            this.registerCustom(name, email, password, role);
        });

        // Rider Chat Send
        document.getElementById('btn-send-chat')?.addEventListener('click', () => this.sendRiderChatMessage());
        document.getElementById('rider-chat-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.sendRiderChatMessage();
        });

        // Driver Actions
        document.getElementById('btn-driver-start')?.addEventListener('click', () => this.driverStartTrip());
        document.getElementById('btn-driver-next')?.addEventListener('click', () => this.driverNextStop());
        document.getElementById('btn-driver-stop')?.addEventListener('click', () => this.driverCompleteTrip());
        document.getElementById('btn-pass-plus')?.addEventListener('click', () => this.driverChangeOccupancy(1));
        document.getElementById('btn-pass-minus')?.addEventListener('click', () => this.driverChangeOccupancy(-1));

        // Admin Add Bus Modal & Form
        const addBusModal = document.getElementById('admin-add-bus-modal');
        document.getElementById('btn-admin-add-bus')?.addEventListener('click', () => {
            if (addBusModal) addBusModal.classList.add('is-active');
        });
        document.getElementById('admin-add-bus-close')?.addEventListener('click', () => {
            if (addBusModal) addBusModal.classList.remove('is-active');
        });

        document.getElementById('admin-add-bus-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const busNumber = document.getElementById('new-bus-number')?.value;
            const plateNumber = document.getElementById('new-plate-number')?.value;
            const routeId = document.getElementById('new-route-id')?.value;
            const driverName = document.getElementById('new-driver-name')?.value;
            const capacity = document.getElementById('new-capacity')?.value;

            this.addNewBus({ busNumber, plateNumber, routeId, driverName, capacity });
            if (addBusModal) addBusModal.classList.remove('is-active');
            e.target.reset();
        });
    }
}

// ── Instantiate Application on Page Load ──
document.addEventListener('DOMContentLoaded', () => {
    window.smartbusApp = new SmartBusApp();
});
