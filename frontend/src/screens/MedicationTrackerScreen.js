import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { ROUTES, COLORS, SIZES, SHADOWS } from '../constants';
import { medicationService } from '../services';
import PremiumCard from '../components/PremiumCard';
import GradientButton from '../components/GradientButton';
import Animated, { FadeInUp } from 'react-native-reanimated';

const MedicationTrackerScreen = ({ navigation }) => {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newMed, setNewMed] = useState({
        name: '',
        dosage: '',
        frequency: 'Daily',
        times: ['09:00'],
        instruction: 'After meal',
        startDate: new Date().toISOString()
    });

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        try {
            const response = await medicationService.getMedications();
            setMedications(response.data);
        } catch (error) {
            console.error('Fetch Medications Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedication = async () => {
        if (!newMed.name || !newMed.dosage) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }

        try {
            await medicationService.addMedication(newMed);
            setModalVisible(false);
            setNewMed({
                name: '',
                dosage: '',
                frequency: 'Daily',
                times: ['09:00'],
                instruction: 'After meal',
                startDate: new Date().toISOString()
            });
            fetchMedications();
        } catch (error) {
            Alert.alert('Error', 'Failed to add medication');
        }
    };

    const handleToggleAdherence = async (medId, status) => {
        try {
            await medicationService.trackAdherence(medId, status);
            fetchMedications();
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const renderMedItem = ({ item, index }) => {
        const isTaken = item.adherence && item.adherence.some(a =>
            new Date(a.date).toDateString() === new Date().toDateString() && a.status === 'Taken'
        );

        return (
            <Animated.View entering={FadeInUp.delay(index * 100)}>
                <PremiumCard style={styles.medCard}>
                    <View style={styles.medHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: isTaken ? COLORS.successLight : '#FFF3E0' }]}>
                            <Icon name="medication" size={24} color={isTaken ? COLORS.success : '#FF9800'} />
                        </View>
                        <View style={styles.medInfo}>
                            <Text style={styles.medName}>{item.name}</Text>
                            <Text style={styles.medDosage}>{item.dosage} • {item.instruction}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.checkButton, isTaken && styles.checkButtonActive]}
                            onPress={() => handleToggleAdherence(item._id, isTaken ? 'Missed' : 'Taken')}
                        >
                            <Icon name={isTaken ? "check-circle" : "radio-button-unchecked"} size={28} color={isTaken ? COLORS.success : COLORS.textTertiary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.medFooter}>
                        <View style={styles.timeTag}>
                            <Icon name="access-time" size={12} color={COLORS.textSecondary} />
                            <Text style={styles.timeText}>{item.times.join(', ')}</Text>
                        </View>
                        <Text style={styles.frequencyText}>{item.frequency}</Text>
                    </View>
                </PremiumCard>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
                    <Icon name="arrow-back" size={24} color={COLORS.midnight} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Medications</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconCircle}>
                    <Icon name="add" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <PremiumCard style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryIconBox}>
                            <Icon name="event-available" size={32} color={COLORS.white} />
                        </View>
                        <View>
                            <Text style={styles.summaryTitle}>Daily Progress</Text>
                            <Text style={styles.summarySubtitle}>
                                {medications.filter(m => m.adherence.some(a => new Date(a.date).toDateString() === new Date().toDateString() && a.status === 'Taken')).length} of {medications.length} doses taken
                            </Text>
                        </View>
                    </View>
                </PremiumCard>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today's Schedule</Text>
                    <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                </View>

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} size="large" />
                ) : (
                    <FlatList
                        data={medications}
                        renderItem={renderMedItem}
                        keyExtractor={item => item._id}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Icon name="event-note" size={64} color={COLORS.border} />
                                <Text style={styles.emptyText}>No medications scheduled</Text>
                                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                                    <Text style={styles.addBtnText}>Add Medication</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                )}
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Medication</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} color={COLORS.midnight} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Medication Name (e.g. Aspirin)"
                            value={newMed.name}
                            onChangeText={(v) => setNewMed({ ...newMed, name: v })}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Dosage (e.g. 500mg)"
                            value={newMed.dosage}
                            onChangeText={(v) => setNewMed({ ...newMed, dosage: v })}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Instruction (e.g. After meal)"
                            value={newMed.instruction}
                            onChangeText={(v) => setNewMed({ ...newMed, instruction: v })}
                        />

                        <GradientButton
                            title="Save Medication"
                            onPress={handleAddMedication}
                            style={{ marginTop: 20 }}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FBFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
        backgroundColor: COLORS.surface,
        ...SHADOWS.light,
    },
    iconCircle: {
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
    },
    summaryCard: {
        backgroundColor: COLORS.primary,
        marginBottom: 25,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    summaryIconBox: {
        width: 60,
        height: 60,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryTitle: {
        color: COLORS.white,
        fontSize: SIZES.fontLg,
        fontWeight: 'bold',
    },
    summarySubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
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
    },
    dateText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    medCard: {
        marginBottom: 15,
        padding: 15,
    },
    medHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    medInfo: {
        flex: 1,
        marginLeft: 15,
    },
    medName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.midnight,
    },
    medDosage: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    checkButton: {
        padding: 5,
    },
    medFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    timeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timeText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    frequencyText: {
        fontSize: 11,
        color: COLORS.primary,
        backgroundColor: '#E0F2F1',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textTertiary,
        marginTop: 15,
    },
    addBtn: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25,
    },
    addBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.midnight,
    },
    modalInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        fontSize: 15,
        color: COLORS.midnight,
    }
});

export default MedicationTrackerScreen;
