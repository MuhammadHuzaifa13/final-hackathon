import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, SHADOWS, SIZES } from '../constants';

const PremiumCard = ({ children, style, glass = false }) => {
    const CardContainer = (props) => (
        <View style={[styles.card, glass && styles.glassCard, style]}>
            {props.children}
        </View>
    );

    if (glass && Platform.OS !== 'web') {
        return (
            <BlurView intensity={20} style={[styles.card, style]}>
                {children}
            </BlurView>
        );
    }

    return <CardContainer>{children}</CardContainer>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.md,
        ...SHADOWS.medium,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
});

export default PremiumCard;
