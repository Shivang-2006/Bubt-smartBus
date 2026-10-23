// ========================================
// Smart Campus Bus — API Service
// ========================================

import { auth } from "./firebase-config.js";

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
export const API_BASE_URL = isLocalhost 
    ? "http://localhost:5196/api" 
    : "https://smart-campus-bus-api.onrender.com/api";

export class ApiService {
    /**
     * Gets the Firebase ID Token for the currently logged in user.
     * @returns {Promise<string>} The JWT token
     */
    static async getToken() {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User is not authenticated");
        }
        return await user.getIdToken();
    }

    /**
     * Makes an authenticated fetch request to the backend API.
     * @param {string} endpoint - The API endpoint (e.g., '/Bus')
     * @param {object} options - Fetch options (method, body, etc.)
     * @returns {Promise<any>} The parsed JSON response
     */
    static async fetchWithAuth(endpoint, options = {}) {
        const token = await this.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        const config = {
            ...options,
            headers
        };

        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, config);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (err) {
                errorData = { message: response.statusText };
            }
            throw new Error(errorData.message || 'API request failed');
        }

        // Some endpoints (like DELETE) might not return a JSON body or return 204
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }
}
