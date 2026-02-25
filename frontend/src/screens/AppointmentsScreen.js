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
import { COLORS, ROUTES, APPOINTMENT_STATUS } from '../constants';

const AppointmentsScreen = ({ navigation }) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentService.getUpcomingAppointments();
      setUpcomingAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const handleBookAppointment = () => {
    navigation.navigate(ROUTES.BOOK_APPOINTMENT);
  };

  const handleViewHistory = () => {
    navigation.navigate(ROUTES.APPOINTMENT_HISTORY);
  };

  const handleCancelAppointment = async (appointmentId) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await appointmentService.cancelAppointment(appointmentId);
              loadAppointments();
              Alert.alert('Success', 'Appointment cancelled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          },
        },
      ]
    );
  };

  const renderAppointmentCard = (appointment) => {
    const isToday = dateUtils.isToday(appointment.date);
    const statusColor = appointment.status === APPOINTMENT_STATUS.CONFIRMED
      ? COLORS.secondary
      : appointment.status === APPOINTMENT_STATUS.PENDING
        ? COLORS.warning
        : COLORS.textSecondary;

    return (
      <View key={appointment._id} style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View>
            <Text style={styles.doctorName}>{appointment.doctor?.name || 'Medical Professional'}</Text>
            <Text style={styles.specialization}>{appointment.doctor?.specialization || 'General Consultation'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Icon name="calendar-today" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {isToday ? 'Today' : dateUtils.formatDate(appointment.date)}
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

        {appointment.status === APPOINTMENT_STATUS.CONFIRMED && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelAppointment(appointment._id)}
          >
            <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="event-busy" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyStateTitle}>No Upcoming Appointments</Text>
      <Text style={styles.emptyStateText}>
        You don't have any appointments scheduled. Book one to get started!
      </Text>
      <TouchableOpacity style={styles.bookButton} onPress={handleBookAppointment}>
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <TouchableOpacity style={styles.historyButton} onPress={handleViewHistory}>
          <Icon name="history" size={20} color={COLORS.primary} />
          <Text style={styles.historyButtonText}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {upcomingAppointments.length > 0
          ? upcomingAppointments.map(renderAppointmentCard)
          : renderEmptyState()}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleBookAppointment}
      >
        <Icon name="add" size={24} color={COLORS.surface} />
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
    fontSize: 18,
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
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.error,
    fontSize: 14,
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
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default AppointmentsScreen;
