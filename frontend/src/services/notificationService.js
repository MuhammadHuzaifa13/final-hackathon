import api from './api';

const notificationService = {
    getNotifications: async () => {
        try {
            const response = await api.get('/notifications');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    markAsRead: async (id) => {
        try {
            const response = await api.put(`/notifications/${id}/read`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    markAllRead: async () => {
        try {
            const response = await api.put('/notifications/read-all');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteNotification: async (id) => {
        try {
            const response = await api.delete(`/notifications/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default notificationService;
