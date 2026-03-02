import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Brand Colors
  primary: '#00A69D',
  primaryDark: '#00796B',
  primaryLight: '#B2DFDB',
  secondary: '#26C6DA',
  accent: '#FF6B6B',

  // Premium Palette
  midnight: '#1A2E35',
  slate: '#455A64',
  silver: '#90A4AE',
  glass: 'rgba(255, 255, 255, 0.7)',
  glassDark: 'rgba(0, 0, 0, 0.05)',

  // Functional Colors
  background: '#F8FBFB',
  surface: '#FFFFFF',
  error: '#FF5252',
  success: '#4CAF50',
  warning: '#FFC107',
  info: '#00B0FF',

  // Text Colors
  textPrimary: '#1A2E35',
  textSecondary: '#607D8B',
  textTertiary: '#90A4AE',
  textOnPrimary: '#FFFFFF',

  // Gradients
  primaryGradient: ['#00A69D', '#26C6DA'],
  emergencyGradient: ['#FF5252', '#D32F2F'],
  glassGradient: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)'],

  border: '#ECEFF1',
  shadow: 'rgba(0, 0, 0, 0.1)',
  white: '#FFFFFF',
  text: '#1A2E35',
};

export const SIZES = {
  // Flat tokens (New structure)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,

  // Radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 20,
  radiusXl: 30,
  radiusFull: 999,

  // Font Sizes
  fontXs: 12,
  fontSm: 14,
  fontMd: 16,
  fontLg: 18,
  fontXl: 22,
  fontXxl: 30,
  fontXxxl: 40,

  // Layout
  width,
  height,

  // Legacy Nested tokens (For backward compatibility)
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 30,
    xxl: 100,
  },
  font: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 30,
    xxxl: 40,
  },
};

export const FONTS = {
  bold: 'System',
  semiBold: 'System',
  medium: 'System',
  regular: 'System',
  light: 'System',
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.midnight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.midnight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  heavy: {
    shadowColor: COLORS.midnight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  glass: {
    shadowColor: COLORS.midnight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  }
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
  SYMPTOM_CHECKER: 'SymptomChecker',
  MEDICATION_TRACKER: 'MedicationTracker',
  HEALTH_TRENDS: 'HealthTrends',
  CHAT_LIST: 'ChatList',
  CHAT_DETAIL: 'ChatDetail',
  EMERGENCY: 'Emergency',
  NOTIFICATIONS: 'Notifications',
  DOCTOR_SCHEDULE: 'DoctorSchedule',
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
