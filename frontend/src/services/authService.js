import axios from 'axios';

// API URL Base
const API_URL = '/api/v1/auth';

const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    // Backend returns Token (capital T) and User (capital U) — normalize to lowercase for consistency
    const rawData = response.data;
    const token = rawData.token || rawData.Token;
    const user = rawData.user || rawData.User;
    if (token) {
        const normalized = { token, user };
        localStorage.setItem('dms_user', JSON.stringify(normalized));
        setupAxiosInterceptors(token);
    }
    return response.data;
};

const invite = async (userData) => {
    const response = await axios.post(`${API_URL}/invite`, userData);
    return response.data;
};

const register = async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
};

const createUser = async (userData) => {
    const response = await axios.post('/api/v1/users/create', userData);
    return response.data;
};

const setPassword = async (token, password, confirmPassword) => {
    const response = await axios.post(`${API_URL}/set-password`, { token, password, confirmPassword });
    return response.data;
};

const approveUser = async (username) => {
    const response = await axios.post(`${API_URL}/${username}/approve`);
    return response.data;
};

const rejectUser = async (username) => {
    const response = await axios.post(`${API_URL}/${username}/reject`);
    return response.data;
};

const getUsers = async () => {
    // Requires authentication token (handled by interceptor)
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
};

const getRoles = async () => {
    // Requires authentication token (handled by interceptor)
    const response = await axios.get('/api/v1/roles');
    return response.data;
};

const updateUser = async (username, userData) => {
    const response = await axios.put(`${API_URL}/${username}`, userData);
    return response.data;
};

const toggleUserStatus = async (username) => {
    const response = await axios.post(`${API_URL}/${username}/toggle-status`);
    return response.data;
};

const resetPassword = async (username, newPassword) => {
    const response = await axios.post(`${API_URL}/${username}/reset-password`, { newPassword });
    return response.data;
};

const assignRole = async (username, newRole) => {
    const response = await axios.post(`${API_URL}/${username}/role`, { newRole });
    return response.data;
};

const getUserActivity = async (username) => {
    const response = await axios.get(`${API_URL}/${username}/activity`);
    return response.data;
};

const deleteUser = async (username) => {
    // Requires authentication token (handled by interceptor)
    const response = await axios.delete(`${API_URL}/${username}`);
    return response.data;
};

const logout = () => {
    localStorage.removeItem('dms_user');
    window.location.href = '/login';
};

const getCurrentUser = () => {
    const stored = localStorage.getItem('dms_user');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Normalize: handle both Token (capital) and token (lowercase) from older sessions
    if (parsed.Token && !parsed.token) {
        parsed.token = parsed.Token;
        delete parsed.Token;
    }
    if (parsed.User && !parsed.user) {
        parsed.user = parsed.User;
        delete parsed.User;
    }
    return parsed;
};

// Helper to decode JWT token
const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

const hasPermission = (permissionString) => {
    const user = getCurrentUser();
    if (!user || !user.token) return false;

    // Admin role bypasses all permission checks
    const role = user.user?.role || user.user?.Role;
    if (role === 'Admin') return true;

    const decoded = decodeToken(user.token);
    if (!decoded) return false;

    // Handle Permissions as comma-separated string (how backend encodes it)
    const rawPerms = decoded.Permissions || decoded.permissions || '';
    if (!rawPerms) return false;

    const permissions = rawPerms.split(',').map(p => p.trim()).filter(Boolean);
    return permissions.includes(permissionString);
};

let _interceptorsSetUp = false;

const setupAxiosInterceptors = (token) => {
    // Eject previous interceptors to prevent duplicate registration
    if (setupAxiosInterceptors._reqId !== undefined) {
        axios.interceptors.request.eject(setupAxiosInterceptors._reqId);
    }
    if (setupAxiosInterceptors._resId !== undefined) {
        axios.interceptors.response.eject(setupAxiosInterceptors._resId);
    }

    setupAxiosInterceptors._reqId = axios.interceptors.request.use(
        (config) => {
            // Always read fresh token from localStorage so it updates after re-login
            const currentUser = localStorage.getItem('dms_user');
            const freshToken = currentUser ? JSON.parse(currentUser)?.token : null;
            const activeToken = freshToken || token;
            if (activeToken) {
                config.headers['Authorization'] = `Bearer ${activeToken}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Global interceptor for 401 Unauthorized - auto-logout only on non-login pages
    setupAxiosInterceptors._resId = axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                const onLoginPage = window.location.pathname === '/login';
                if (!onLoginPage) {
                    logout(); // Auto logout on token expiry
                }
            }
            return Promise.reject(error);
        }
    );
};

// Initialize interceptor on load if logged in
const user = getCurrentUser();
if (user?.token) {
    setupAxiosInterceptors(user.token);
}

export default {
    login,
    invite,
    setPassword,
    approveUser,
    rejectUser,
    logout,
    getCurrentUser,
    getUsers,
    getRoles,
    updateUser,
    toggleUserStatus,
    resetPassword,
    assignRole,
    getUserActivity,
    deleteUser,
    hasPermission, // Expose permission checker
    register,
    createUser
};
