import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
    Dimensions
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { ROUTES, COLORS, SIZES, SHADOWS } from '../constants';
import { vitalsService } from '../services';
import PremiumCard from '../components/PremiumCard';
import GradientButton from '../components/GradientButton';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const HealthTrendsScreen = ({ navigation }) => {
    const [latestVitals, setLatestVitals] = useState({});
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedType, setSelectedType] = useState('Heart Rate');
    const [newRecord, setNewRecord] = useState({
        type: 'Heart Rate',
        value: '',
        unit: 'BPM',
        note: ''
    });

    const vitalTypes = [
        { name: 'Heart Rate', icon: 'favorite', unit: 'BPM', color: '#FF5252' },
        { name: 'Blood Pressure', icon: 'speed', unit: 'mmHg', color: '#448AFF' },
        { name: 'Steps', icon: 'directions-walk', unit: 'Steps', color: '#4CAF50' },
        { name: 'Sleep', icon: 'bedtime', unit: 'hrs', color: '#7C4DFF' },
        { name: 'Weight', icon: 'monitor-weight', unit: 'kg', color: '#FF9800' },
        { name: 'Temperature', icon: 'thermostat', unit: '°C', color: '#00BCD4' },
    ];

    useEffect(() => {
        fetchData();
    }, [selectedType]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [latestRes, historyRes] = await Promise.all([
                vitalsService.getLatestVitals(),
                vitalsService.getVitals(selectedType, 7)
            ]);
            setLatestVitals(latestRes.data);
            setHistory(historyRes.data.reverse()); // Reverse for chronological chart
        } catch (error) {
            console.error('Fetch Vitals Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRecord = async () => {
        if (!newRecord.value) {
            Alert.alert('Error', 'Please enter a value');
            return;
        }

        try {
            const typeInfo = vitalTypes.find(t => t.name === newRecord.type);
            await vitalsService.addVitals({
                ...newRecord,
                unit: typeInfo.unit
            });
            setModalVisible(false);
            setNewRecord({ ...newRecord, value: '', note: '' });
            fetchData();
        } catch (error) {
            Alert.alert('Error', 'Failed to add record');
        }
    };

    const renderChart = () => {
        if (history.length === 0) {
            return (
                <View style={styles.emptyChart}>
                    <Text style={styles.emptyChartText}>No data available for {selectedType}</Text>
                </View>
            );
        }

        const maxValue = Math.max(...history.map(h => parseFloat(h.value.split('/')[0]) || 0), 1);

        return (
            <View style={styles.chartContainer}>
                <View style={styles.barsContainer}>
                    {history.map((item, index) => {
                        const val = parseFloat(item.value.split('/')[0]) || 0;
                        const height = (val / maxValue) * 120;
                        return (
                            <View key={item._id} style={styles.barWrapper}>
                                <Animated.View
                                    entering={FadeInUp.delay(index * 100)}
                                    style={[styles.bar, { height, backgroundColor: vitalTypes.find(t => t.name === selectedType).color }]}
                                />
                                <Text style={styles.barLabel}>{new Date(item.date).toLocaleDateString('en-US', { weekday: 'narrow' })}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
                    <Icon name="arrow-back" size={24} color={COLORS.midnight} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Health Trends</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconCircle}>
                    <Icon name="add" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.typeSelector}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScroll}>
                        {vitalTypes.map((type) => (
                            <TouchableOpacity
                                key={type.name}
                                style={[styles.typeChip, selectedType === type.name && { backgroundColor: type.color }]}
                                onPress={() => setSelectedType(type.name)}
                            >
                                <Icon name={type.icon} size={18} color={selectedType === type.name ? COLORS.white : COLORS.textSecondary} />
                                <Text style={[styles.typeChipText, selectedType === type.name && { color: COLORS.white }]}>{type.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <PremiumCard style={styles.mainCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{selectedType} Overview</Text>
                        <Text style={styles.cardSubtitle}>Last 7 recorded days</Text>
                    </View>
                    {loading ? (
                        <ActivityIndicator style={{ height: 180 }} color={COLORS.primary} />
                    ) : (
                        renderChart()
                    )}
                </PremiumCard>

                <Text style={styles.sectionTitle}>Current Stats</Text>
                <View style={styles.statsGrid}>
                    {vitalTypes.slice(0, 4).map((type, index) => (
                        <Animated.View
                            key={type.name}
                            entering={FadeInDown.delay(index * 100)}
                            style={styles.statWrapper}
                        >
                            <PremiumCard style={styles.statCard}>
                                <View style={[styles.statIconBox, { backgroundColor: type.color + '20' }]}>
                                    <Icon name={type.icon} size={20} color={type.color} />
                                </View>
                                <Text style={styles.statName}>{type.name}</Text>
                                <Text style={styles.statValue}>
                                    {latestVitals[type.name] ? latestVitals[type.name].value : '--'}
                                    <Text style={styles.unitText}> {type.unit}</Text>
                                </Text>
                            </PremiumCard>
                        </Animated.View>
                    ))}
                </View>
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
                            <Text style={styles.modalTitle}>Log Vitals</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} color={COLORS.midnight} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Vital Category</Text>
                        <View style={styles.pickerContainer}>
                            {vitalTypes.map(t => (
                                <TouchableOpacity
                                    key={t.name}
                                    style={[styles.modalTypeChip, newRecord.type === t.name && styles.modalTypeChipActive]}
                                    onPress={() => setNewRecord({ ...newRecord, type: t.name })}
                                >
                                    <Text style={[styles.modalTypeChipText, newRecord.type === t.name && styles.modalTypeChipTextActive]}>{t.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Value ({vitalTypes.find(t => t.name === newRecord.type).unit})</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter value"
                            keyboardType="numeric"
                            value={newRecord.value}
                            onChangeText={(v) => setNewRecord({ ...newRecord, value: v })}
                        />

                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            style={[styles.modalInput, { height: 80 }]}
                            placeholder="Add a note (optional)"
                            multiline
                            value={newRecord.note}
                            onChangeText={(v) => setNewRecord({ ...newRecord, note: v })}
                        />

                        <GradientButton
                            title="Save Vitals"
                            onPress={handleAddRecord}
                            style={{ marginTop: 10 }}
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
    typeSelector: {
        marginBottom: 20,
    },
    typeScroll: {
        gap: 10,
        paddingRight: 20,
    },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        ...SHADOWS.light,
        gap: 8,
    },
    typeChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    mainCard: {
        marginBottom: 25,
        padding: 20,
    },
    cardHeader: {
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.midnight,
    },
    cardSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    chartContainer: {
        height: 160,
        justifyContent: 'flex-end',
    },
    barsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    barWrapper: {
        alignItems: 'center',
        gap: 8,
    },
    bar: {
        width: 15,
        borderRadius: 10,
        minHeight: 5,
    },
    barLabel: {
        fontSize: 10,
        color: COLORS.textTertiary,
        fontWeight: 'bold',
    },
    emptyChart: {
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyChartText: {
        color: COLORS.textTertiary,
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.midnight,
        marginBottom: 15,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statWrapper: {
        width: '48%',
        marginBottom: 15,
    },
    statCard: {
        padding: 15,
        alignItems: 'center',
    },
    statIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    statName: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 5,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.midnight,
    },
    unitText: {
        fontSize: 10,
        color: COLORS.textTertiary,
        fontWeight: 'normal',
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
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.midnight,
        marginBottom: 10,
        marginTop: 5,
    },
    pickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 15,
    },
    modalTypeChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalTypeChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    modalTypeChipText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    modalTypeChipTextActive: {
        color: COLORS.white,
        fontWeight: 'bold',
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

export default HealthTrendsScreen;
