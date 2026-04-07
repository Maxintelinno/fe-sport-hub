import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CustomerStackParamList } from '../../navigation/types';
import { validatePin } from '../../services/authService';
import { cancelBooking } from '../../services/bookingService';

const { width } = Dimensions.get('window');

type ValidatePinRouteProp = RouteProp<CustomerStackParamList, 'ValidatePin'>;

export default function ValidatePinScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<ValidatePinRouteProp>();
    const { bookingId, phone } = route.params;

    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    // Auto-validate when PIN reaches 6 digits
    useEffect(() => {
        if (pin.length === 6) {
            handleVerifyPin();
        }
    }, [pin]);

    const handleVerifyPin = async () => {
        try {
            setLoading(true);
            // 1. Validate PIN against the requested local endpoint
            await validatePin(phone, pin);
            
            // 2. Perform cancellation
            const response = await cancelBooking(bookingId);
            
            if (response.status === 'success') {
                Alert.alert('สำเร็จ', 'ยกเลิกการจองของคุณเรียบร้อยแล้ว');
                navigation.navigate('MyBookingsList');
            } else {
                throw new Error(response.message || 'ไม่สามารถยกเลิกการจองได้');
            }
        } catch (error: any) {
            Alert.alert('เกิดข้อผิดพลาด', error.message || 'PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
            setPin(''); // Reset PIN on error to allow retry
        } finally {
            setLoading(false);
        }
    };

    const handleNumberPress = (num: string) => {
        if (pin.length < 6 && !loading) {
            setPin(prev => prev + num);
        }
    };

    const handleDelete = () => {
        if (pin.length > 0 && !loading) {
            setPin(prev => prev.slice(0, -1));
        }
    };

    const renderDot = (index: number) => {
        const isActive = pin.length > index;
        return (
            <View key={index} style={[styles.dot, isActive && styles.dotActive]} />
        );
    };

    const KeypadButton = ({ value, label, isIcon }: { value?: string, label: string, isIcon?: boolean }) => (
        <TouchableOpacity 
            style={styles.keypadButton}
            onPress={() => value ? handleNumberPress(value) : (label === 'delete' ? handleDelete() : null)}
            disabled={loading}
        >
            {label === 'delete' ? (
                <Text style={styles.keypadIconText}>⌫</Text>
            ) : (
                <Text style={styles.keypadButtonText}>{label}</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header / Close Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Logo / Brand Placeholder */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>K+</Text>
                    </View>
                </View>

                <Text style={styles.title}>กรุณาใส่รหัสผ่าน</Text>

                {/* PIN Indicators */}
                <View style={styles.dotsContainer}>
                    {[0, 1, 2, 3, 4, 5].map(index => renderDot(index))}
                </View>

                {loading && (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator color="#1a5f2a" />
                        <Text style={styles.loadingText}>กำลังตรวจสอบ...</Text>
                    </View>
                )}
            </View>

            {/* Numeric Keypad */}
            <View style={styles.keypadContainer}>
                <View style={styles.keypadRow}>
                    <KeypadButton value="1" label="1" />
                    <KeypadButton value="2" label="2" />
                    <KeypadButton value="3" label="3" />
                </View>
                <View style={styles.keypadRow}>
                    <KeypadButton value="4" label="4" />
                    <KeypadButton value="5" label="5" />
                    <KeypadButton value="6" label="6" />
                </View>
                <View style={styles.keypadRow}>
                    <KeypadButton value="7" label="7" />
                    <KeypadButton value="8" label="8" />
                    <KeypadButton value="9" label="9" />
                </View>
                <View style={styles.keypadRow}>
                    <View style={styles.keypadButtonPlaceholder}>
                        {/* Biometric Placeholder */}
                        <Text style={styles.fingerprintEmoji}>🧬</Text>
                    </View>
                    <KeypadButton value="0" label="0" />
                    <KeypadButton label="delete" />
                </View>
            </View>

            <TouchableOpacity style={styles.forgotPinButton} onPress={() => Alert.alert('Forgot PIN', 'Please contact support or venue owner.')}>
                <Text style={styles.forgotPinText}>ลืมรหัสผ่าน</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: 50,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    closeButton: {
        padding: 5,
    },
    closeText: {
        fontSize: 22,
        color: '#d1d1d1',
        fontWeight: '300',
    },
    content: {
        alignItems: 'center',
        paddingTop: 10,
        marginBottom: 30,
    },
    logoContainer: {
        marginBottom: 15,
    },
    logoCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    logoText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1a5f2a',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        marginBottom: 25,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 12,
        height: 20,
        alignItems: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    dotActive: {
        backgroundColor: '#1a5f2a',
        borderColor: '#1a5f2a',
    },
    loaderContainer: {
        marginTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    loadingText: {
        fontSize: 13,
        color: '#1a5f2a',
        fontWeight: '600',
    },
    keypadContainer: {
        paddingHorizontal: 35,
        flex: 1,
        justifyContent: 'center',
    },
    keypadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    keypadButton: {
        width: width / 5,
        height: width / 5,
        borderRadius: width / 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f8f8f8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    keypadButtonPlaceholder: {
        width: width / 5,
        height: width / 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keypadButtonText: {
        fontSize: 24,
        fontWeight: '400',
        color: '#333',
    },
    keypadIconText: {
        fontSize: 22,
        color: '#444',
    },
    fingerprintEmoji: {
        fontSize: 22,
        opacity: 0.3,
    },
    forgotPinButton: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    forgotPinText: {
        fontSize: 15,
        color: '#1a5f2a',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
