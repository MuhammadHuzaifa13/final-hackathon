import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { ROUTES, COLORS, SIZES, SHADOWS } from '../constants';
import { symptomService } from '../services';
import Animated, { FadeIn } from 'react-native-reanimated';

const SymptomCheckerScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: "Hello! I'm your AI health assistant. Describe your symptoms, and I'll help you understand what might be going on.",
            isUser: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        try {
            const response = await symptomService.checkSymptoms(userMessage.text);
            const aiResponse = {
                id: (Date.now() + 1).toString(),
                text: response.data.response,
                isUser: false,
                severity: response.data.severity,
                recommendation: response.data.recommendation,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('Symptom Check Error:', error);
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item }) => (
        <Animated.View
            entering={FadeIn}
            style={[
                styles.messageBubble,
                item.isUser ? styles.userBubble : styles.aiBubble
            ]}
        >
            {!item.isUser && (
                <View style={styles.aiIconContainer}>
                    <Icon name="psychology" size={16} color={COLORS.primary} />
                </View>
            )}
            <View style={styles.messageContent}>
                <Text style={[styles.messageText, item.isUser ? styles.userText : styles.aiText]}>
                    {item.text}
                </Text>
                {item.recommendation && (
                    <View style={styles.recommendationBox}>
                        <Text style={styles.recommendationTitle}>Recommendation:</Text>
                        <Text style={styles.recommendationText}>{item.recommendation}</Text>
                        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
                            <Text style={styles.severityText}>{item.severity} Risk</Text>
                        </View>
                    </View>
                )}
                <Text style={styles.messageTime}>{item.time}</Text>
            </View>
        </Animated.View>
    );

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'Low': return COLORS.success;
            case 'Medium': return COLORS.warning || '#FF9800';
            case 'High': return COLORS.error;
            case 'Emergency': return '#D32F2F';
            default: return COLORS.textTertiary;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={COLORS.midnight} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>AI Symptom Checker</Text>
                    <View style={styles.onlineBadge}>
                        <View style={styles.dot} />
                        <Text style={styles.onlineText}>AI Online</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.historyButton} onPress={() => { }}>
                    <Icon name="history" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.chatList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={COLORS.primary} size="small" />
                    <Text style={styles.loadingText}>AI is analyzing...</Text>
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your symptoms..."
                        placeholderTextColor={COLORS.textTertiary}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || loading}
                    >
                        <Icon name="send" size={24} color={COLORS.white} />
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
    headerTitleContainer: {
        flex: 1,
        marginLeft: 15,
    },
    headerTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: 'bold',
        color: COLORS.midnight,
    },
    onlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.success,
        marginRight: 5,
    },
    onlineText: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    historyButton: {
        padding: 5,
    },
    chatList: {
        padding: SIZES.lg,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 12,
        borderRadius: 20,
        marginBottom: 15,
        flexDirection: 'row',
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.surface,
        borderBottomLeftRadius: 4,
        ...SHADOWS.light,
    },
    aiIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#E0F2F1',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        marginTop: 2,
    },
    messageContent: {
        flex: 1,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: COLORS.white,
    },
    aiText: {
        color: COLORS.midnight,
    },
    recommendationBox: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    recommendationTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.midnight,
        marginBottom: 4,
    },
    recommendationText: {
        fontSize: 13,
        color: COLORS.slate,
        lineHeight: 18,
    },
    severityBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
    },
    severityText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    messageTime: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.4)',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.xl,
        marginBottom: 10,
    },
    loadingText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        maxHeight: 100,
        color: COLORS.midnight,
        fontSize: 15,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.textTertiary,
    }
});

export default SymptomCheckerScreen;
