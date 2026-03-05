import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);

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
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                <View style={styles.logoContainer}>
                    <Text style={styles.logoEmoji}>⚽</Text>
                    {/* If you have a specific logo asset, you can use:
           <Image 
             source={require('../../assets/adaptive-icon.png')} 
             style={styles.logo} 
             resizeMode="contain" 
           /> 
           */}
                </View>
                <Text style={styles.title}>SPORT HUB</Text>
                <Text style={styles.subtitle}>Premium Sports Experience</Text>

                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.loadingText}>กำลังโหลด...</Text>
                </View>
            </Animated.View>

            <View style={styles.footer}>
                <Text style={styles.version}>Version 1.0.0</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a5f2a', // Premium dark green
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    logoContainer: {
        width: 120,
        height: 120,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    logoEmoji: {
        fontSize: 60,
    },
    logo: {
        width: 80,
        height: 80,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 4,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 16,
        color: '#e0e0e0',
        fontWeight: '500',
        letterSpacing: 1,
    },
    loaderContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.8,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
    },
    version: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        fontWeight: '600',
    },
});
