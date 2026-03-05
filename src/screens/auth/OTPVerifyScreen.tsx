import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'OTPVerify'>;
    route: RouteProp<AuthStackParamList, 'OTPVerify'>;
};

export default function OTPVerifyScreen({ navigation, route }: Props) {
    const { role, phoneNumber } = route.params;
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = () => {
        if (otp.length < 6) {
            Alert.alert('กรุณากรอกรหัส OTP ให้ครบถ้วน');
            return;
        }
        // จำลองการตรวจสอบ
        navigation.navigate('Register', {
            role,
            phoneNumber,
        });
    };

    const handleResend = () => {
        setTimer(60);
        Alert.alert('ส่งรหัสใหม่', 'รหัส OTP ใหม่ถูกส่งไปยังหมายเลข ' + phoneNumber);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>กรอกรหัสยืนยัน</Text>
                    <Text style={styles.subtitle}>รหัส OTP ส่งไปที่ {phoneNumber}</Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        style={styles.otpInput}
                        placeholder="000000"
                        placeholderTextColor="rgba(0,0,0,0.2)"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                    />

                    <TouchableOpacity style={styles.actionButton} onPress={handleVerify}>
                        <Text style={styles.actionButtonText}>ยืนยันรหัส OTP</Text>
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
        backgroundColor: '#C5A021',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#C5A021',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
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
