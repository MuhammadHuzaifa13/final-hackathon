import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  SafeAreaView,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  FadeInRight,
  FadeIn
} from 'react-native-reanimated';
import { appointmentService, recordService, vitalsService, medicationService, notificationService } from '../services';
import { storage, STORAGE_KEYS, dateUtils, errorHandler, dataUtils } from '../utils';
import { ROUTES, COLORS, SIZES, SHADOWS } from '../constants';
import PremiumCard from '../components/PremiumCard';
import GradientButton from '../components/GradientButton';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [latestVitals, setLatestVitals] = useState({});
  const [activeMedications, setActiveMedications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const userData = await storage.getItem(STORAGE_KEYS.USER);
      setUser(dataUtils.unwrapUser(userData));

      // Fetch all data in parallel
      const [apptsRes, vitalsRes, medsRes, notifsRes] = await Promise.all([
        appointmentService.getUpcomingAppointments().catch(() => ({ data: { appointments: [] } })),
        vitalsService.getLatestVitals().catch(() => ({ data: {} })),
        medicationService.getMedications().catch(() => ({ data: [] })),
        notificationService.getNotifications().catch(() => ({ data: [] }))
      ]);

      setUpcomingAppointments(apptsRes?.data?.appointments || apptsRes?.appointments || []);
      setLatestVitals(vitalsRes?.data || {});
      setActiveMedications((medsRes?.data || medsRes || []).slice(0, 2));
      setUnreadCount((notifsRes?.data || notifsRes || []).filter(n => !n.isRead).length);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      const message = errorHandler.getErrorMessage(error);
      Alert.alert('Error', 'Failed to load dashboard data: ' + message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerSubtitle}>Good Morning,</Text>
        <Text style={styles.greetingText}>{user?.name?.split(' ')[0] || 'User'}</Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.iconCircle}
          onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
        >
          <Icon name="notifications-none" size={24} color={COLORS.midnight} />
          {unreadCount > 0 && <View style={styles.notificationDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => navigation.navigate(ROUTES.PROFILE)}
        >
          <Icon name="person" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUpcomingCard = () => {
    const appointment = upcomingAppointments[0];
    if (!appointment) {
      return (
        <Animated.View entering={FadeInUp.delay(200)} style={styles.upcomingContainer}>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.BOOK_APPOINTMENT)}>
            <PremiumCard style={styles.emptyApptCard}>
              <Icon name="event" size={32} color={COLORS.primary} />
              <Text style={styles.emptyApptTitle}>No Upcoming Appointments</Text>
              <Text style={styles.emptyApptSub}>Book a consultation with a doctor now</Text>
            </PremiumCard>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <Animated.View entering={FadeInUp.delay(200)} style={styles.upcomingContainer}>
        <LinearGradient
          colors={[COLORS.primary, '#008b83']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.upcomingCard}
        >
          <View style={styles.upcomingHeader}>
            <View style={styles.doctorAvatarSmall}>
              <Icon name="person" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.upcomingHeaderText}>
              <Text style={styles.upcomingTitle}>Upcoming Appointment</Text>
              <Text style={styles.upcomingDoctor}>Dr. {appointment.doctor?.name || 'Specialist'}</Text>
              <Text style={styles.upcomingSpec}>{appointment.doctor?.specialization}</Text>
            </View>
          </View>

          <View style={styles.upcomingDivider} />

          <View style={styles.upcomingFooter}>
            <View style={styles.upcomingInfo}>
              <Icon name="calendar-today" size={14} color={COLORS.white} />
              <Text style={styles.upcomingInfoText}>{dateUtils.formatDate(appointment.date)}</Text>
            </View>
            <View style={styles.upcomingInfo}>
              <Icon name="access-time" size={14} color={COLORS.white} />
              <Text style={styles.upcomingInfoText}>{dateUtils.formatTime(appointment.time)}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderQuickActions = () => {
    const actions = [
      { id: '1', title: 'Checkup', icon: 'psychology', color: '#6200EA', bg: '#F3E5F5', route: ROUTES.SYMPTOM_CHECKER },
      { id: '2', title: 'Booking', icon: 'event', color: COLORS.primary, bg: '#E0F2F1', route: ROUTES.BOOK_APPOINTMENT },
      { id: '3', title: 'Pharmacy', icon: 'medication', color: '#FF9800', bg: '#FFF3E0', route: ROUTES.MEDICATION_TRACKER },
      { id: '4', title: 'Schedule', icon: 'calendar-month', color: '#2196F3', bg: '#E3F2FD', route: ROUTES.DOCTOR_SCHEDULE },
      { id: '5', title: 'Health', icon: 'trending-up', color: '#00C853', bg: '#E8F5E9', route: ROUTES.HEALTH_TRENDS },
      { id: '6', title: 'Reports', icon: 'folder', color: '#E91E63', bg: '#FCE4EC', route: ROUTES.MEDICAL_RECORDS },
      { id: '7', title: 'Emergency', icon: 'report', color: COLORS.error, bg: '#FFEBEE', route: ROUTES.EMERGENCY },
      { id: '8', title: 'History', icon: 'history', color: '#607D8B', bg: '#ECEFF1', route: ROUTES.APPOINTMENTS },
      { id: '9', title: 'Settings', icon: 'settings', color: COLORS.slate, bg: '#F5F5F5', route: ROUTES.PROFILE },
    ];

    return (
      <View style={styles.actionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Services</Text>
        </View>
        <View style={styles.actionsGrid}>
          {actions.map((action, index) => (
            <Animated.View
              entering={FadeInUp.delay(300 + index * 50)}
              key={action.id}
              style={styles.actionWrapper}
            >
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => action.route && navigation.navigate(action.route)}
              >
                <LinearGradient
                  colors={[action.bg, COLORS.white]}
                  style={styles.actionIcon}
                >
                  <Icon name={action.icon} size={28} color={action.color} />
                </LinearGradient>
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  };

  const renderHealthStats = () => {
    const heartRate = latestVitals['Heart Rate']?.value || '--';
    const bp = latestVitals['Blood Pressure']?.value || '--/--';
    const weight = latestVitals['Weight']?.value || '--';
    const temp = latestVitals['Temperature']?.value || '--';

    const stats = [
      { id: '1', label: 'Heart Rate', value: `${heartRate} BPM`, icon: 'favorite', color: COLORS.accent, subtext: 'Latest Vitals' },
      { id: '2', label: 'Blood Pressure', value: bp, icon: 'speed', color: '#2196F3', subtext: 'Latest Vitals' },
      { id: '3', label: 'Weight', value: `${weight} kg`, icon: 'monitor-weight', color: '#00C853', subtext: 'Latest Vitals' },
      { id: '4', label: 'Temperature', value: `${temp} °C`, icon: 'thermostat', color: '#6200EA', subtext: 'Latest Vitals' },
    ];

    return (
      <View style={styles.statsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Pulse</Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.HEALTH_TRENDS)}>
            <Text style={styles.viewAllText}>View Trends</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Animated.View
              entering={FadeInRight.delay(400 + index * 100)}
              key={stat.id}
              style={styles.statCard}
            >
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Icon name={stat.icon} size={18} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statSubtext}>{stat.subtext}</Text>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {renderHeader()}
          {renderUpcomingCard()}
          {renderQuickActions()}
          {renderHealthStats()}

          <View style={styles.medicationSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Medications</Text>
              <TouchableOpacity onPress={() => navigation.navigate(ROUTES.MEDICATION_TRACKER)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {activeMedications.length > 0 ? (
              activeMedications.map((med) => (
                <PremiumCard key={med._id} style={styles.medCard}>
                  <View style={[styles.medIcon, { backgroundColor: '#FFF3E0' }]}>
                    <Icon name="medication" size={28} color="#FF9800" />
                  </View>
                  <View style={styles.medInfo}>
                    <Text style={styles.medName}>{med.name}</Text>
                    <Text style={styles.medDosage}>{med.dosage} • {med.frequency}</Text>
                    <View style={styles.medTimeTag}>
                      <Icon name="access-time" size={12} color={COLORS.textSecondary} />
                      <Text style={styles.medTimeText}>{med.timings?.join(', ')}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.medCheckButton}
                    onPress={() => navigation.navigate(ROUTES.MEDICATION_TRACKER)}
                  >
                    <Icon name="arrow-forward" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                </PremiumCard>
              ))
            ) : (
              <PremiumCard style={styles.emptyMedCard}>
                <Text style={styles.emptyMedText}>No active medications</Text>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.MEDICATION_TRACKER)}>
                  <Text style={styles.addMedText}>+ Add Medication</Text>
                </TouchableOpacity>
              </PremiumCard>
            )}
          </View>

          <TouchableOpacity
            style={styles.aiBannerTouchable}
            onPress={() => navigation.navigate(ROUTES.SYMPTOM_CHECKER)}
          >
            <PremiumCard style={styles.aiBanner}>
              <LinearGradient
                colors={['#6200EA', '#9C27B0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiGradient}
              >
                <View style={styles.aiContent}>
                  <View style={styles.aiTextContainer}>
                    <Text style={styles.aiTitle}>AI Symptom Checker</Text>
                    <Text style={styles.aiSubtitle}>Feeling unwell? Chat with our AI for instant health guidance.</Text>
                    <View style={styles.aiButton}>
                      <Text style={styles.aiButtonText}>Start Chat</Text>
                      <Icon name="arrow-forward" size={16} color="#6200EA" />
                    </View>
                  </View>
                  <Icon name="psychology" size={60} color="rgba(255, 255, 255, 0.3)" style={styles.aiIcon} />
                </View>
              </LinearGradient>
            </PremiumCard>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: SIZES.lg,
    paddingTop: 20,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  headerSubtitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.midnight,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  upcomingContainer: {
    marginBottom: SIZES.xl,
  },
  upcomingCard: {
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    ...SHADOWS.heavy,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingHeaderText: {
    marginLeft: 15,
  },
  upcomingTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  upcomingDoctor: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  upcomingSpec: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  upcomingDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 15,
  },
  upcomingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
  },
  upcomingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upcomingInfoText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
  },
  actionsSection: {
    marginBottom: SIZES.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionWrapper: {
    width: (width - SIZES.lg * 2 - 24) / 4,
    marginBottom: 8,
  },
  actionItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...SHADOWS.light,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.midnight,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.midnight,
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statsSection: {
    marginBottom: SIZES.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    ...SHADOWS.light,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.midnight,
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  medicationSection: {
    marginBottom: SIZES.xl,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  medIcon: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medInfo: {
    flex: 1,
    marginLeft: 15,
  },
  medName: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.midnight,
  },
  medDosage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  medTimeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  medTimeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  medCheckButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  aiBanner: {
    padding: 0,
    overflow: 'hidden',
    height: 140,
    marginBottom: 40,
  },
  aiGradient: {
    flex: 1,
    padding: SIZES.lg,
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    color: COLORS.white,
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
  },
  aiSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 15,
  },
  aiButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  aiButtonText: {
    color: '#6200EA',
    fontSize: 12,
    fontWeight: 'bold',
  },
  aiIcon: {
    marginLeft: 10,
  },
  emptyApptCard: {
    padding: SIZES.xl,
    alignItems: 'center',
    backgroundColor: '#F5F9F9',
    borderWidth: 1,
    borderColor: 'rgba(0, 166, 156, 0.1)',
  },
  emptyApptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.midnight,
    marginTop: 10,
  },
  emptyApptSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emptyMedCard: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.1)',
  },
  emptyMedText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  addMedText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  aiBannerTouchable: {
    marginBottom: 40,
  },
});

export default DashboardScreen;
