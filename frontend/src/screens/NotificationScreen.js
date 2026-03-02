import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { ROUTES, COLORS, SIZES, SHADOWS } from '../constants';
import { notificationService } from '../services';
import Animated, { FadeInLeft, FadeOutRight } from 'react-native-reanimated';

const NotificationScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getNotifications();
            setNotifications(response.data);
        } catch (error) {
            console.error('Fetch Notifications Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Mark Read Error:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error('Delete Notification Error:', error);
        }
    };

    const handleClearAll = async () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm("Are you sure you want to mark all as read?");
            if (confirmed) {
                try {
                    await notificationService.markAllRead();
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                } catch (error) {
                    console.error('Clear All Error:', error);
                }
            }
            return;
        }

        Alert.alert(
            "Clear Notifications",
            "Are you sure you want to mark all as read?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Mark All",
                    onPress: async () => {
                        try {
                            await notificationService.markAllRead();
                            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                        } catch (error) {
                            console.error('Clear All Error:', error);
                        }
                    }
                }
            ]
        );
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Medication': return { name: 'medication', color: '#4CAF50' };
            case 'Appointment': return { name: 'event', color: '#2196F3' };
            case 'Vital Alert': return { name: 'favorite', color: '#FF5252' };
            case 'Message': return { name: 'message', color: '#7C4DFF' };
            default: return { name: 'notifications', color: '#FFA000' };
        }
    };

    const renderItem = ({ item, index }) => {
        const iconInfo = getIcon(item.type);
        return (
            <Animated.View
                entering={FadeInLeft.delay(index * 100)}
                exiting={FadeOutRight}
            >
                <TouchableOpacity
                    style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
                    onPress={() => handleMarkAsRead(item._id)}
                >
                    <View style={[styles.iconBox, { backgroundColor: iconInfo.color + '15' }]}>
                        <Icon name={iconInfo.name} size={24} color={iconInfo.color} />
                    </View>

                    <View style={styles.contentBox}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.time}>
                                {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </Text>
                        </View>
                        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(item._id)}
                    >
                        <Icon name="close" size={20} color={COLORS.textTertiary} />
                    </TouchableOpacity>

                    {!item.isRead && <View style={styles.unreadStatusMark} />}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
                    <Icon name="arrow-back" size={24} color={COLORS.midnight} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={handleClearAll}>
                    <Text style={styles.clearText}>Mark All Read</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator style={{ marginTop: 50 }} color={COLORS.primary} size="large" />
                ) : (
                    <FlatList
                        data={notifications}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContainer}
                        refreshing={refreshing}
                        onRefresh={fetchNotifications}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Icon name="notifications-none" size={100} color={COLORS.border} />
                                <Text style={styles.emptyText}>All caught up!</Text>
                                <Text style={styles.emptySubtext}>Your notifications and alerts will appear here.</Text>
                            </View>
                        }
                    />
                )}
            </View>
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
    clearText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    listContainer: {
        padding: SIZES.lg,
        paddingBottom: 40,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        ...SHADOWS.light,
        alignItems: 'center',
        position: 'relative',
    },
    unreadCard: {
        backgroundColor: '#F0F7F7',
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentBox: {
        flex: 1,
        marginLeft: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.midnight,
    },
    time: {
        fontSize: 11,
        color: COLORS.textTertiary,
    },
    message: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
        lineHeight: 18,
    },
    deleteBtn: {
        padding: 5,
        marginLeft: 10,
    },
    unreadStatusMark: {
        position: 'absolute',
        top: 10,
        left: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.midnight,
        marginTop: 20,
    },
    emptySubtext: {
        fontSize: 15,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 40,
    }
});

export default NotificationScreen;
