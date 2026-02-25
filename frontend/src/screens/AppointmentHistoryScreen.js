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
import { appointmentService } from '../services';
import { dateUtils } from '../utils';
import { COLORS, APPOINTMENT_STATUS } from '../constants';

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
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error loading appointment history:', error);
      Alert.alert('Error', 'Failed to load appointment history');
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
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderAppointmentCard = (appointment) => {
    const statusColor = getStatusColor(appointment.status);
    const isPast = dateUtils.isPast(appointment.date);

    return (
      <View key={appointment._id} style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View>
            <Text style={styles.doctorName}>{appointment.doctor?.name || 'Medical Professional'}</Text>
            <Text style={styles.specialization}>{appointment.doctor?.specialization || 'Medical History'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText(appointment.status)}
            </Text>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Icon name="calendar-today" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {dateUtils.formatDate(appointment.date)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="access-time" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{dateUtils.formatTime(appointment.time)}</Text>
          </View>
        </View>

        {appointment.notes && (
          <Text style={styles.notesText} numberOfLines={2}>
            {appointment.notes}
          </Text>
        )}

        <View style={styles.appointmentFooter}>
          <Text style={styles.appointmentDate}>
            {dateUtils.formatDateTime(appointment.date, appointment.time)}
          </Text>
          {isPast && appointment.status === APPOINTMENT_STATUS.CONFIRMED && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => console.log('Mark as completed')}
            >
              <Text style={styles.completeButtonText}>Mark Completed</Text>
            </TouchableOpacity>
          )}
        </View>
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
    padding: 16,
    borderRadius: 12,
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
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  appointmentDetails: {
    gap: 8,
    marginBottom: 12,
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
  notesText: {
    fontSize: 14,
    color: COLORS.text,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  appointmentDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  completeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  completeButtonText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  bookButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppointmentHistoryScreen;
