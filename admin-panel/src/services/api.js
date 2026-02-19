import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Inject token into every request if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('aura_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const apiService = {
    // Auth
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('aura_token', response.data.token);
            localStorage.setItem('aura_user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('aura_token');
        localStorage.removeItem('aura_user');
        window.location.href = '/login';
    },

    // Face Registration
    registerFace: async (formData) => {
        const response = await api.post('/api/face/register', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Users
    getUsers: async () => {
        const response = await api.get('/api/users');
        return response.data;
    },

    // Logs
    getLogs: async () => {
        const response = await api.get('/api/logs');
        return response.data;
    }
};

export default api;
