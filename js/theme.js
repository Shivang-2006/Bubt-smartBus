// ========================================
// Smart Campus Bus — Theme Toggle
// ========================================

(function () {
    // Check saved theme or default to system preference
    const savedTheme = localStorage.getItem('scb-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('scb-theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });

    // Global toggle function
    window.toggleTheme = function () {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('scb-theme', next);

        // Update toggle button icon if present
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            btn.textContent = next === 'dark' ? '☀️' : '🌙';
        }
    };

    // Set icon on load
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            const theme = document.documentElement.getAttribute('data-theme') || 'light';
            btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    });
})();
