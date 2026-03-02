import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { authService } from '../services';
import { storage, STORAGE_KEYS, errorHandler, dataUtils } from '../utils';
import { ROUTES, COLORS, SIZES, SHADOWS } from '../constants';
import GradientButton from '../components/GradientButton';

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...signupData } = formData;
      const response = await authService.signup(signupData);
      // Accessing data from the nested 'data' object returned by the server
      const { token, user: rawUser } = response.data;
      const user = dataUtils.unwrapUser(rawUser);
      await storage.setItem(STORAGE_KEYS.TOKEN, token);
      await storage.setItem(STORAGE_KEYS.USER, user);
      navigation.replace(ROUTES.MAIN);
    } catch (error) {
      const message = errorHandler.getErrorMessage(error);
      Alert.alert('Signup Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.iconCircleSmall}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.midnight} />
        </TouchableOpacity>

        <Animated.View
          entering={FadeInUp.duration(800)}
          style={styles.header}
        >
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>Manage your health effortlessly</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(800).delay(200)}
          style={styles.form}
        >
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Icon name="person-outline" size={20} color={COLORS.textTertiary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textTertiary}
                value={formData.name}
                onChangeText={(v) => handleInputChange('name', v)}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Icon name="alternate-email" size={20} color={COLORS.textTertiary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textTertiary}
                value={formData.email}
                onChangeText={(v) => handleInputChange('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color={COLORS.textTertiary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textTertiary}
                value={formData.password}
                onChangeText={(v) => handleInputChange('password', v)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color={COLORS.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color={COLORS.textTertiary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={COLORS.textTertiary}
                value={formData.confirmPassword}
                onChangeText={(v) => handleInputChange('confirmPassword', v)}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>

          <GradientButton
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            style={{ marginTop: 10 }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SIZES.xl,
    paddingTop: 20,
    paddingBottom: 40,
  },
  iconCircleSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...SHADOWS.light,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  title: {
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.fontMd,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
  },
});

export default SignupScreen;
