import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { appointmentService } from '../services';
import { dateUtils } from '../utils';
import { COLORS, APPOINTMENT_STATUS } from '../constants';

const BookAppointmentScreen = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const loadDoctors = async () => {
    try {
      const response = await appointmentService.getAvailableDoctors();
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
      Alert.alert('Error', 'Failed to load available doctors');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const response = await appointmentService.getAvailableSlots(
        selectedDoctor._id,
        selectedDate
      );
      setAvailableSlots(response.data.availableSlots);
    } catch (error) {
      console.error('Error loading slots:', error);
      setAvailableSlots([]);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate('');
    setSelectedSlot('');
    setAvailableSlots([]);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot('');
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      Alert.alert('Error', 'Please select doctor, date, and time slot');
      return;
    }

    setBookingLoading(true);
    try {
      await appointmentService.bookAppointment({
        doctorId: selectedDoctor._id,
        date: selectedDate,
        time: selectedSlot,
        notes: notes,
      });

      Alert.alert(
        'Success',
        'Appointment booked successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const renderDoctorSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Your Doctor</Text>
      {doctors.map((doctor) => (
        <TouchableOpacity
          key={doctor._id}
          style={[
            styles.doctorCard,
            selectedDoctor?._id === doctor._id && styles.doctorCardSelected,
          ]}
          onPress={() => handleDoctorSelect(doctor)}
          activeOpacity={0.7}
        >
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.specialization}>{doctor.specialization}</Text>
            <Text style={styles.availability}>
              Available: {doctor.availableDays.join(', ')}
            </Text>
          </View>
          <View style={styles.doctorRadio}>
            <View
              style={[
                styles.radioOuter,
                selectedDoctor?._id === doctor._id && styles.radioOuterSelected,
              ]}
            >
              {selectedDoctor?._id === doctor._id && (
                <View style={styles.radioInner} />
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDateSelection = () => {
    if (!selectedDoctor) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose a Date</Text>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowCalendar(true)}
          activeOpacity={0.7}
        >
          <Icon name="calendar-today" size={24} color={COLORS.primary} />
          <Text style={styles.dateSelectorText}>
            {selectedDate ? dateUtils.formatDate(selectedDate) : 'Select Date'}
          </Text>
          <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTimeSlots = () => {
    if (!selectedDate || availableSlots.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Time Slots</Text>
        <View style={styles.slotsGrid}>
          {availableSlots.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.slotButton,
                selectedSlot === slot && styles.slotButtonSelected,
              ]}
              onPress={() => handleSlotSelect(slot)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.slotText,
                  selectedSlot === slot && styles.slotTextSelected,
                ]}
              >
                {dateUtils.formatTime(slot)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderNotesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notes (Optional)</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="Add any notes for your appointment..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />
    </View>
  );

  const renderBookingButton = () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return null;

    return (
      <View style={styles.bookingSection}>
        <TouchableOpacity
          style={[styles.bookButton, bookingLoading && styles.buttonDisabled]}
          onPress={handleBookAppointment}
          disabled={bookingLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>
            {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading available doctors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderDoctorSelection()}
        {renderDateSelection()}
        {renderTimeSlots()}
        {renderNotesSection()}
        {renderBookingButton()}
      </ScrollView>

      {/* Calendar Modal - Simplified for demo */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>
              Calendar functionality would be implemented here.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                // For demo, select tomorrow's date
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setSelectedDate(tomorrow.toISOString().split('T')[0]);
                setShowCalendar(false);
              }}
            >
              <Text style={styles.modalButtonText}>Select Tomorrow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  doctorCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
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
  doctorCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  doctorInfo: {
    flex: 1,
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
    marginBottom: 4,
  },
  availability: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  doctorRadio: {
    marginLeft: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  dateSelector: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateSelectorText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 80,
    alignItems: 'center',
  },
  slotButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotText: {
    fontSize: 14,
    color: COLORS.text,
  },
  slotTextSelected: {
    color: COLORS.surface,
  },
  notesInput: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  bookingSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 25,
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
  buttonDisabled: {
    opacity: 0.7,
  },
  bookButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 16,
    margin: 20,
    maxWidth: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BookAppointmentScreen;
