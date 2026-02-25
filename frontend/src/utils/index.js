import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  ONBOARDING_COMPLETED: 'onboarding_completed',
};

// Storage utilities
export const storage = {
  // Set item
  setItem: async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },

  // Get item
  getItem: async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  // Remove item
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  },

  // Clear all
  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

// Date formatting utilities
export const dateUtils = {
  formatDate: (date) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(date).toLocaleDateString(undefined, options);
  },

  formatTime: (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  },

  formatDateTime: (date, time) => {
    const dateObj = new Date(date);
    const [hours, minutes] = time.split(':');
    dateObj.setHours(parseInt(hours));
    dateObj.setMinutes(parseInt(minutes));
    
    return dateObj.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  },

  isToday: (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return today.toDateString() === checkDate.toDateString();
  },

  isPast: (date) => {
    return new Date(date) < new Date();
  },
};

// Validation utilities
export const validation = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  phone: (phone) => {
    const phoneRegex = /^[+]?[\d\s-()]+$/;
    return phoneRegex.test(phone);
  },

  password: (password) => {
    return password.length >= 6;
  },

  required: (value) => {
    return value && value.trim().length > 0;
  },
};

// Error handling utilities
export const errorHandler = {
  getErrorMessage: (error) => {
    if (error.response) {
      // Server responded with error status
      return error.response.data?.message || 'Server error occurred';
    } else if (error.request) {
      // Request was made but no response received
      return 'Network error. Please check your connection.';
    } else {
      // Something else happened
      return error.message || 'An unexpected error occurred';
    }
  },

  showError: (error, callback) => {
    const message = errorHandler.getErrorMessage(error);
    if (callback) {
      callback(message);
    } else {
      console.error('Error:', message);
    }
  },
};
