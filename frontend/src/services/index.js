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
