import api from './api';

const symptomService = {
    checkSymptoms: async (query) => {
        try {
            const response = await api.post('/symptoms/check', { query });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getHistory: async () => {
        try {
            const response = await api.get('/symptoms/history');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default symptomService;
