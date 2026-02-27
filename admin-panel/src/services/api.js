import axios from 'axios';

const api = axios.create({
    baseURL: '/', // Use Vite Proxy
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
    registerFace: async (imageBlob, employeeId, email, name) => {
        const formData = new FormData();
        formData.append('file', imageBlob, 'register.jpg');
        formData.append('employeeId', employeeId);
        formData.append('email', email);
        if (name) formData.append('name', name);

        console.log(`📤 Sending face registration for: ${employeeId}`);
        const response = await api.post('/api/biometrics/face/register', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Employees
    createEmployee: async (employeeData) => {
        const response = await api.post('/api/users', employeeData);
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
