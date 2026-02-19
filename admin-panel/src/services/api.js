import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    }
});

export const apiService = {
    // Face Registration
    registerFace: async (formData) => {
        const response = await api.post('/face/register', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Users
    getUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    // Logs
    getLogs: async () => {
        const response = await api.get('/logs');
        return response.data;
    }
};

export default api;
