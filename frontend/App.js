import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants';
import { Platform, View } from 'react-native';

// Web specific icon font loading
// (Removed problematic direct require for now)

export default function App() {
  return (
    <View style={{ flex: 1, height: Platform.OS === 'web' ? '100vh' : 'auto' }}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <AppNavigator />
      </NavigationContainer>
    </View>
  );
}
