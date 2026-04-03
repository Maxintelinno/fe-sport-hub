import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, scaleAnim]);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            {/* Background Gradient */}
            <LinearGradient
                colors={['#093418', '#1A5F2A']}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative Background Shapes */}
            <View style={[styles.bgCurve, styles.bgCurveTop]} />
            <View style={[styles.bgCurve, styles.bgCurveBottom]} />

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                {/* Logo Container */}
                <View style={styles.logoContainer}>
                    <Image 
                      source={require('../assets/icon.png')} 
                      style={styles.logo} 
                      resizeMode="contain" 
                    /> 
                </View>

                {/* Branding Text */}
                <View style={styles.brandingContainer}>
                    <Text style={styles.sportText}>SPORT</Text>
                    <View style={styles.hubContainer}>
                        <View style={styles.decorationLine} />
                        <Text style={styles.hubText}>HUB</Text>
                        <View style={styles.decorationLine} />
                    </View>
                </View>

                <Text style={styles.tagline}>BOOK • PLAY • ENJOY</Text>

                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color="#ffffff" />
                </View>
            </Animated.View>

            <View style={styles.footer}>
                <Text style={styles.footerTagline}>1200K • PLAY • ENJOY</Text>
                <Text style={styles.version}>Version 1.0.0</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#093418',
    },
    bgCurve: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    bgCurveTop: {
        top: -width * 0.8,
        left: -width * 0.4,
    },
    bgCurveBottom: {
        bottom: -width * 0.8,
        right: -width * 0.4,
    },
    content: {
        alignItems: 'center',
        zIndex: 1,
    },
    logoContainer: {
        width: 140,
        height: 140,
        backgroundColor: '#FFFFFF',
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    logo: {
        width: 90,
        height: 90,
    },
    brandingContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    sportText: {
        fontSize: 54,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 2,
        lineHeight: 60,
    },
    hubContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    decorationLine: {
        height: 2,
        flex: 1,
        minWidth: 40,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 10,
        opacity: 0.8,
    },
    hubText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#2ECC71', // Vibrant Hub Green
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
        letterSpacing: 4,
        marginTop: 10,
        opacity: 0.9,
    },
    loaderContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
    },
    footerTagline: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    version: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 11,
        fontWeight: '600',
    },
});
