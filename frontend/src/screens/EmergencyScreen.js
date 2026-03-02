import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { ROUTES, COLORS, SIZES, SHADOWS } from '../constants';
import { emergencyService } from '../services';
import PremiumCard from '../components/PremiumCard';
import GradientButton from '../components/GradientButton';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
    withSequence
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const EmergencyScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [activeSOS, setActiveSOS] = useState(null);
    const pulse = useSharedValue(1);

    useEffect(() => {
        fetchHistory();
        startPulse();
    }, []);

    const startPulse = () => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            false
        );
    };

    const fetchHistory = async () => {
        try {
            const response = await emergencyService.getHistory();
            setHistory(response.data);
            const active = response.data.find(h => h.status === 'Active');
            if (active) setActiveSOS(active);
        } catch (error) {
            console.error('Fetch Emergency History Error:', error);
        }
    };

    const handleSOS = async () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm("Confirm SOS: This will alert emergency services and your contacts. Are you sure?");
            if (confirmed) {
                setLoading(true);
                try {
                    const location = {
                        latitude: 37.7749,
                        longitude: -122.4194,
                        address: "123 Health Ave, Wellness City"
                    };
                    const response = await emergencyService.createSOS(location);
                    setActiveSOS(response.data);
                    fetchHistory();
                    alert("SOS Sent: Emergency services have been notified.");
                } catch (error) {
                    alert("Error: Failed to send SOS alert.");
                } finally {
                    setLoading(false);
                }
            }
            return;
        }

        Alert.alert(
            "Confirm SOS",
            "This will alert emergency services and your contacts. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "SEND ALERT",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            // Mocking location for this example
                            const location = {
                                latitude: 37.7749,
                                longitude: -122.4194,
                                address: "123 Health Ave, Wellness City"
                            };
                            const response = await emergencyService.createSOS(location);
                            setActiveSOS(response.data);
                            fetchHistory();
                            Alert.alert("SOS Sent", "Emergency services have been notified.");
                        } catch (error) {
                            Alert.alert("Error", "Failed to send SOS alert.");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleResolve = async (id) => {
        try {
            await emergencyService.resolveEmergency(id);
            setActiveSOS(null);
            fetchHistory();
            Alert.alert("Resolved", "Emergency alert has been marked as resolved.");
        } catch (error) {
            Alert.alert("Error", "Failed to resolve alert.");
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
        opacity: interpolate(pulse.value, [1, 1.2], [1, 0.5])
    }));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
                    <Icon name="arrow-back" size={24} color={COLORS.midnight} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Emergency SOS</Text>
                <TouchableOpacity style={styles.iconCircle}>
                    <Icon name="settings" size={24} color={COLORS.midnight} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <PremiumCard style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <Icon
                            name={activeSOS ? "warning" : "verified_user"}
                            size={32}
                            color={activeSOS ? COLORS.error : COLORS.success}
                        />
                        <View style={{ marginLeft: 15 }}>
                            <Text style={styles.statusTitle}>
                                {activeSOS ? "SOS Active" : "System Ready"}
                            </Text>
                            <Text style={styles.statusSubtitle}>
                                {activeSOS ? "Emergency services notified" : "You are 100% protected"}
                            </Text>
                        </View>
                    </View>
                    {activeSOS && (
                        <TouchableOpacity
                            style={styles.resolveButton}
                            onPress={() => handleResolve(activeSOS._id)}
                        >
                            <Text style={styles.resolveText}>I AM SAFE (RESOLVE)</Text>
                        </TouchableOpacity>
                    )}
                </PremiumCard>

                <View style={styles.mainEmergency}>
                    <View style={styles.sosOuter}>
                        <Animated.View style={[styles.pulseCircle, animatedStyle]} />
                        <TouchableOpacity
                            style={styles.sosButton}
                            onPress={handleSOS}
                            disabled={loading || activeSOS}
                        >
                            {loading ? (
                                <ActivityIndicator size="large" color={COLORS.white} />
                            ) : (
                                <>
                                    <Text style={styles.sosText}>SOS</Text>
                                    <Text style={styles.sosSub}>Hold to trigger</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Emergency Contacts</Text>
                    <PremiumCard style={styles.contactCard}>
                        <View style={styles.contactItem}>
                            <View style={styles.contactAvatar}>
                                <Text style={styles.avatarText}>M</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 15 }}>
                                <Text style={styles.contactName}>Mom (Emergency)</Text>
                                <Text style={styles.contactPhone}>+1 234 567 8900</Text>
                            </View>
                            <TouchableOpacity style={styles.callIcon}>
                                <Icon name="call" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </PremiumCard>
                </View>

                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>Recent Alerts</Text>
                    {history.length > 0 ? (
                        history.slice(0, 3).map((item, index) => (
                            <View key={item._id} style={styles.historyItem}>
                                <View style={[styles.historyIcon, { backgroundColor: item.status === 'Active' ? '#FF525220' : '#4CAF5020' }]}>
                                    <Icon
                                        name={item.type === 'SOS Alert' ? 'warning' : 'info'}
                                        size={20}
                                        color={item.status === 'Active' ? COLORS.error : COLORS.success}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 15 }}>
                                    <View style={styles.historyHeader}>
                                        <Text style={styles.historyType}>{item.type}</Text>
                                        <Text style={styles.historyDate}>
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Text style={styles.historyLocation}>{item.location?.address || 'Location Hidden'}</Text>
                                    <View style={[styles.statusTag, { backgroundColor: item.status === 'Active' ? COLORS.error : COLORS.success }]}>
                                        <Text style={styles.statusTagText}>{item.status}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyHistory}>No emergency alerts history found.</Text>
                    )}
                </View>

                <GradientButton
                    title="Call 911 (Police)"
                    colors={['#FF5252', '#D32F2F']}
                    onPress={() => { }}
                    style={{ marginTop: 20 }}
                />
            </ScrollView>
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
        paddingBottom: 40,
    },
    statusCard: {
        padding: 20,
        marginBottom: 30,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.midnight,
    },
    statusSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    resolveButton: {
        marginTop: 15,
        backgroundColor: COLORS.error,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    resolveText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    mainEmergency: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
    },
    sosOuter: {
        width: 260,
        height: 260,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sosButton: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: COLORS.error,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
        zIndex: 2,
    },
    pulseCircle: {
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: COLORS.error,
        opacity: 0.2,
        zIndex: 1,
    },
    sosText: {
        fontSize: 44,
        fontWeight: '900',
        color: COLORS.white,
    },
    sosSub: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 5,
        fontWeight: '600',
    },
    infoSection: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.midnight,
        marginBottom: 15,
    },
    contactCard: {
        padding: 15,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    contactName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.midnight,
    },
    contactPhone: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    callIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E0F2F1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    historySection: {
        marginTop: 30,
    },
    historyItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        ...SHADOWS.light,
    },
    historyIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    historyType: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.midnight,
    },
    historyDate: {
        fontSize: 10,
        color: COLORS.textTertiary,
    },
    historyLocation: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginVertical: 4,
    },
    statusTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 10,
    },
    statusTagText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    emptyHistory: {
        textAlign: 'center',
        color: COLORS.textTertiary,
        marginVertical: 20,
    }
});

export default EmergencyScreen;
