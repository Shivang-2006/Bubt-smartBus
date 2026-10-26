/**
 * RKGIT SmartBus — Modern Unified Transit Engine (Ghaziabad Local Routes)
 * 100% English • Zero OTP • Instant Demo Logins • Real-Time Interactive Simulator
 */

// ── Initial Mock Campus Transit Data (Ghaziabad / RKGIT Local Routes) ──
const DEFAULT_ROUTES = [
    {
        id: 'route_1',
        name: 'Route 1: Anand Vihar - RKGIT Express',
        code: 'AV-01',
        color: '#3b82f6',
        frequency: '10 mins',
        hours: '06:45 AM – 09:30 PM',
        status: 'On Route',
        stops: [
            { name: 'Anand Vihar ISBT / Metro', lat: 28.6469, lng: 77.3160, eta: 'At Station' },
            { name: 'Mohan Nagar Metro Station', lat: 28.6788, lng: 77.3828, eta: '5 min' },
            { name: 'Raj Nagar Extension', lat: 28.7050, lng: 77.4200, eta: '12 min' },
            { name: 'Old Bus Stand Ghaziabad', lat: 28.6675, lng: 77.4360, eta: '18 min' },
            { name: 'Meerut Road Industrial Area', lat: 28.6850, lng: 77.4450, eta: '23 min' },
            { name: 'RKGIT Main Campus Gate', lat: 28.6967, lng: 77.4526, eta: '28 min' }
        ]
    },
    {
        id: 'route_2',
        name: 'Route 2: Noida City Centre - RKGIT Shuttle',
        code: 'ND-02',
        color: '#10b981',
        frequency: '15 mins',
        hours: '07:00 AM – 09:00 PM',
        status: 'On Route',
        stops: [
            { name: 'Noida City Centre Metro', lat: 28.5747, lng: 77.3560, eta: 'At Station' },
            { name: 'Noida Sector 62 / Electronic City', lat: 28.6280, lng: 77.3730, eta: '8 min' },
            { name: 'CISF Camp Indirapuram', lat: 28.6415, lng: 77.3750, eta: '14 min' },
            { name: 'Mohan Nagar Metro Station', lat: 28.6788, lng: 77.3828, eta: '22 min' },
            { name: 'RKGIT Main Campus Gate', lat: 28.6967, lng: 77.4526, eta: '32 min' }
        ]
    },
    {
        id: 'route_3',
        name: 'Route 3: Vaishali / Kaushambi Line',
        code: 'VS-03',
        color: '#f59e0b',
        frequency: '12 mins',
        hours: '07:15 AM – 08:30 PM',
        status: 'Delayed',
        stops: [
            { name: 'Kaushambi Metro Station', lat: 28.6455, lng: 77.3242, eta: 'At Station' },
            { name: 'Vaishali Metro Station', lat: 28.6498, lng: 77.3398, eta: '6 min' },
            { name: 'Vasundhara Sector 14', lat: 28.6640, lng: 77.3680, eta: '12 min' },
            { name: 'Hindon River Metro Station', lat: 28.6780, lng: 77.4120, eta: '18 min' },
            { name: 'RKGIT Main Campus Gate', lat: 28.6967, lng: 77.4526, eta: '27 min' }
        ]
    },
    {
        id: 'route_4',
        name: 'Route 4: Dilshad Garden Commuter',
        code: 'DG-04',
        color: '#8b5cf6',
        frequency: '20 mins',
        hours: '06:30 AM – 08:00 PM',
        status: 'At Station',
        stops: [
            { name: 'Dilshad Garden Metro Station', lat: 28.6759, lng: 77.3214, eta: 'At Station' },
            { name: 'Shaheed Nagar Metro', lat: 28.6750, lng: 77.3350, eta: '5 min' },
            { name: 'Rajendra Nagar Metro', lat: 28.6770, lng: 77.3580, eta: '10 min' },
            { name: 'Mohan Nagar Metro Station', lat: 28.6788, lng: 77.3828, eta: '16 min' },
            { name: 'RKGIT Main Campus Gate', lat: 28.6967, lng: 77.4526, eta: '25 min' }
        ]
    }
];

const DEFAULT_BUSES = [
    {
        id: 'bus_101',
        name: 'Campus Express-1',
        busNumber: 'UP-14-BT-101',
        plateNumber: 'UP-14-BT-101',
        routeId: 'route_1',
        routeName: 'Anand Vihar - RKGIT Express',
        driverName: 'Rajesh Sharma',
        capacity: 50,
        currentOccupancy: 32,
        status: 'Active',
        speedKmh: 35,
        currentStopIndex: 1
    },
    {
        id: 'bus_102',
        name: 'Noida Shuttle-02',
        busNumber: 'UP-14-BT-102',
        plateNumber: 'UP-14-BT-102',
        routeId: 'route_2',
        routeName: 'Noida - RKGIT Shuttle',
        driverName: 'Suresh Kumar',
        capacity: 45,
        currentOccupancy: 28,
        status: 'Active',
        speedKmh: 30,
        currentStopIndex: 2
    },
    {
        id: 'bus_103',
        name: 'Vaishali Line-03',
        busNumber: 'UP-14-BT-103',
        plateNumber: 'UP-14-BT-103',
        routeId: 'route_3',
        routeName: 'Vaishali - RKGIT',
        driverName: 'Manoj Verma',
        capacity: 50,
        currentOccupancy: 44,
        status: 'Active',
        speedKmh: 28,
        currentStopIndex: 1
    },
    {
        id: 'bus_104',
        name: 'Dilshad Runner-04',
        busNumber: 'UP-14-BT-104',
        plateNumber: 'UP-14-BT-104',
        routeId: 'route_4',
        routeName: 'Dilshad Garden - RKGIT',
        driverName: 'Dinesh Yadav',
        capacity: 45,
        currentOccupancy: 20,
        status: 'Active',
        speedKmh: 32,
        currentStopIndex: 0
    },
    {
        id: 'bus_105',
        name: 'Ghaziabad Standby-05',
        busNumber: 'UP-14-BT-105',
        plateNumber: 'UP-14-BT-105',
        routeId: null,
        routeName: 'Current Route Unassigned',
        driverName: 'Ramesh Singh',
        capacity: 45,
        currentOccupancy: 0,
        status: 'Inactive',
        speedKmh: 0,
        currentStopIndex: 0
    }
];

const DEFAULT_CHAT = [
    { id: 1, author: 'Alex Chen', role: 'Student', text: 'Campus Express-1 just departed Anand Vihar ISBT, moving on schedule!', time: '2 mins ago', isSelf: false },
    { id: 2, author: 'Priya Sharma', role: 'Student', text: 'Are there seats available on Noida Shuttle-02 towards RKGIT?', time: '4 mins ago', isSelf: false },
    { id: 3, author: 'Rajesh Sharma', role: 'Driver', text: 'Hello riders, Campus Express-1 has ~18 seats available. Approaching Mohan Nagar Metro Station.', time: '5 mins ago', isSelf: false },
    { id: 4, author: 'Aman Verma', role: 'Student', text: 'Thanks driver! Waiting at Mohan Nagar Metro Station.', time: '7 mins ago', isSelf: false }
];

// ── Local Storage Data Store ──
class SmartBusStore {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('smartbus_routes_v4')) {
            localStorage.setItem('smartbus_routes_v4', JSON.stringify(DEFAULT_ROUTES));
        }
        if (!localStorage.getItem('smartbus_buses_v4')) {
            localStorage.setItem('smartbus_buses_v4', JSON.stringify(DEFAULT_BUSES));
        }
        if (!localStorage.getItem('smartbus_chat_v4')) {
            localStorage.setItem('smartbus_chat_v4', JSON.stringify(DEFAULT_CHAT));
        }
    }

    getRoutes() {
        return JSON.parse(localStorage.getItem('smartbus_routes_v4')) || DEFAULT_ROUTES;
    }

    getBuses() {
        return JSON.parse(localStorage.getItem('smartbus_buses_v4')) || DEFAULT_BUSES;
    }

    saveBuses(buses) {
        localStorage.setItem('smartbus_buses_v4', JSON.stringify(buses));
    }

    getChat() {
        return JSON.parse(localStorage.getItem('smartbus_chat_v4')) || DEFAULT_CHAT;
    }

    addChatMessage(msg) {
        const chat = this.getChat();
        chat.push(msg);
        localStorage.setItem('smartbus_chat_v4', JSON.stringify(chat));
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
        this.activeBusMarker = null;
        this.markerAnimFrame = null;
        this.busSimulationTimer = null;
        this.driverActiveTrip = false;
        this.driverWatchId = null;
        this.driverFallbackTimer = null;
        this.lastDriverBroadcastTime = 0;
        this.telemetryChannel = null;
        this.apiPollingTimer = null;
        this.feedMode = 'SIMULATED';
        this.lastLiveTelemetryTime = 0;
        this.currentSimulationWaypointIndex = 0;
        this.simulatedWaypoints = [];
        this.activeBusCurrentCoords = [28.6788, 77.3828]; // Mohan Nagar default
        this.autoFollowBus = true;
        this.currentHeading = 45;

        this.init();
    }

    init() {
        this.initTelemetrySync();
        this.startRemoteTelemetryPolling();
        this.prepareSimulationWaypoints();
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
        this.prepareSimulationWaypoints();
        const routes = this.store.getRoutes();
        const selectedRoute = routes.find(r => r.id === this.currentRouteId) || routes[0];

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
        if (routeCodeEl) routeCodeEl.textContent = selectedRoute.name || 'Route 1: Anand Vihar - RKGIT Express';

        // Update feed badge
        this.updateFeedModeBadge(this.feedMode);

        // Switch to bus-details tab
        this.switchStudentTab('bus-details');

        // Render stop timeline
        this.renderStopsTimeline(bus.currentStopIndex || 1);

        // Update map
        setTimeout(() => {
            this.initInteractiveMap();
            if (this.map) {
                this.map.invalidateSize();
                this.updateInteractiveMap(true);
            }
        }, 120);
    }

    updateTelemetryCard(bus, route) {
        if (!bus || !route) return;
        const stops = route.stops;
        const currentStop = stops[bus.currentStopIndex] || stops[0];

        const etaDestEl = document.getElementById('detail-eta-destination');
        if (etaDestEl) etaDestEl.textContent = 'RKGIT Main Campus (Delhi-Meerut Road)';

        const etaDistEl = document.getElementById('detail-eta-distance');
        if (etaDistEl) {
            if (bus.status === 'Active') {
                if (bus.currentStopIndex === 1) {
                    etaDistEl.textContent = '~3.2 km';
                } else if (bus.currentStopIndex === 2) {
                    etaDistEl.textContent = '~2.4 km';
                } else {
                    const stopsRemaining = Math.max(1, stops.length - 1 - bus.currentStopIndex);
                    etaDistEl.textContent = `~${(stopsRemaining * 1.5).toFixed(1)} km`;
                }
            } else {
                etaDistEl.textContent = '--';
            }
        }

        const etaTimeEl = document.getElementById('detail-eta-time');
        if (etaTimeEl) {
            if (bus.status === 'Active') {
                if (bus.currentStopIndex === 1) {
                    etaTimeEl.textContent = '~8 mins';
                } else if (bus.currentStopIndex === 2) {
                    etaTimeEl.textContent = '~6 mins';
                } else {
                    const stopsRemaining = Math.max(1, stops.length - 1 - bus.currentStopIndex);
                    etaTimeEl.textContent = `~${stopsRemaining * 4} mins`;
                }
            } else {
                etaTimeEl.textContent = 'Standby';
            }
        }

        const etaNextStopEl = document.getElementById('detail-eta-next-stop');
        if (etaNextStopEl) {
            if (bus.status === 'Active') {
                etaNextStopEl.textContent = currentStop.name;
            } else {
                etaNextStopEl.textContent = 'RKGIT Campus Depot';
            }
        }

        const routeCodeEl = document.getElementById('detail-route-code');
        if (routeCodeEl) {
            routeCodeEl.textContent = route.name;
        }
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

    renderStopsTimeline(activeStopIndex = 1) {
        const timelineEl = document.getElementById('student-stops-timeline');
        if (!timelineEl) return;

        const routes = this.store.getRoutes();
        const selectedRoute = routes.find(r => r.id === this.currentRouteId) || routes[0];
        const buses = this.store.getBuses().filter(b => b.routeId === selectedRoute.id);
        const activeBus = buses[0] || { busNumber: 'UP-14-BT-101' };

        timelineEl.innerHTML = `
            <div style="margin-bottom:0.75rem; font-weight:700; font-size:0.9rem; color:var(--text-primary); display:flex; justify-content:space-between; align-items:center;">
                <span>Stops on ${selectedRoute.code}</span>
                <span style="color:var(--accent-primary); font-size:0.8rem;">Bus: ${activeBus.busNumber}</span>
            </div>
            <div class="stop-progress-list">
                ${selectedRoute.stops.map((stop, idx) => {
                    let stepClass = 'is-upcoming';
                    if (idx < activeStopIndex) stepClass = 'is-passed';
                    else if (idx === activeStopIndex) stepClass = 'is-current';

                    return `
                        <div class="stop-step ${stepClass}">
                            <div class="stop-step__marker">${idx + 1}</div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <strong style="font-size:0.875rem; color:var(--text-primary);">${stop.name}</strong>
                                <span style="font-size:0.78rem; font-weight:600; color:${stepClass === 'is-current' ? 'var(--accent-primary)' : 'var(--text-muted)'};">
                                    ${stepClass === 'is-current' ? 'Approaching Now' : (stepClass === 'is-passed' ? 'Departed' : stop.eta)}
                                </span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    highlightActiveStopInTimeline(activeStopIndex) {
        const timelineList = document.querySelectorAll('.stop-progress-list .stop-step');
        if (!timelineList || timelineList.length === 0) return;

        timelineList.forEach((stepEl, idx) => {
            stepEl.classList.remove('is-passed', 'is-current', 'is-upcoming');
            const etaSpan = stepEl.querySelector('span');

            if (idx < activeStopIndex) {
                stepEl.classList.add('is-passed');
                if (etaSpan) {
                    etaSpan.textContent = 'Departed';
                    etaSpan.style.color = 'var(--text-muted)';
                }
            } else if (idx === activeStopIndex) {
                stepEl.classList.add('is-current');
                if (etaSpan) {
                    etaSpan.textContent = 'Approaching Now';
                    etaSpan.style.color = 'var(--accent-primary)';
                }
            } else {
                stepEl.classList.add('is-upcoming');
                if (etaSpan) etaSpan.style.color = 'var(--text-muted)';
            }
        });
    }

    // ── Haversine Distance & Math Engine ──
    calculateHaversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    calculateBearing(lat1, lon1, lat2, lon2) {
        const toRad = Math.PI / 180;
        const toDeg = 180 / Math.PI;
        const phi1 = lat1 * toRad;
        const phi2 = lat2 * toRad;
        const deltaLambda = (lon2 - lon1) * toRad;

        const y = Math.sin(deltaLambda) * Math.cos(phi2);
        const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
        const theta = Math.atan2(y, x);
        return (theta * toDeg + 360) % 360;
    }

    prepareSimulationWaypoints() {
        const routes = this.store.getRoutes();
        const selectedRoute = routes.find(r => r.id === this.currentRouteId) || routes[0];
        const stops = selectedRoute.stops;

        this.simulatedWaypoints = [];
        const pointsPerSegment = 10;

        for (let i = 0; i < stops.length - 1; i++) {
            const start = stops[i];
            const end = stops[i + 1];
            for (let j = 0; j < pointsPerSegment; j++) {
                const frac = j / pointsPerSegment;
                const lat = start.lat + (end.lat - start.lat) * frac;
                const lng = start.lng + (end.lng - start.lng) * frac;
                this.simulatedWaypoints.push({
                    lat: lat,
                    lng: lng,
                    fromStopIndex: i,
                    nextStopIndex: i + 1,
                    speedKmh: Math.floor(28 + Math.sin(j * 0.8) * 8)
                });
            }
        }

        // Add campus final stop with 3 extra pause ticks
        const finalStop = stops[stops.length - 1];
        for (let p = 0; p < 3; p++) {
            this.simulatedWaypoints.push({
                lat: finalStop.lat,
                lng: finalStop.lng,
                fromStopIndex: stops.length - 2,
                nextStopIndex: stops.length - 1,
                speedKmh: 0,
                isDepot: true
            });
        }
    }

    // ── Telemetry Channel & Real-Time Sync (Cross-Device & Cross-Tab) ──
    initTelemetrySync() {
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                this.telemetryChannel = new BroadcastChannel('smartbus_telemetry_channel');
                this.telemetryChannel.onmessage = (event) => {
                    this.onTelemetryReceived(event.data);
                };
            } catch (e) {
                console.warn('BroadcastChannel error:', e);
            }
        }

        // Cross-tab sync via localStorage 'storage' event
        window.addEventListener('storage', (e) => {
            if (e.key === 'smartbus_live_telemetry' && e.newValue) {
                try {
                    const data = JSON.parse(e.newValue);
                    this.onTelemetryReceived(data);
                } catch (err) {}
            }
        });

        // Initial check for existing active telemetry in localStorage
        try {
            const saved = localStorage.getItem('smartbus_live_telemetry');
            if (saved) {
                const data = JSON.parse(saved);
                if (data && data.isLive && Date.now() - data.timestamp < 15000) {
                    this.onTelemetryReceived(data);
                }
            }
        } catch (err) {}
    }

    startRemoteTelemetryPolling() {
        if (this.apiPollingTimer) clearInterval(this.apiPollingTimer);

        this.apiPollingTimer = setInterval(async () => {
            if (document.hidden) return;

            try {
                const res = await fetch(`/api/telemetry?busId=${this.currentRouteId || 'bus_101'}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.success && data.telemetry) {
                        const t = data.telemetry;
                        if (t.isLive && Date.now() - t.timestamp < 15000) {
                            this.onTelemetryReceived(t);
                        }
                    }
                }
            } catch (e) {
                // Ignore transient network errors
            }
        }, 2500);
    }

    broadcastDriverLocation(payload) {
        this.broadcastTelemetry(payload);
    }

    broadcastTelemetry(payload) {
        // 1. BroadcastChannel API for same-browser tabs
        if (this.telemetryChannel) {
            try {
                this.telemetryChannel.postMessage(payload);
            } catch (e) {}
        }

        // 2. localStorage for cross-window / tab persistence
        try {
            localStorage.setItem('smartbus_live_telemetry', JSON.stringify(payload));
        } catch (e) {}

        // 3. Local callback to self
        this.onTelemetryReceived(payload);

        // 4. Remote Serverless API sync (cross-device over internet)
        if (typeof fetch !== 'undefined') {
            try {
                fetch('/api/telemetry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).catch(() => {});
            } catch (e) {}
        }
    }

    onTelemetryReceived(data) {
        if (!data) return;

        if (data.isLive && Date.now() - data.timestamp < 15000) {
            // Live broadcast active from driver!
            this.feedMode = 'LIVE';
            this.lastLiveTelemetryTime = data.timestamp || Date.now();
            this.updateFeedModeBadge('LIVE');

            // Hide simulate button if visible
            const btnSim = document.getElementById('btn-toggle-sim');
            if (btnSim) btnSim.style.display = 'none';

            // Convert speed if in m/s (meters per second) or km/h
            let speedKmh = 30;
            if (data.speedKmh != null) {
                speedKmh = data.speedKmh;
            } else if (data.speed != null) {
                speedKmh = Math.round(data.speed * 3.6);
            }

            // Update bus position smoothly
            this.updateBusLocationOnMap([data.lat, data.lng], speedKmh, true, null, data.heading);
        } else if (!data.isLive) {
            // Driver ended trip
            if (this.feedMode === 'LIVE') {
                this.feedMode = 'STALE';
                this.updateFeedModeBadge('STALE');
            }
        }
    }

    updateFeedModeBadge(mode) {
        const badgeEl = document.getElementById('map-feed-mode-badge');
        const textEl = document.getElementById('feed-mode-text');
        const btnSim = document.getElementById('btn-toggle-sim');
        if (!badgeEl || !textEl) return;

        if (mode === 'LIVE') {
            badgeEl.className = 'map-feed-badge feed-live';
            textEl.textContent = '🟢 Live GPS Feed';
            if (btnSim) btnSim.style.display = 'none';
        } else if (mode === 'STALE') {
            badgeEl.className = 'map-feed-badge feed-stale';
            textEl.textContent = '⚠️ Driver signal paused / GPS lost';
            if (btnSim) btnSim.style.display = 'inline-flex';
        } else {
            badgeEl.className = 'map-feed-badge feed-simulated';
            textEl.textContent = '🟡 Simulated Telemetry';
            if (btnSim) btnSim.style.display = 'none';
        }
    }

    enableSimulatedMovement() {
        this.feedMode = 'SIMULATED';
        this.updateFeedModeBadge('SIMULATED');
        this.currentSimulationWaypointIndex = 0;
        this.showToast('Simulated movement enabled for testing.', 'info');
    }

    // ── Interactive Leaflet Map & Smooth Consumer ──
    initInteractiveMap() {
        const mapContainer = document.getElementById('live-map-container');
        if (!mapContainer) return;

        if (this.map) {
            this.map.invalidateSize();
            this.updateInteractiveMap();
            return;
        }

        // Initialize Leaflet Map centered at RKGIT Campus (5KM Stone, Delhi-Meerut Road, Ghaziabad)
        if (typeof L !== 'undefined') {
            this.map = L.map('live-map-container', {
                zoomControl: true,
                attributionControl: true
            }).setView([28.6967, 77.4526], 13);

            // Keyless OpenStreetMap tiles (100% English labels, zero watermarks)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                subdomains: ['a', 'b', 'c'],
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
            }).addTo(this.map);

            // Pause auto-follow if user drags map manually
            this.map.on('dragstart', () => {
                if (this.autoFollowBus) {
                    this.autoFollowBus = false;
                    const chk = document.getElementById('toggle-auto-follow');
                    if (chk) chk.checked = false;
                    const label = document.getElementById('auto-follow-label-text');
                    if (label) label.textContent = 'Auto-Follow (Off)';
                }
            });

            this.updateInteractiveMap(true);
        }
    }

    updateInteractiveMap(fitBounds = false) {
        if (!this.map || typeof L === 'undefined') return;

        // Clear existing static markers & polyline
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
            const isCampus = idx === (stops.length - 1) || s.name.toLowerCase().includes('rkgit');
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

        if (fitBounds && this.mapRouteLine) {
            this.map.fitBounds(this.mapRouteLine.getBounds(), { padding: [40, 40] });
        }

        // Add or re-position active bus marker
        const initialCoords = this.activeBusCurrentCoords || [stops[0].lat, stops[0].lng];
        this.updateBusLocationOnMap(initialCoords, 32, this.feedMode === 'LIVE');
    }

    updateBusLocationOnMap(coords, speedKmh = 30, isLive = false, overrideNextStopIndex = null, heading = null) {
        if (!coords || !coords[0] || !coords[1]) return;
        const prevCoords = this.activeBusCurrentCoords || coords;
        this.activeBusCurrentCoords = coords;

        // Calculate heading / bearing
        if (heading != null && !isNaN(heading) && heading > 0) {
            this.currentHeading = heading;
        } else if (prevCoords[0] !== coords[0] || prevCoords[1] !== coords[1]) {
            this.currentHeading = this.calculateBearing(prevCoords[0], prevCoords[1], coords[0], coords[1]);
        }

        const routes = this.store.getRoutes();
        const selectedRoute = routes.find(r => r.id === this.currentRouteId) || routes[0];
        const stops = selectedRoute.stops;

        // Animate marker on Leaflet map if map is rendered
        if (this.map && typeof L !== 'undefined') {
            if (!this.activeBusMarker) {
                const busIconHtml = `
                    <div style="background:#3b82f6; color:#fff; width:40px; height:40px; border-radius:50%; border:3px solid #fff; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 0 20px rgba(59,130,246,0.8); animation:pulse 1.8s infinite;">
                        <div id="bus-marker-rotator" class="bus-marker-rotator" style="transform: rotate(${Math.round(this.currentHeading)}deg);">
                            🚌
                        </div>
                    </div>
                `;
                const busIcon = L.divIcon({
                    html: busIconHtml,
                    className: 'custom-bus-icon',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                });
                this.activeBusMarker = L.marker([coords[0], coords[1]], { icon: busIcon }).addTo(this.map);
            } else {
                this.animateMarkerTo(coords, 1800);
                const rotator = document.getElementById('bus-marker-rotator');
                if (rotator) {
                    rotator.style.transform = `rotate(${Math.round(this.currentHeading)}deg)`;
                }
            }

            // Auto-follow pan
            if (this.autoFollowBus) {
                this.map.panTo(coords, { animate: true, duration: 0.8 });
            }
        }

        // Calculate Next Approaching Stop & Distances
        let nextStopIndex = overrideNextStopIndex;
        if (nextStopIndex == null) {
            let minDistance = Infinity;
            let closestIdx = 0;
            for (let i = 0; i < stops.length; i++) {
                const d = this.calculateHaversineDistance(coords[0], coords[1], stops[i].lat, stops[i].lng);
                if (d < minDistance) {
                    minDistance = d;
                    closestIdx = i;
                }
            }
            if (minDistance < 0.2 && closestIdx < stops.length - 1) {
                nextStopIndex = closestIdx + 1;
            } else {
                nextStopIndex = closestIdx;
            }
        }

        const currentTargetStop = stops[nextStopIndex] || stops[stops.length - 1];

        // Haversine distance to next stop
        const distanceToNextKm = this.calculateHaversineDistance(coords[0], coords[1], currentTargetStop.lat, currentTargetStop.lng);

        // Sum distance along remaining route path to RKGIT Campus Gate
        let distanceToCampusKm = distanceToNextKm;
        for (let k = nextStopIndex; k < stops.length - 1; k++) {
            distanceToCampusKm += this.calculateHaversineDistance(stops[k].lat, stops[k].lng, stops[k + 1].lat, stops[k + 1].lng);
        }

        // Dynamic ETA calculation:
        // ETA (minutes) = (Distance remaining (km) / max(Speed (km/h), 15)) * 60
        const effectiveSpeed = Math.max(speedKmh || 0, 15);
        const etaMinutes = Math.max(1, Math.round((distanceToCampusKm / effectiveSpeed) * 60));

        // Update telemetry card
        const destEl = document.getElementById('detail-eta-destination');
        if (destEl) destEl.textContent = 'RKGIT Main Campus (Delhi-Meerut Road)';

        const distEl = document.getElementById('detail-eta-distance');
        if (distEl) {
            distEl.textContent = distanceToCampusKm < 0.2 ? '0.1 km (At Gate)' : `~${distanceToCampusKm.toFixed(1)} km`;
        }

        const timeEl = document.getElementById('detail-eta-time');
        if (timeEl) {
            timeEl.textContent = distanceToCampusKm < 0.2 ? 'Arrived' : `~${etaMinutes} mins`;
        }

        const nextStopEl = document.getElementById('detail-eta-next-stop');
        if (nextStopEl) {
            nextStopEl.textContent = distanceToNextKm < 0.15 ? `At ${currentTargetStop.name}` : currentTargetStop.name;
        }

        const routeCodeEl = document.getElementById('detail-route-code');
        if (routeCodeEl) routeCodeEl.textContent = selectedRoute.name;

        // Update popup on bus marker
        if (this.activeBusMarker) {
            this.activeBusMarker.bindPopup(`
                <div style="font-family:sans-serif; padding:6px; min-width:150px;">
                    <div style="font-size:13px; font-weight:800; color:#1e293b;">UP-14-BT-101</div>
                    <div style="font-size:11px; color:${isLive ? '#10b981' : '#f59e0b'}; font-weight:700;">
                        ${isLive ? '🟢 Live GPS Feed' : '🟡 Simulated Telemetry'}
                    </div>
                    <div style="font-size:11px; color:#475569; margin-top:4px;">Approaching: <strong>${currentTargetStop.name}</strong></div>
                    <div style="font-size:11px; color:#475569;">Speed: <strong>${speedKmh} km/h</strong></div>
                    <div style="font-size:11px; color:#475569;">Heading: <strong>${Math.round(this.currentHeading)}°</strong></div>
                    <div style="font-size:11px; color:#475569;">Distance to Campus: <strong>${distanceToCampusKm.toFixed(1)} km</strong></div>
                </div>
            `);
        }

        // Highlight active stop in the progress timeline
        this.highlightActiveStopInTimeline(nextStopIndex);
    }

    animateMarkerTo(targetCoords, durationMs = 1800) {
        if (!this.activeBusMarker) return;
        if (this.markerAnimFrame) {
            cancelAnimationFrame(this.markerAnimFrame);
            this.markerAnimFrame = null;
        }

        const startLatLng = this.activeBusMarker.getLatLng();
        const startLat = startLatLng.lat;
        const startLng = startLatLng.lng;
        const targetLat = targetCoords[0];
        const targetLng = targetCoords[1];

        // If delta is negligible, snap and return
        if (Math.abs(startLat - targetLat) < 0.000005 && Math.abs(startLng - targetLng) < 0.000005) {
            this.activeBusMarker.setLatLng([targetLat, targetLng]);
            return;
        }

        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / durationMs, 1);

            // Smooth easeInOutQuad
            const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const curLat = startLat + (targetLat - startLat) * ease;
            const curLng = startLng + (targetLng - startLng) * ease;

            this.activeBusMarker.setLatLng([curLat, curLng]);

            if (progress < 1) {
                this.markerAnimFrame = requestAnimationFrame(step);
            } else {
                this.markerAnimFrame = null;
            }
        };

        this.markerAnimFrame = requestAnimationFrame(step);
    }

    recenterOnBus() {
        if (!this.map) return;
        this.autoFollowBus = true;
        const chk = document.getElementById('toggle-auto-follow');
        if (chk) chk.checked = true;
        const label = document.getElementById('auto-follow-label-text');
        if (label) label.textContent = 'Auto-Follow';

        if (this.activeBusMarker) {
            const pos = this.activeBusMarker.getLatLng();
            this.map.panTo(pos, { animate: true, duration: 0.8 });
            this.showToast('Centered on active bus (Auto-follow resumed)', 'info');
        } else if (this.activeBusCurrentCoords) {
            this.map.panTo(this.activeBusCurrentCoords, { animate: true, duration: 0.8 });
        }
    }

    startBusSimulation() {
        if (this.busSimulationTimer) clearInterval(this.busSimulationTimer);

        // Advance simulation or check stale every 2000ms
        this.busSimulationTimer = setInterval(() => {
            const now = Date.now();

            if (this.feedMode === 'LIVE') {
                const elapsed = now - this.lastLiveTelemetryTime;
                if (elapsed > 15000) {
                    // Stale connection (> 15 seconds without GPS updates)
                    this.feedMode = 'STALE';
                    this.updateFeedModeBadge('STALE');
                }
                return;
            }

            if (this.feedMode === 'STALE') {
                // Waiting for driver to resume or student to click "Enable Simulated Movement"
                return;
            }

            // SIMULATED mode
            if (!this.simulatedWaypoints || this.simulatedWaypoints.length === 0) {
                this.prepareSimulationWaypoints();
            }

            // Advance waypoint index
            this.currentSimulationWaypointIndex = (this.currentSimulationWaypointIndex + 1) % this.simulatedWaypoints.length;
            const wp = this.simulatedWaypoints[this.currentSimulationWaypointIndex];

            // Only update UI if student dashboard is visible
            const studentView = document.getElementById('view-student');
            if (studentView && studentView.style.display !== 'none') {
                this.updateBusLocationOnMap([wp.lat, wp.lng], wp.speedKmh, false, wp.nextStopIndex);
            }
        }, 2000);
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

    // ── Driver Trip Controller & Geolocation Broadcaster ──
    renderDriverController() {
        const busNumEl = document.getElementById('driver-assigned-bus-number');
        const plateEl = document.getElementById('driver-assigned-plate');
        const routeSelect = document.getElementById('driver-route-select');
        const passCountEl = document.getElementById('driver-passenger-count');
        const stopNameEl = document.getElementById('driver-current-stop-name');
        const statusBadgeEl = document.getElementById('driver-trip-status-badge');
        const gpsPillEl = document.getElementById('driver-gps-pill');
        const startBtn = document.getElementById('btn-driver-start');

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
            statusBadgeEl.textContent = this.driverActiveTrip ? 'TRIP IN PROGRESS' : 'STANDBY';
            statusBadgeEl.className = `badge-status ${this.driverActiveTrip ? 'badge-status--active' : 'badge-status--idle'}`;
        }

        if (gpsPillEl) {
            if (this.driverActiveTrip) {
                gpsPillEl.className = 'badge-status badge-status--active';
                gpsPillEl.style.display = 'inline-flex';
                gpsPillEl.style.alignItems = 'center';
                gpsPillEl.style.gap = '6px';
                gpsPillEl.style.background = 'rgba(16,185,129,0.2)';
                gpsPillEl.style.color = '#10b981';
                gpsPillEl.style.border = '1px solid #10b981';
                gpsPillEl.innerHTML = '<span class="pulse-dot"></span> 📡 Transmitting Live GPS';
            } else {
                gpsPillEl.className = 'badge-status badge-status--idle';
                gpsPillEl.style.display = 'inline-block';
                gpsPillEl.style.background = '';
                gpsPillEl.style.color = '';
                gpsPillEl.style.border = '';
                gpsPillEl.textContent = '⚪ GPS Standby';
            }
        }

        if (startBtn) {
            if (this.driverActiveTrip) {
                startBtn.innerHTML = '<span>⏹</span> Stop Trip';
                startBtn.classList.add('is-active');
            } else {
                startBtn.innerHTML = '<span>▶</span> Start Trip / Broadcast Live GPS';
                startBtn.classList.remove('is-active');
            }
        }
    }

    driverStartTrip() {
        if (this.driverActiveTrip) {
            this.driverCompleteTrip();
            return;
        }

        const buses = this.store.getBuses();
        const bus = buses[0];
        bus.status = 'Active';
        this.store.saveBuses(buses);

        this.driverActiveTrip = true;
        this.showToast('Trip started! Broadcasting live GPS coordinates.', 'success');
        this.renderDriverController();

        this.startDriverGeolocation(bus);
    }

    startDriverGeolocation(bus) {
        if (this.driverWatchId != null) {
            navigator.geolocation.clearWatch(this.driverWatchId);
            this.driverWatchId = null;
        }

        if ('geolocation' in navigator) {
            this.lastDriverBroadcastTime = 0;
            this.driverWatchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const now = Date.now();
                    // Debounce/throttle network updates every 2-3 seconds
                    if (now - this.lastDriverBroadcastTime < 2000) return;
                    this.lastDriverBroadcastTime = now;

                    const { latitude, longitude, speed, heading, accuracy } = pos.coords;
                    const speedKmh = speed ? Math.round(speed * 3.6) : 32;

                    const payload = {
                        busId: bus.id,
                        busNumber: bus.busNumber,
                        routeId: bus.routeId || this.currentRouteId,
                        lat: latitude,
                        lng: longitude,
                        speed: speed || 0,
                        speedKmh: speedKmh,
                        heading: heading || 0,
                        accuracy: Math.round(accuracy || 8),
                        isLive: true,
                        timestamp: now
                    };

                    this.broadcastDriverLocation(payload);

                    const displayEl = document.getElementById('driver-gps-coords-display');
                    if (displayEl) {
                        displayEl.textContent = `📡 Live GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} • Speed: ${speedKmh} km/h • Heading: ${Math.round(heading || 0)}°`;
                    }
                },
                (err) => {
                    console.warn('Geolocation error:', err);
                    this.showToast(`GPS Notice: ${err.message}. Activating simulated route broadcaster.`, 'warning');
                    this.startDriverFallbackBroadcaster(bus);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000
                }
            );
        } else {
            this.showToast('Geolocation not supported on this device. Using route simulation broadcaster.', 'warning');
            this.startDriverFallbackBroadcaster(bus);
        }
    }

    startDriverFallbackBroadcaster(bus) {
        if (this.driverFallbackTimer != null) clearInterval(this.driverFallbackTimer);

        const routes = this.store.getRoutes();
        const route = routes.find(r => r.id === (bus.routeId || this.currentRouteId)) || routes[0];
        let waypointIdx = 0;

        // Generate fine-grained waypoints along route
        const waypoints = [];
        for (let i = 0; i < route.stops.length - 1; i++) {
            const from = route.stops[i];
            const to = route.stops[i + 1];
            for (let j = 0; j < 10; j++) {
                const frac = j / 10;
                waypoints.push({
                    lat: from.lat + (to.lat - from.lat) * frac,
                    lng: from.lng + (to.lng - from.lng) * frac,
                    nextStop: to.name,
                    speed: 30 + Math.floor(Math.sin(j) * 5)
                });
            }
        }

        this.driverFallbackTimer = setInterval(() => {
            if (!this.driverActiveTrip) {
                clearInterval(this.driverFallbackTimer);
                return;
            }

            waypointIdx = (waypointIdx + 1) % waypoints.length;
            const wp = waypoints[waypointIdx];
            const now = Date.now();

            const payload = {
                busId: bus.id,
                busNumber: bus.busNumber,
                routeId: route.id,
                lat: wp.lat,
                lng: wp.lng,
                speed: wp.speed / 3.6,
                speedKmh: wp.speed,
                heading: 45,
                accuracy: 5,
                isLive: true,
                timestamp: now
            };

            this.broadcastDriverLocation(payload);

            const displayEl = document.getElementById('driver-gps-coords-display');
            if (displayEl) {
                displayEl.textContent = `📡 Broadcasting: ${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)} • Speed: ${wp.speed} km/h • Next: ${wp.nextStop}`;
            }
        }, 2500);
    }

    driverNextStop() {
        const buses = this.store.getBuses();
        const bus = buses[0];
        const routes = this.store.getRoutes();
        const route = routes.find(r => r.id === bus.routeId) || routes[0];

        bus.currentStopIndex = (bus.currentStopIndex + 1) % route.stops.length;
        const delta = Math.floor(Math.random() * 7) - 3;
        bus.currentOccupancy = Math.max(0, Math.min(bus.capacity, bus.currentOccupancy + delta));
        
        this.store.saveBuses(buses);
        const nextStop = route.stops[bus.currentStopIndex];
        this.showToast(`Arrived at next stop: ${nextStop.name}`, 'success');
        this.renderDriverController();
    }

    driverCompleteTrip() {
        this.driverActiveTrip = false;

        if (this.driverWatchId != null) {
            navigator.geolocation.clearWatch(this.driverWatchId);
            this.driverWatchId = null;
        }

        if (this.driverFallbackTimer != null) {
            clearInterval(this.driverFallbackTimer);
            this.driverFallbackTimer = null;
        }

        const buses = this.store.getBuses();
        const bus = buses[0];
        bus.status = 'Idle';
        bus.speedKmh = 0;
        this.store.saveBuses(buses);

        // Notify subscribers that live broadcast ended
        this.broadcastDriverLocation({
            busId: bus.id,
            isLive: false,
            timestamp: Date.now()
        });
        try {
            localStorage.removeItem('smartbus_live_telemetry');
        } catch (e) {}

        const displayEl = document.getElementById('driver-gps-coords-display');
        if (displayEl) {
            displayEl.textContent = 'GPS Broadcast: Inactive • Click "Start Trip / Broadcast Live GPS" to transmit';
        }

        this.showToast('Trip completed. Live GPS transmission stopped.', 'info');
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
            user = { id: 'usr_demo_driver', name: 'Rajesh Sharma', email: 'driver@rkgit.edu', role: 'driver' };
        } else if (role === 'admin') {
            user = { id: 'usr_demo_admin', name: 'Sarah Jenkins', email: 'admin@rkgit.edu', role: 'admin' };
        } else {
            user = { id: 'usr_demo_student', name: 'Alex Chen', email: 'student@rkgit.edu', role: 'student' };
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
        this.showToast(`Account created! Welcome to SmartBus, ${user.name}.`, 'success');
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

        // Recenter Map on Bus Action
        document.getElementById('btn-recenter-bus')?.addEventListener('click', () => this.recenterOnBus());

        // Auto-Follow Toggle & Enable Simulated Movement
        document.getElementById('toggle-auto-follow')?.addEventListener('change', (e) => {
            this.autoFollowBus = e.target.checked;
            const label = document.getElementById('auto-follow-label-text');
            if (label) label.textContent = this.autoFollowBus ? 'Auto-Follow' : 'Auto-Follow (Off)';
            if (this.autoFollowBus && this.activeBusCurrentCoords && this.map) {
                this.map.panTo(this.activeBusCurrentCoords, { animate: true, duration: 0.8 });
            }
        });

        document.getElementById('btn-toggle-sim')?.addEventListener('click', () => {
            this.enableSimulatedMovement();
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
