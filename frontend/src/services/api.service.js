import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: { 'Content-Type': 'application/json' }
});

const biometricApi = axios.create({
    baseURL: 'http://localhost:8000',
    headers: { 'Content-Type': 'application/json' }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (e.g., redirect to login)
            // localStorage.removeItem('token');
            // window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

export const apiService = {
    // Dashboard Stats
    getDashboardStats: () => api.get('/api/dashboard/stats'),

    // Logs
    getLogs: (params) => api.get('/api/logs', { params }),

    // Users
    getUsers: () => api.get('/api/users'),
    createUser: (userData) => api.post('/api/users', userData),

    // Devices
    getDevices: () => api.get('/api/devices'),
    unlockDevice: (deviceId) => api.post(`/api/devices/${deviceId}/unlock`),

    // Biometrics
    registerFace: (imageBlob, employeeId, email) => {
        const formData = new FormData();
        formData.append('file', imageBlob, 'capture.jpg');
        formData.append('employeeId', employeeId);
        formData.append('email', email);

        console.log(`📤 Registering face for ${employeeId} to Biometric API...`);
        return biometricApi.post('/api/biometrics/face/register', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    enrollFingerprint: () => api.post('/api/biometrics/fingerprint/enroll'),

    // Terminal / Verification
    verifyFace: (imageBlob) => {
        const formData = new FormData();
        formData.append('file', imageBlob, 'verify.jpg');

        console.log("🔍 Sending live frame to Biometric API for verification...");
        return biometricApi.post('/api/biometrics/face/verify', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
};
