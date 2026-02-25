import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { storage, STORAGE_KEYS } from '../utils';
import { authService } from '../services';
import { COLORS, ROUTES } from '../constants';

const WelcomeScreen = ({ navigation }) => {
  useEffect(() => {
    const checkLogin = async () => {
      const token = await storage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        navigation.replace(ROUTES.MAIN);
      }
    };
    checkLogin();
  }, [navigation]);

  const handleCreateAccount = () => {
    navigation.navigate('Signup');
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[COLORS.primary, '#6C5CE7']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo or Icon */}
          <Animated.View entering={ZoomIn.delay(300)} style={styles.logoContainer}>
            <View style={styles.logo}>
              <Icon name="local-hospital" size={40} color="#FFFFFF" />
            </View>
          </Animated.View>

          {/* Welcome Text */}
          <Animated.View entering={FadeInUp.delay(500)}>
            <Text style={styles.title}>Your Health, Simplified</Text>
            <Text style={styles.subtitle}>
              Manage appointments and track your well-being with ease.
            </Text>
          </Animated.View>

          {/* Buttons */}
          <Animated.View entering={FadeInDown.delay(700)} style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreateAccount}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Create Your Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSignIn}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default WelcomeScreen;
