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
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { appointmentService } from '../services';
import { dateUtils, errorHandler } from '../utils';
import { COLORS, APPOINTMENT_STATUS, SHADOWS, SIZES } from '../constants';

const AppointmentHistoryScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAppointmentHistory();
  }, []);

  const loadAppointmentHistory = async () => {
    try {
      const response = await appointmentService.getAppointmentHistory();
      const appointments = response?.data?.appointments || response?.appointments || [];
      setAppointments(appointments);
    } catch (error) {
      console.error('Error loading appointment history:', error);
      const message = errorHandler.getErrorMessage(error);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppointmentHistory();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case APPOINTMENT_STATUS.COMPLETED:
        return COLORS.success;
      case APPOINTMENT_STATUS.CANCELLED:
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  };

  const renderAppointmentCard = (appointment) => {
    const statusColor = getStatusColor(appointment.status);

    return (
      <View key={appointment._id} style={styles.appointmentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.drName}>Dr. {appointment.doctor?.name || 'Medical Pro'}</Text>
            <Text style={styles.drSpec}>{appointment.doctor?.specialization || 'Healthcare'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText(appointment.status)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Icon name="event" size={16} color={COLORS.textTertiary} />
            <Text style={styles.detailValue}>{dateUtils.formatDate(appointment.date)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="schedule" size={16} color={COLORS.textTertiary} />
            <Text style={styles.detailValue}>{dateUtils.formatTime(appointment.time)}</Text>
          </View>
        </View>

        {appointment.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesHeader}>Consultation Note</Text>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="history" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyStateTitle}>No Appointment History</Text>
      <Text style={styles.emptyStateText}>
        You haven't had any appointments yet. Your appointment history will appear here.
      </Text>
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate('BookAppointment')}
      >
        <Text style={styles.bookButtonText}>Book Your First Appointment</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => {
    const completed = appointments.filter(a => a.status === APPOINTMENT_STATUS.COMPLETED).length;
    const cancelled = appointments.filter(a => a.status === APPOINTMENT_STATUS.CANCELLED).length;
    const total = appointments.length;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{total}</Text>
          <Text style={styles.statLabel}>Total Appointments</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: COLORS.success }]}>{completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: COLORS.error }]}>{cancelled}</Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading appointment history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment History</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {appointments.length > 0 && renderStats()}

        {appointments.length > 0
          ? appointments.map(renderAppointmentCard)
          : renderEmptyState()}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
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
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  appointmentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.light,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  drName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.midnight,
  },
  drSpec: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  notesBox: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  notesHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.slate,
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

export default AppointmentHistoryScreen;
