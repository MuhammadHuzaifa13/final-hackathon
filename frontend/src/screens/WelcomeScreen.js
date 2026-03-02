import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  FadeInDown,
  ZoomIn
} from 'react-native-reanimated';
import { storage, STORAGE_KEYS } from '../utils';
import { ROUTES, COLORS, SIZES, SHADOWS } from '../constants';
import GradientButton from '../components/GradientButton';

const { width } = Dimensions.get('window');

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#E0F2F1', '#F8FBFB']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.content}>
          <Animated.View
            entering={ZoomIn.duration(800).delay(200)}
            style={styles.logoContainer}
          >
            <View style={styles.logoCircle}>
              <Icon name="health-and-safety" size={60} color={COLORS.primary} />
            </View>
          </Animated.View>

          <View style={styles.textContainer}>
            <Animated.Text
              entering={FadeInUp.duration(800).delay(400)}
              style={styles.title}
            >
              Your Health, Simplified
            </Animated.Text>
            <Animated.Text
              entering={FadeInUp.duration(800).delay(600)}
              style={styles.subtitle}
            >
              Manage appointments and track your well-being with ease.
            </Animated.Text>
          </View>

          <Animated.View
            entering={FadeInDown.duration(800).delay(800)}
            style={styles.buttonContainer}
          >
            <GradientButton
              title="Create Your Account"
              onPress={() => navigation.navigate(ROUTES.SIGNUP)}
            />

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate(ROUTES.LOGIN)}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
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
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.xxl,
  },
  logoContainer: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  logoInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
  },
  title: {
    fontSize: SIZES.fontXxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  subtitle: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: SIZES.xl,
    marginBottom: 40,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: SIZES.lg,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  loginLinkBold: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
