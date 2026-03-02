import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { authService } from '../services';
import { storage, STORAGE_KEYS, errorHandler, dataUtils } from '../utils';
import { COLORS, ROUTES, SIZES } from '../constants';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await storage.getItem(STORAGE_KEYS.USER);
      console.log('Raw user data from storage:', userData);
      const user = dataUtils.unwrapUser(userData);
      console.log('Normalized user data for Profile:', user);
      if (user) {
        setUser(user);
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const handleLogout = async () => {
    const performLogout = async () => {
      console.log('Performing logout...');
      await storage.removeItem(STORAGE_KEYS.TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER);
      await storage.clear();
      console.log('Storage cleared, redirecting to Welcome...');
      navigation.replace(ROUTES.WELCOME);
    };

    if (Platform.OS === 'web') {
      // Direct logout on web for better automation/UX if Alert.alert/window.confirm is problematic
      performLogout();
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: performLogout
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          <Animated.View entering={FadeInUp} style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Icon name="person" size={60} color={COLORS.primary} />
              </View>
              <TouchableOpacity style={styles.editAvatar}>
                <Icon name="camera-alt" size={18} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{user?.name || 'Loading...'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'Please wait'}</Text>
          </Animated.View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="person-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>{user?.name || '---'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="mail-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email Address</Text>
                  <Text style={styles.infoValue}>{user?.email || '---'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="phone-iphone" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Preferences</Text>
            <View style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <Icon name="help-outline" size={22} color={COLORS.text} />
                  <Text style={styles.menuText}>Help & Support</Text>
                </View>
                <Icon name="chevron-right" size={22} color={COLORS.border} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <Icon name="language" size={22} color={COLORS.text} />
                  <Text style={styles.menuText}>Language</Text>
                </View>
                <View style={styles.menuRight}>
                  <Text style={styles.menuSubtext}>English</Text>
                  <Icon name="chevron-right" size={22} color={COLORS.border} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.lg,
  },
  header: {
    alignItems: 'center',
    marginVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  editAvatar: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    fontWeight: '500',
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuText: {
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    fontWeight: '500',
  },
  menuSubtext: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
    marginTop: 10,
  },
  logoutText: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.error,
  },
});

export default ProfileScreen;
