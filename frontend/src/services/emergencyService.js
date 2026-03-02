import api from './api';

const emergencyService = {
    createSOS: async (location) => {
        try {
            const response = await api.post('/emergency/sos', { location });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getHistory: async () => {
        try {
            const response = await api.get('/emergency/history');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    resolveEmergency: async (id) => {
        try {
            const response = await api.put(`/emergency/${id}/resolve`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default emergencyService;
