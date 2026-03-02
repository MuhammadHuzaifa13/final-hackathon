import api from './api';

const medicationService = {
    getMedications: async () => {
        try {
            const response = await api.get('/medications');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    addMedication: async (medicationData) => {
        try {
            const response = await api.post('/medications', medicationData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateMedication: async (id, medicationData) => {
        try {
            const response = await api.put(`/medications/${id}`, medicationData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    trackAdherence: async (id, trackingData) => {
        try {
            const response = await api.post(`/medications/${id}/track`, trackingData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteMedication: async (id) => {
        try {
            const response = await api.delete(`/medications/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default medicationService;
