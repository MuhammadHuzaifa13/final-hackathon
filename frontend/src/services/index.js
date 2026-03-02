import api from './api';

// Authentication services
export const authService = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Appointment services
export const appointmentService = {
  bookAppointment: async (appointmentData) => {
    const response = await api.post('/appointments/book', appointmentData);
    return response.data;
  },

  getUpcomingAppointments: async () => {
    const response = await api.get('/appointments/upcoming');
    return response.data;
  },

  getAppointmentHistory: async () => {
    const response = await api.get('/appointments/history');
    return response.data;
  },

  cancelAppointment: async (appointmentId) => {
    const response = await api.put(`/appointments/${appointmentId}/cancel`);
    return response.data;
  },

  getAvailableDoctors: async () => {
    const response = await api.get('/appointments/doctors');
    return response.data;
  },

  getAvailableSlots: async (doctorId, date) => {
    const response = await api.get(`/appointments/available-slots/${doctorId}/${date}`);
    return response.data;
  },
};

// User profile services
export const userService = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/user/update', userData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/user/change-password', passwordData);
    return response.data;
  },

  deleteAccount: async (password) => {
    const response = await api.delete('/user/delete', { data: { password } });
    return response.data;
  },
};

// Medical records services
export const recordService = {
  getRecords: async (params = {}) => {
    const response = await api.get('/records', { params });
    return response.data;
  },

  getRecord: async (recordId) => {
    const response = await api.get(`/records/${recordId}`);
    return response.data;
  },

  createRecord: async (recordData) => {
    const response = await api.post('/records', recordData);
    return response.data;
  },

  updateRecord: async (recordId, recordData) => {
    const response = await api.put(`/records/${recordId}`, recordData);
    return response.data;
  },

  deleteRecord: async (recordId) => {
    const response = await api.delete(`/records/${recordId}`);
    return response.data;
  },

  getRecordStats: async () => {
    const response = await api.get('/records/stats');
    return response.data;
  },
};

// Symptom checker services
export const symptomService = {
  checkSymptoms: async (query) => {
    const response = await api.post('/symptoms/check', { query });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/symptoms/history');
    return response.data;
  },
};

// Medication services
export const medicationService = {
  getMedications: async () => {
    const response = await api.get('/medications');
    return response.data;
  },

  addMedication: async (medicationData) => {
    const response = await api.post('/medications', medicationData);
    return response.data;
  },

  updateMedication: async (id, medicationData) => {
    const response = await api.put(`/medications/${id}`, medicationData);
    return response.data;
  },

  trackAdherence: async (id, status, date) => {
    const response = await api.post(`/medications/${id}/track`, { status, date });
    return response.data;
  },

  deleteMedication: async (id) => {
    const response = await api.delete(`/medications/${id}`);
    return response.data;
  },
};

// Vitals services
export const vitalsService = {
  getVitals: async (type = '', limit = 100) => {
    const response = await api.get('/vitals', { params: { type, limit } });
    return response.data;
  },

  getLatestVitals: async () => {
    const response = await api.get('/vitals/latest');
    return response.data;
  },

  addVitals: async (vitalsData) => {
    const response = await api.post('/vitals', vitalsData);
    return response.data;
  },

  deleteVitals: async (id) => {
    const response = await api.delete(`/vitals/${id}`);
    return response.data;
  },
};

// Chat services
export const chatService = {
  getChats: async () => {
    const response = await api.get('/messages/chats');
    return response.data;
  },

  getConversation: async (partnerId) => {
    const response = await api.get(`/messages/${partnerId}`);
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },
};

// Emergency services
export const emergencyService = {
  createSOS: async (location) => {
    const response = await api.post('/emergency/sos', { location });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/emergency/history');
    return response.data;
  },

  resolveEmergency: async (id) => {
    const response = await api.put(`/emergency/${id}/resolve`);
    return response.data;
  },
};

// Notification services
export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};
