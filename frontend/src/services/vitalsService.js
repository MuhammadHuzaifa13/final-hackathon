import api from './api';

const vitalsService = {
    getVitals: async (type = '', limit = 100) => {
        try {
            const response = await api.get('/vitals', { params: { type, limit } });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getLatestVitals: async () => {
        try {
            const response = await api.get('/vitals/latest');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    addVitals: async (vitalsData) => {
        try {
            const response = await api.post('/vitals', vitalsData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteVitals: async (id) => {
        try {
            const response = await api.delete(`/vitals/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default vitalsService;
