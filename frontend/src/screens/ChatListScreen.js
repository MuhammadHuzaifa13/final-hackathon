import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS, ROUTES } from '../constants';
import { chatService } from '../services';
import Animated, { FadeInRight } from 'react-native-reanimated';

const ChatListScreen = ({ navigation }) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchChats();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchChats = async () => {
        try {
            const response = await chatService.getChats();
            setChats(response.data);
        } catch (error) {
            console.error('Fetch Chats Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredChats = chats.filter(chat =>
        chat.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderChatItem = ({ item, index }) => (
        <Animated.View entering={FadeInRight.delay(index * 100)}>
            <TouchableOpacity
                style={styles.chatCard}
                onPress={() => navigation.navigate('ChatDetail', {
                    partnerId: item.partnerId,
                    partnerName: item.partnerName,
                    specialization: item.specialization
                })}
            >
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Icon name="person" size={30} color={COLORS.primary} />
                    </View>
                    {!item.isRead && item.partnerId !== 'User' && <View style={styles.unreadDot} />}
                </View>

                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.partnerName}>{item.partnerName}</Text>
                        <Text style={styles.chatTime}>
                            {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <Text style={styles.specialization}>{item.specialization}</Text>
                    <Text style={[styles.lastMessage, !item.isRead && styles.unreadMessage]} numberOfLines={1}>
                        {item.lastMessage}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
                    <Icon name="arrow-back" size={24} color={COLORS.midnight} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Messages</Text>
                <TouchableOpacity style={styles.iconCircle}>
                    <Icon name="more-vert" size={24} color={COLORS.midnight} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="search" size={20} color={COLORS.textTertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator style={{ marginTop: 50 }} color={COLORS.primary} size="large" />
                ) : (
                    <FlatList
                        data={filteredChats}
                        renderItem={renderChatItem}
                        keyExtractor={item => item.partnerId}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Icon name="chat-bubble-outline" size={80} color={COLORS.border} />
                                <Text style={styles.emptyText}>No conversations found</Text>
                                <Text style={styles.emptySubtext}>Your messages with doctors will appear here.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            <TouchableOpacity style={styles.fab} onPress={() => { }}>
                <Icon name="message" size={24} color={COLORS.white} />
            </TouchableOpacity>
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
    searchContainer: {
        padding: SIZES.lg,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 50,
        ...SHADOWS.light,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: COLORS.midnight,
    },
    content: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: 100,
    },
    chatCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        ...SHADOWS.light,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E0F2F1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadDot: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: COLORS.primary,
        borderWidth: 2,
        borderColor: COLORS.surface,
    },
    chatInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    partnerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.midnight,
    },
    chatTime: {
        fontSize: 12,
        color: COLORS.textTertiary,
    },
    specialization: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
        marginTop: 2,
    },
    lastMessage: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 5,
    },
    unreadMessage: {
        color: COLORS.midnight,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.midnight,
        marginTop: 15,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    }
});

export default ChatListScreen;
