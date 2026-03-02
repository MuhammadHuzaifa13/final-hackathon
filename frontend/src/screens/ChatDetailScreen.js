import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS, ROUTES } from '../constants';
import { chatService } from '../services';
import Animated, { FadeIn } from 'react-native-reanimated';

const ChatDetailScreen = ({ route, navigation }) => {
    const { partnerId, partnerName, specialization } = route.params;
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5s for new messages
        return () => clearInterval(interval);
    }, [partnerId]);

    const fetchMessages = async () => {
        try {
            const response = await chatService.getConversation(partnerId);
            setMessages(response.data);
        } catch (error) {
            console.error('Fetch Messages Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        setSending(true);
        try {
            await chatService.sendMessage({
                receiver: partnerId,
                receiverModel: 'Doctor',
                text: inputText.trim()
            });
            setInputText('');
            fetchMessages();
        } catch (error) {
            console.error('Send Message Error:', error);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isUser = item.senderModel === 'User';
        return (
            <Animated.View
                entering={FadeIn}
                style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.partnerBubble
                ]}
            >
                <Text style={[styles.messageText, isUser ? styles.userText : styles.partnerText]}>
                    {item.text}
                </Text>
                <Text style={[styles.messageTime, isUser ? styles.userTime : styles.partnerTime]}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={COLORS.midnight} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerName}>{partnerName}</Text>
                    <Text style={styles.headerStatus}>{specialization}</Text>
                </View>
                <TouchableOpacity style={styles.headerIcon}>
                    <Icon name="videocam" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerIcon}>
                    <Icon name="call" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {loading && messages.length === 0 ? (
                    <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} />
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.messageList}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    />
                )}
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputBar}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Icon name="add" size={24} color={COLORS.textTertiary} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator color={COLORS.white} size="small" />
                        ) : (
                            <Icon name="send" size={24} color={COLORS.white} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
        backgroundColor: COLORS.surface,
        ...SHADOWS.light,
    },
    backButton: {
        padding: 5,
    },
    headerInfo: {
        flex: 1,
        marginLeft: 15,
    },
    headerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.midnight,
    },
    headerStatus: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '500',
    },
    headerIcon: {
        padding: 8,
        marginLeft: 5,
    },
    content: {
        flex: 1,
    },
    messageList: {
        padding: SIZES.lg,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        marginBottom: 10,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
    },
    partnerBubble: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.surface,
        borderBottomLeftRadius: 4,
        ...SHADOWS.light,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    userText: {
        color: COLORS.white,
    },
    partnerText: {
        color: COLORS.midnight,
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    userTime: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    partnerTime: {
        color: COLORS.textTertiary,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    },
    attachButton: {
        padding: 8,
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 10,
        maxHeight: 100,
        fontSize: 15,
        color: COLORS.midnight,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.textTertiary,
    }
});

export default ChatDetailScreen;
