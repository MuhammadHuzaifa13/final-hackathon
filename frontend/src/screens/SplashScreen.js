import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, ROUTES } from '../constants';

const SplashScreen = ({ navigation }) => {
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.5);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            navigation.replace(ROUTES.WELCOME);
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" hidden />
            <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.gradient}
            >
                <Animated.View
                    style={[
                        styles.logoContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>M</Text>
                    </View>
                    <Text style={styles.appName}>MediCare</Text>
                    <Text style={styles.tagline}>Your Health, Our Priority</Text>
                </Animated.View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        marginBottom: 20,
    },
    logoText: {
        fontSize: 50,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    appName: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 8,
        fontWeight: '500',
    },
});

export default SplashScreen;
