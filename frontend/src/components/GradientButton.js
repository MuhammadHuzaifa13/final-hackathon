import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants';

const GradientButton = ({
    onPress,
    title,
    colors = COLORS.primaryGradient,
    style,
    textStyle,
    loading = false,
    disabled = false,
    icon
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[styles.container, style, (disabled || loading) && styles.disabled]}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {loading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                    <>
                        {icon}
                        <Text style={[styles.text, textStyle]}>{title}</Text>
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 56,
        borderRadius: SIZES.radiusMd,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    gradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SIZES.lg,
        gap: 8,
    },
    text: {
        color: COLORS.white,
        fontSize: SIZES.fontMd,
        fontWeight: 'bold',
    },
    disabled: {
        opacity: 0.6,
    },
});

export default GradientButton;
