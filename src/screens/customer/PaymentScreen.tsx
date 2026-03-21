import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CustomerStackParamList } from '../../navigation/types';
import { generateQRCode, getPaymentStatus } from '../../services/paymentService';

type Props = {
    navigation: NativeStackNavigationProp<CustomerStackParamList, 'Payment'>;
    route: RouteProp<CustomerStackParamList, 'Payment'>;
};

type PaymentStatus = 'waiting' | 'pending' | 'verifying' | 'success' | 'expired';

export default function PaymentScreen({ navigation, route }: Props) {
    const { bookingId, venueName, totalPrice, bookingNo } = route.params;
    const [status, setStatus] = useState<PaymentStatus>('pending');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [qrCode, setQrCode] = useState<string>('');
    const [loadingQr, setLoadingQr] = useState(true);
    const [paymentId, setPaymentId] = useState<string | null>(null);

    // Use refs for stable access in polling to prevent interval restarts
    const paramsRef = useRef({ bookingId, venueName, totalPrice, bookingNo, navigation });

    useEffect(() => {
        paramsRef.current = { bookingId, venueName, totalPrice, bookingNo, navigation };
    }, [bookingId, venueName, totalPrice, bookingNo, navigation]);

    useEffect(() => {
        const fetchQRCode = async () => {
            try {
                setLoadingQr(true);
                const response = await generateQRCode({
                    booking_id: bookingId,
                    amount: totalPrice.toFixed(2),
                    reference1: bookingId.substring(0, 8).toUpperCase(),
                    reference2: 'SPORT-HUB'
                });
                
                setQrCode(response.qrCode);

                if (response.paymentId) {
                    setPaymentId(response.paymentId);
                } else {
                    console.error('Payment ID not found in generation response');
                }
            } catch (error: any) {
                console.error('Error generating QR Code:', error);
                Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถสร้าง QR Code ได้ กรุณาลองใหม่อีกครั้ง');
            } finally {
                setLoadingQr(false);
            }
        };

        fetchQRCode();
    }, [bookingId, totalPrice]);

    // Polling for payment status
    useEffect(() => {
        // Allow polling if status is 'pending', 'waiting' or 'verifying'
        if (!paymentId || (status !== 'pending' && status !== 'waiting' && status !== 'verifying')) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await getPaymentStatus(paymentId);
                const currentStatus = response.Status || (response as any).status;

                if (currentStatus === 'success' || currentStatus === 'paid') {
                    setStatus('success');
                    clearInterval(pollInterval);
                    setStatus('success');

                    const { bookingId: bId, venueName: vName, totalPrice: tPrice, navigation: nav } = paramsRef.current;

                    // Navigate to Success Screen
                    nav.navigate('PaymentSuccess', {
                        bookingId: bId,
                        venueName: vName,
                        totalPrice: tPrice,
                        paymentNo: response.PaymentNo || (response as any).payment_no || 'N/A',
                        bookingNo: bookingNo
                    });
                } else if (currentStatus === 'verifying') {
                    setStatus('verifying');
                } else if (currentStatus === 'failed' || currentStatus === 'expired') {
                    clearInterval(pollInterval);
                    setStatus('expired');
                } else if (currentStatus === 'pending' || currentStatus === 'waiting') {
                    setStatus('pending');
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 5000); // Poll every 5 seconds

        return () => {
            clearInterval(pollInterval);
        };
    }, [paymentId, status]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setStatus('expired');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [status]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSaveQR = () => {
        Alert.alert('บันทึกรูปภาพสำเร็จ', 'QR Code ถูกบันทึกลงในเครื่องของคุณแล้ว');
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'waiting':
            case 'pending': return '🟡 รอการชำระเงิน';
            case 'verifying': return '🟠 กำลังตรวจสอบ';
            case 'success': return '🟢 ชำระเงินสำเร็จ';
            case 'expired': return '🔴 หมดเวลาชำระเงิน';
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.card}>
                <Text style={styles.title}>ชำระเงิน</Text>
                <Text style={styles.subtitle}>{venueName}</Text>
                <Text style={styles.bookingId}>Booking No: {bookingNo}</Text>

                <View style={[styles.statusBadge, status === 'expired' && styles.expiredBadge]}>
                    <Text style={[styles.statusText, status === 'expired' && styles.expiredText]}>{getStatusIcon()}</Text>
                </View>

                {(status === 'waiting' || status === 'pending') && (
                    <Text style={styles.timerHint}>⏳ เหลือเวลา {formatTime(timeLeft)}</Text>
                )}

                <View style={styles.divider} />

                <View style={styles.priceContainer}>
                    <Text style={styles.totalLabel}>💰 ยอดที่ต้องชำระ</Text>
                    <Text style={styles.totalValue}>฿{totalPrice.toLocaleString()}</Text>
                </View>

                {status === 'success' ? (
                    <View style={styles.successCard}>
                        <Text style={styles.successTitle}>✅ ชำระเงินสำเร็จ</Text>
                        <Text style={styles.successText}>จองสนามเรียบร้อยแล้ว!</Text>
                        <TouchableOpacity
                            style={styles.bookingsButton}
                            onPress={() => navigation.navigate('MyBookings' as any)}
                        >
                            <Text style={styles.bookingsButtonText}>ไปหน้าการจองของฉัน</Text>
                        </TouchableOpacity>
                    </View>
                ) : status === 'expired' ? (
                    <View style={styles.expiredCard}>
                        <Text style={styles.expiredTitle}>ขออภัย เวลาชำระเงินหมดลงแล้ว</Text>
                        <Text style={styles.expiredSubtitle}>กรุณาทำรายการจองใหม่อีกครั้ง</Text>
                        <TouchableOpacity
                            style={styles.backToBookingButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backToBookingText}>กลับไปหน้าจอง</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.qrContainer}>
                            {status === 'verifying' ? (
                                <View style={styles.verifyingContainer}>
                                    <ActivityIndicator size="large" color="#1a5f2a" />
                                    <Text style={styles.verifyingText}>กำลังตรวจสอบการชำระเงิน...</Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.qrLabel}>Scan QR Code เพื่อชำระเงิน</Text>
                                    {loadingQr ? (
                                        <ActivityIndicator size="large" color="#1a5f2a" style={{ marginVertical: 40 }} />
                                    ) : qrCode ? (
                                        <Image
                                            source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}` }}
                                            style={styles.qrImage}
                                        />
                                    ) : (
                                        <View style={styles.qrErrorContainer}>
                                            <Text style={styles.qrErrorText}>ไม่สามารถดึงข้อมูล QR Code ได้</Text>
                                        </View>
                                    )}
                                    <Text style={styles.promptPayText}>PromptPay / QR Payment</Text>

                                    <TouchableOpacity style={styles.saveQRButton} onPress={handleSaveQR}>
                                        <Text style={styles.saveQRButtonText}>📥 บันทึกรูปภาพ</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>

                        {status !== 'verifying' && (
                            <View style={styles.instructionCard}>
                                <Text style={styles.instructionTitle}>ขั้นตอนการชำระเงิน:</Text>
                                <Text style={styles.instructionText}>1. กดปุ่มบันทึกรูปภาพ QR Code</Text>
                                <Text style={styles.instructionText}>2. เปิดแอปพลิเคชันธนาคารของคุณเพื่อสแกนจ่าย</Text>
                                <Text style={styles.instructionText}>3. ระบบจะตรวจสอบยอดเงินให้อัตโนมัติ</Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.cancelButtonText}>ยกเลิกรายการ</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f7f0',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1a5f2a',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    bookingId: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginTop: 4,
    },
    statusBadge: {
        backgroundColor: '#fafafa',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 16,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#555',
    },
    timerHint: {
        fontSize: 16,
        color: '#d32f2f',
        fontWeight: '800',
        textAlign: 'center',
        marginTop: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 20,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    totalLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    totalValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1a5f2a',
    },
    qrContainer: {
        alignItems: 'center',
        backgroundColor: '#f9fcf9',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e8f0e8',
        minHeight: 280,
        justifyContent: 'center',
    },
    verifyingContainer: {
        alignItems: 'center',
    },
    verifyingText: {
        marginTop: 16,
        fontSize: 15,
        color: '#1a5f2a',
        fontWeight: '600',
    },
    qrLabel: {
        fontSize: 14,
        color: '#444',
        marginBottom: 16,
        fontWeight: '600',
    },
    qrImage: {
        width: 200,
        height: 200,
        backgroundColor: '#fff',
    },
    qrErrorContainer: {
        width: 200,
        height: 200,
        backgroundColor: '#f8d7da',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    qrErrorText: {
        color: '#721c24',
        fontSize: 12,
        textAlign: 'center',
        padding: 10,
    },
    promptPayText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '700',
        color: '#004677',
    },
    instructionCard: {
        marginTop: 24,
        backgroundColor: '#fefefe',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#1a5f2a',
    },
    instructionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    instructionText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
        lineHeight: 18,
    },
    confirmButton: {
        backgroundColor: '#1a5f2a',
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#1a5f2a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    cancelButton: {
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelButtonText: {
        color: '#999',
        fontSize: 14,
        fontWeight: '600',
    },
    successCard: {
        backgroundColor: '#f0f9f1',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d4edda',
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1a5f2a',
        marginBottom: 10,
    },
    successText: {
        fontSize: 16,
        color: '#4a7c59',
        textAlign: 'center',
        marginBottom: 20,
    },
    bookingsButton: {
        backgroundColor: '#1a5f2a',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 12,
    },
    bookingsButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    saveQRButton: {
        backgroundColor: '#004677',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 16,
    },
    saveQRButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    expiredBadge: {
        backgroundColor: '#ffebee',
        borderColor: '#ffcdd2',
    },
    expiredText: {
        color: '#d32f2f',
    },
    expiredCard: {
        backgroundColor: '#fff5f5',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ffdee2',
    },
    expiredTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#d32f2f',
        marginBottom: 8,
    },
    expiredSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    backToBookingButton: {
        backgroundColor: '#d32f2f',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    backToBookingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
