import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { verifyOTP, requestOTP, RateLimitError } from '../../services/authService';

const { width } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPasswordOTP'>;
    route: RouteProp<AuthStackParamList, 'ForgotPasswordOTP'>;
};

export default function ForgotPasswordOTPScreen({ navigation, route }: Props) {
    const { phoneNumber } = route.params;
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(60);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async () => {
        if (otp.length < 6) {
            Alert.alert('กรุณากรอกรหัส OTP ให้ครบถ้วน');
            return;
        }

        try {
            setLoading(true);
            await verifyOTP(phoneNumber, otp);
            navigation.navigate('ResetPassword', {
                phoneNumber,
            });
        } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด', error instanceof Error ? error.message : 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setLoading(true);
            await requestOTP(phoneNumber);
            setTimer(60);
            Alert.alert('ส่งรหัสใหม่', 'รหัส OTP ใหม่ถูกส่งไปยังหมายเลข ' + phoneNumber);
        } catch (error) {
            if (error instanceof RateLimitError) {
                Alert.alert('กรุณารอสักครู่', error.message);
            } else {
                Alert.alert('เกิดข้อผิดพลาด', error instanceof Error ? error.message : 'ไม่สามารถส่งรหัส OTP ได้ กรุณาลองใหม่อีกครั้ง');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>ยืนยันรหัส OTP</Text>
                    <Text style={styles.subtitle}>รหัส OTP ส่งไปที่ {phoneNumber}</Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        style={styles.otpInput}
                        placeholder="000000"
                        placeholderTextColor="rgba(0,0,0,0.1)"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                    />

                    <TouchableOpacity
                        style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                        onPress={handleVerify}
                        disabled={loading}
                    >
                        <Text style={styles.actionButtonText}>
                            {loading ? 'กำลังตรวจสอบ...' : 'ยืนยันรหัส OTP'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.resendContainer}>
                        {timer > 0 ? (
                            <Text style={styles.timerText}>ส่งรหัสใหม่ได้ใน {timer} วินาที</Text>
                        ) : (
                            <TouchableOpacity onPress={handleResend}>
                                <Text style={styles.resendText}>ส่งรหัสใหม่อีกครั้ง</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>
            <View style={styles.topGlow} />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FBF9',
    },
    scrollContent: {
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1A5F2A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#555',
        fontWeight: '600',
    },
    form: {
        width: '100%',
        alignItems: 'center',
    },
    otpInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(26, 95, 42, 0.2)',
        borderRadius: 20,
        padding: 20,
        fontSize: 40,
        color: '#1A5F2A',
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 10,
        width: '100%',
        marginBottom: 32,
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 8,
    },
    actionButton: {
        backgroundColor: '#1A5F2A',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    actionButtonDisabled: {
        opacity: 0.6,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
    },
    resendContainer: {
        marginTop: 32,
    },
    timerText: {
        color: '#888',
        fontSize: 15,
        fontWeight: '600',
    },
    resendText: {
        color: '#1A5F2A',
        fontSize: 15,
        fontWeight: '800',
        textDecorationLine: 'underline',
    },
    topGlow: {
        position: 'absolute',
        top: -150,
        left: -100,
        width: 300,
        height: 300,
        backgroundColor: '#1A5F2A',
        opacity: 0.03,
        borderRadius: 150,
    },
});
