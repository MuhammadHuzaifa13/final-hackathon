import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { appointmentService } from '../services';
import { COLORS, ROUTES, SIZES, APPOINTMENT_STATUS } from '../constants';

const { width } = Dimensions.get('window');

const BookAppointmentScreen = ({ navigation, route }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Focus management for Web to resolve aria-hidden/focus conflict
  const screenRef = React.useRef(null);

  useEffect(() => {
    loadDoctors();
    // Default to tomorrow to avoid "future date" validation errors
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setSelectedDate(dateStr);

    // Force focus into the screen on mount for Web
    if (Platform.OS === 'web' && screenRef.current) {
      const timer = setTimeout(() => {
        screenRef.current.focus?.();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await appointmentService.getAvailableDoctors();
      const docs = response.doctors || response?.data?.doctors || response || [];
      const doctorsArray = Array.isArray(docs) ? docs : [];
      setDoctors(doctorsArray);

      // Handle parameter from DoctorScheduleScreen
      if (route.params?.doctorId && doctorsArray.length > 0) {
        const doc = doctorsArray.find(d => d._id === route.params.doctorId);
        if (doc) setSelectedDoctor(doc);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      Alert.alert('Error', 'Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDoctorsForDay = () => {
    if (!selectedDate) return [];
    const date = new Date(selectedDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

    return doctors.filter(doctor =>
      doctor.availableDays && doctor.availableDays.includes(dayName)
    );
  };

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const loadSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await appointmentService.getAvailableSlots(selectedDoctor._id, selectedDate);
      const slotsData = response?.data?.availableSlots || response?.availableSlots || [];

      // Convert string times (e.g., "09:00") to UI format { time: "09:00 AM", value: "09:00" }
      const formattedSlots = slotsData.map(slotStr => {
        const [hour, min] = slotStr.split(':');
        const h = parseInt(hour);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        return {
          time: `${displayHour}:${min} ${ampm}`,
          value: slotStr
        };
      });

      setAvailableSlots(formattedSlots);
    } catch (error) {
      console.error('Error loading slots:', error);
      // Fallback to static slots if API fails
      setAvailableSlots([
        { time: '09:00 AM', value: '09:00' },
        { time: '10:00 AM', value: '10:00' },
        { time: '11:00 AM', value: '11:00' },
        { time: '02:00 PM', value: '14:00' },
        { time: '03:00 PM', value: '15:00' },
      ]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      Alert.alert('Selection Required', 'Please select a doctor, date, and time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const appointmentData = {
        doctorId: selectedDoctor._id,
        date: selectedDate,
        time: selectedTime,
      };

      await appointmentService.bookAppointment(appointmentData);

      if (Platform.OS === 'web') {
        alert('Success! Your appointment has been booked successfully.');
        navigation.replace(ROUTES.MAIN);
      } else {
        Alert.alert(
          'Success!',
          'Your appointment has been booked successfully.',
          [{ text: 'Great', onPress: () => navigation.replace(ROUTES.MAIN) }]
        );
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to book appointment. Please try another slot.';
      if (Platform.OS === 'web') {
        alert('Booking Error: ' + message);
      } else {
        Alert.alert('Booking Error', message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        full: date.toISOString().split('T')[0],
        day: date.getDate(),
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }
    return dates;
  };

  const filteredDoctors = getAvailableDoctorsForDay();

  return (
    <SafeAreaView
      style={[
        styles.container,
        Platform.OS === 'web' && {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }
      ]}
      ref={screenRef}
      focusable={true}
      accessible={true}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>

          <Text style={styles.sectionTitle}>Choose A Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateList}>
            {generateDates().map((date, index) => (
              <TouchableOpacity
                key={date.full}
                style={[
                  styles.dateCard,
                  selectedDate === date.full && styles.selectedDateCard
                ]}
                onPress={() => {
                  setSelectedDate(date.full);
                  setSelectedDoctor(null);
                  setSelectedTime(null);
                }}
              >
                <Text style={[styles.dateName, selectedDate === date.full && styles.selectedDateText]}>
                  {date.name}
                </Text>
                <Text style={[styles.dateDay, selectedDate === date.full && styles.selectedDateText]}>
                  {date.day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Doctors Available on {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }) : 'this day'}</Text>
          {filteredDoctors.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorList}>
              {filteredDoctors.map((doctor) => (
                <TouchableOpacity
                  key={doctor._id}
                  style={[
                    styles.doctorCard,
                    selectedDoctor?._id === doctor._id && styles.selectedDoctorCard
                  ]}
                  onPress={() => {
                    setSelectedDoctor(doctor);
                    setSelectedTime(null);
                  }}
                >
                  <View style={styles.doctorAvatar}>
                    <Icon name="person" size={40} color={selectedDoctor?._id === doctor._id ? COLORS.white : COLORS.primary} />
                  </View>
                  <Text style={[styles.doctorName, selectedDoctor?._id === doctor._id && styles.selectedDoctorText]}>
                    {doctor.name}
                  </Text>
                  <Text style={[styles.doctorSpec, selectedDoctor?._id === doctor._id && styles.selectedDoctorTextSecondary]}>
                    {doctor.specialization}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyDoctors}>
              <Icon name="event-busy" size={40} color={COLORS.textTertiary} />
              <Text style={styles.emptyDoctorsText}>No doctors available on this day.</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          {loadingSlots ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
          ) : availableSlots.length > 0 ? (
            <View style={styles.timeGrid}>
              {availableSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    selectedTime === slot.value && styles.selectedTimeSlot
                  ]}
                  onPress={() => setSelectedTime(slot.value)}
                >
                  <Text style={[styles.timeText, selectedTime === slot.value && styles.selectedTimeText]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noSlotsText}>
              {selectedDoctor ? 'No available slots for this doctor on selected date.' : 'Select a doctor to view available slots.'}
            </Text>
          )}

          {/* Add spacing at the bottom to ensure last elements are visible above the footer */}
          <View style={{ height: 100 }} />

        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookButton, submitting && styles.disabledButton]}
          onPress={handleBookAppointment}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.bookButtonText}>Confirm Appointment</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    padding: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    marginTop: 10,
  },
  dateList: {
    marginBottom: 20,
  },
  dateCard: {
    width: 60,
    height: 80,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedDateCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dateDay: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  selectedDateText: {
    color: COLORS.white,
  },
  doctorList: {
    marginBottom: 20,
  },
  doctorCard: {
    width: 150,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedDoctorCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  doctorSpec: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  selectedDoctorText: {
    color: COLORS.white,
  },
  selectedDoctorTextSecondary: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  timeSlot: {
    width: '48%',
    height: 50,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedTimeText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  footer: {
    padding: SIZES.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: SIZES.radiusLg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  emptyDoctors: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyDoctorsText: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  noSlotsText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
    marginVertical: 20,
    fontStyle: 'italic',
  }
});

export default BookAppointmentScreen;
