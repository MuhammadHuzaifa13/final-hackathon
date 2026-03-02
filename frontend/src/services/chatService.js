import api from './api';

const chatService = {
    getChats: async () => {
        try {
            const response = await api.get('/messages/chats');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getConversation: async (partnerId) => {
        try {
            const response = await api.get(`/messages/${partnerId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    sendMessage: async (messageData) => {
        try {
            const response = await api.post('/messages', messageData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default chatService;
