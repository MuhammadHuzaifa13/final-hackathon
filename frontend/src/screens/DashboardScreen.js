import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { appointmentService, recordService } from '../services';
import { storage, STORAGE_KEYS, dateUtils } from '../utils';
import { COLORS, ROUTES } from '../constants';

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recordStats, setRecordStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get user data
      const userData = await storage.getItem(STORAGE_KEYS.USER);
      setUser(userData);

      // Load upcoming appointments
      const appointmentsResponse = await appointmentService.getUpcomingAppointments();
      setUpcomingAppointments(appointmentsResponse.data.appointments.slice(0, 3)); // Show only first 3

      // Load record statistics
      const statsResponse = await recordService.getRecordStats();
      setRecordStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const navigateToScreen = (screen) => {
    navigation.navigate(screen);
  };

  const renderWelcomeSection = () => {
    if (!user) return null;

    return (
      <LinearGradient
        colors={[COLORS.primary, '#6C5CE7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeGradient}
      >
        <Animated.View entering={FadeInUp.delay(200)}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user.name}!</Text>
          <Text style={styles.welcomeSubtext}>
            How are you feeling today?
          </Text>
        </Animated.View>
      </LinearGradient>
    );
  };

  const renderQuickActions = () => {
    return (
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigateToScreen(ROUTES.BOOK_APPOINTMENT)}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionIcon}>
              <Icon name="event-available" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Book Appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigateToScreen(ROUTES.APPOINTMENTS)}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionIcon}>
              <Icon name="calendar-today" size={24} color={COLORS.secondary} />
            </View>
            <Text style={styles.quickActionText}>My Appointments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigateToScreen(ROUTES.MEDICAL_RECORDS)}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionIcon}>
              <Icon name="folder" size={24} color={COLORS.accent} />
            </View>
            <Text style={styles.quickActionText}>Medical Records</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigateToScreen(ROUTES.PROFILE)}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionIcon}>
              <Icon name="person" size={24} color={COLORS.info} />
            </View>
            <Text style={styles.quickActionText}>My Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderUpcomingAppointments = () => {
    if (upcomingAppointments.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <View style={styles.emptyState}>
            <Icon name="event-busy" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateText}>No upcoming appointments</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => navigateToScreen(ROUTES.BOOK_APPOINTMENT)}
            >
              <Text style={styles.emptyStateButtonText}>Book One Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <TouchableOpacity
            onPress={() => navigateToScreen(ROUTES.APPOINTMENTS)}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {upcomingAppointments.map((appointment, index) => (
          <Animated.View
            entering={FadeInUp.delay(400 + index * 100)}
            key={appointment._id}
            style={styles.appointmentCard}
          >
            <View style={styles.appointmentInfo}>
              <View style={styles.appointmentHeader}>
                <Text style={styles.doctorName}>{appointment.doctor?.name || 'Doctor'}</Text>
                <Text style={styles.appointmentStatus}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </Text>
              </View>
              <Text style={styles.specialization}>{appointment.doctor?.specialization || 'Medical Specialist'}</Text>
              <View style={styles.appointmentDetails}>
                <View style={styles.detailRow}>
                  <Icon name="calendar-today" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>
                    {dateUtils.formatDate(appointment.date)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="access-time" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>
                    {dateUtils.formatTime(appointment.time)}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        ))}
      </View>
    );
  };

  const renderHealthStats = () => {
    const stats = [
      { id: '1', label: 'Heart Rate', value: '72 BPM', icon: 'favorite', color: COLORS.accent, subtext: '+2% last 24h' },
      { id: '2', label: 'Blood Pressure', value: '120/80', icon: 'speed', color: COLORS.info, subtext: 'Normal' },
      { id: '3', label: 'Steps', value: '8,450', icon: 'directions-walk', color: COLORS.secondary, subtext: 'Goal: 10,000' },
      { id: '4', label: 'Sleep', value: '7h 30m', icon: 'bedtime', color: '#6C5CE7', subtext: 'Good Quality' },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Statistics</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Animated.View
              entering={FadeInRight.delay(600 + index * 150)}
              key={stat.id}
              style={styles.statCard}
            >
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + '15' }]}>
                <Icon name={stat.icon} size={24} color={stat.color} />
              </View>
              <View style={styles.statInfo}>
                <Text style={stat.value === '72 BPM' ? styles.statValueBpm : styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statSubtext}>{stat.subtext}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderWelcomeSection()}
        {renderQuickActions()}
        {renderUpcomingAppointments()}
        {renderHealthStats()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  welcomeGradient: {
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  appointmentCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  appointmentStatus: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '500',
    backgroundColor: 'rgba(80, 200, 120, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specialization: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  appointmentDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    padding: 32,
    borderRadius: 12,
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
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statInfo: {
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  statValueBpm: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statSubtext: {
    fontSize: 10,
    color: '#00B894',
    fontWeight: '500',
  },
});

export default DashboardScreen;
