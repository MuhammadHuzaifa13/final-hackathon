export const COLORS = {
  primary: '#4A90E2',
  secondary: '#50C878',
  accent: '#FF6B6B',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  border: '#E1E8ED',
  error: '#E74C3C',
  success: '#27AE60',
  warning: '#F39C12',
  info: '#3498DB',
};

export const SIZES = {
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  font: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
};

export const ROUTES = {
  SPLASH: 'Splash',
  WELCOME: 'Welcome',
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  DASHBOARD: 'Dashboard',
  APPOINTMENTS: 'Appointments',
  BOOK_APPOINTMENT: 'BookAppointment',
  APPOINTMENT_HISTORY: 'AppointmentHistory',
  MEDICAL_RECORDS: 'MedicalRecords',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  MAIN: 'Main',
};

export const RECORD_TYPES = {
  LAB_RESULT: 'lab_result',
  PRESCRIPTION: 'prescription',
  DIAGNOSIS: 'diagnosis',
  IMAGING: 'imaging',
  VACCINATION: 'vaccination',
  OTHER: 'other',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};
