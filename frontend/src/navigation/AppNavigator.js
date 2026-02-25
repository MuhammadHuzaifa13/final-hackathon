import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';
import AppointmentHistoryScreen from '../screens/AppointmentHistoryScreen';
import MedicalRecordsScreen from '../screens/MedicalRecordsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS, ROUTES } from '../constants';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === ROUTES.DASHBOARD) {
            iconName = 'dashboard';
          } else if (route.name === ROUTES.APPOINTMENTS) {
            iconName = 'event';
          } else if (route.name === ROUTES.MEDICAL_RECORDS) {
            iconName = 'folder';
          } else if (route.name === ROUTES.PROFILE) {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name={ROUTES.DASHBOARD}
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name={ROUTES.APPOINTMENTS}
        component={AppointmentsScreen}
        options={{ title: 'Appointments' }}
      />
      <Tab.Screen
        name={ROUTES.MEDICAL_RECORDS}
        component={MedicalRecordsScreen}
        options={{ title: 'Medical Records' }}
      />
      <Tab.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Auth Screens */}
      <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
      <Stack.Screen name={ROUTES.WELCOME} component={WelcomeScreen} />
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.SIGNUP} component={SignupScreen} />

      {/* Main App Screens */}
      <Stack.Screen name="Main" component={TabNavigator} />

      {/* Additional Screens */}
      <Stack.Screen
        name={ROUTES.BOOK_APPOINTMENT}
        component={BookAppointmentScreen}
        options={{
          headerShown: true,
          title: 'Book Appointment',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.surface,
        }}
      />
      <Stack.Screen
        name={ROUTES.APPOINTMENT_HISTORY}
        component={AppointmentHistoryScreen}
        options={{
          headerShown: true,
          title: 'Appointment History',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.surface,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
