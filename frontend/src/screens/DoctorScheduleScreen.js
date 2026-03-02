import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Dimensions,
    Platform
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { appointmentService } from '../services';
import { COLORS, SIZES, SHADOWS, ROUTES } from '../constants';
import PremiumCard from '../components/PremiumCard';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DoctorScheduleScreen = ({ navigation }) => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        try {
            const response = await appointmentService.getAvailableDoctors();
            const docs = response.doctors || response?.data?.doctors || response || [];
            setDoctors(Array.isArray(docs) ? docs : []);
        } catch (error) {
            console.error('Error loading doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderDoctorCard = (doctor) => (
        <PremiumCard key={doctor._id} style={styles.doctorCard}>
            <View style={styles.cardHeader}>
                <View style={styles.avatarContainer}>
                    <Icon name="person" size={40} color={COLORS.primary} />
                </View>
                <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
                    <Text style={styles.specialization}>{doctor.specialization}</Text>
                </View>
                <TouchableOpacity
                    style={styles.bookShortcut}
                    onPress={() => navigation.navigate(ROUTES.BOOK_APPOINTMENT, { doctorId: doctor._id })}
                >
                    <Icon name="event" size={20} color={COLORS.white} />
                    <Text style={styles.bookShortcutText}>Book</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.scheduleSection}>
                <Text style={styles.scheduleTitle}>Weekly Schedule</Text>
                <View style={styles.daysContainer}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                        const isAvailable = doctor.availableDays?.includes(day);
                        return (
                            <View key={day} style={[styles.dayBadge, isAvailable ? styles.activeDay : styles.inactiveDay]}>
                                <Text style={[styles.dayText, isAvailable ? styles.activeDayText : styles.inactiveDayText]}>
                                    {day.substring(0, 3)}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.timeSlots}>
                    <Icon name="access-time" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.timeRange}>
                        {doctor.availableTimeSlots?.length > 0
                            ? `${doctor.availableTimeSlots[0].start} - ${doctor.availableTimeSlots[0].end}`
                            : 'N/A'}
                    </Text>
                </View>
            </View>
        </PremiumCard>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={COLORS.midnight} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Doctor Schedules</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.introText}>Find when your preferred doctor is available for consultation.</Text>
                {doctors.map(renderDoctorCard)}
            </ScrollView>
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
        backgroundColor: COLORS.surface,
        ...SHADOWS.light,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: 'bold',
        color: COLORS.midnight,
    },
    scrollContent: {
        padding: SIZES.lg,
        paddingBottom: 40,
    },
    introText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 20,
        lineHeight: 20,
    },
    doctorCard: {
        padding: 15,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    doctorInfo: {
        flex: 1,
        marginLeft: 15,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.midnight,
    },
    specialization: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '600',
        marginTop: 2,
    },
    bookShortcut: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        ...SHADOWS.medium,
    },
    bookShortcutText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 15,
    },
    scheduleSection: {
        gap: 12,
    },
    scheduleTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.slate,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dayBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
    },
    activeDay: {
        backgroundColor: COLORS.primary + '15',
        borderColor: COLORS.primary,
    },
    inactiveDay: {
        backgroundColor: COLORS.background,
        borderColor: COLORS.border,
    },
    dayText: {
        fontSize: 11,
        fontWeight: '600',
    },
    activeDayText: {
        color: COLORS.primary,
    },
    inactiveDayText: {
        color: COLORS.textTertiary,
    },
    timeSlots: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        gap: 8,
    },
    timeRange: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    }
});

export default DoctorScheduleScreen;
