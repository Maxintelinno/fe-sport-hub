import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { OwnerStackParamList } from '../../navigation/types';
import { generateQRCode, getPaymentStatus } from '../../services/paymentService';

type Props = {
    navigation: NativeStackNavigationProp<OwnerStackParamList, 'UpgradePayment'>;
    route: RouteProp<OwnerStackParamList, 'UpgradePayment'>;
};

type PaymentStatus = 'waiting' | 'pending' | 'verifying' | 'success' | 'expired';

export default function UpgradePaymentScreen({ navigation, route }: Props) {
    const { planName, price } = route.params;
    const [status, setStatus] = useState<PaymentStatus>('pending');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [qrCode, setQrCode] = useState<string>('');
    const [loadingQr, setLoadingQr] = useState(true);
    const [paymentId, setPaymentId] = useState<string | null>(null);

    const paramsRef = useRef({ planName, price, navigation });

    useEffect(() => {
        const fetchQRCode = async () => {
            try {
                setLoadingQr(true);
                // For plan upgrade, we use a different reference or standard one
                const response = await generateQRCode({
                    booking_id: `PLAN-${planName.toUpperCase()}-${Date.now().toString().slice(-6)}`,
                    amount: price.toFixed(2),
                    reference1: 'UPGRADE',
                    reference2: planName.toUpperCase()
                });
                
                setQrCode(response.qrCode);
                if (response.paymentId) setPaymentId(response.paymentId);
            } catch (error: any) {
                console.error('Error generating QR Code:', error);
                Alert.alert('ข้อผิดพลาด', 'ไม่สามารถสร้าง QR Code ได้ กรุณาลองใหม่อีกครั้ง');
            } finally {
                setLoadingQr(false);
            }
        };

        fetchQRCode();
    }, [planName, price]);

    // Polling for payment status
    useEffect(() => {
        if (!paymentId || (status !== 'pending' && status !== 'waiting' && status !== 'verifying')) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await getPaymentStatus(paymentId);
                const currentStatus = response.Status || (response as any).status;

                if (currentStatus === 'success' || currentStatus === 'paid') {
                    setStatus('success');
                    clearInterval(pollInterval);
                    navigation.navigate('UpgradeSuccess', {
                        planName,
                        paymentNo: response.PaymentNo || (response as any).payment_no || 'N/A'
                    });
                } else if (currentStatus === 'verifying') {
                    setStatus('verifying');
                } else if (currentStatus === 'failed' || currentStatus === 'expired') {
                    clearInterval(pollInterval);
                    setStatus('expired');
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [paymentId, status, navigation, planName]);

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
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSaveQR = () => {
        Alert.alert('บันทึกรูปภาพสำเร็จ', 'QR Code ถูกบันทึกลงในเครื่องของคุณแล้ว');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.title}>ชำระค่าสมาชิก</Text>
                    <Text style={styles.planNameText}>{planName}</Text>
                    
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>
                            {status === 'expired' ? '🔴 หมดเวลา' : status === 'verifying' ? '🟠 กำลังตรวจสอบ' : '🟡 รอการชำระเงิน'}
                        </Text>
                    </View>

                    {status === 'pending' && (
                        <Text style={styles.timerText}>⏳ กรุณาชำระเงินภายใน {formatTime(timeLeft)}</Text>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>ยอดชำระสุทธิ</Text>
                        <Text style={styles.priceValue}>฿{price.toLocaleString()}</Text>
                    </View>

                    <View style={styles.qrSection}>
                        {loadingQr ? (
                            <ActivityIndicator size="large" color="#1A5F2A" style={{ marginVertical: 40 }} />
                        ) : qrCode && status !== 'expired' ? (
                            <>
                                <Text style={styles.qrHint}>สแกน QR Code ด้วยแอปธนาคารทุกประเภท</Text>
                                <Image
                                    source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}` }}
                                    style={styles.qrImage}
                                />
                                <Text style={styles.thaiQRText}>Thai QR Payment</Text>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveQR}>
                                    <Text style={styles.saveBtnText}>📥 บันทึกรูปภาพ</Text>
                                </TouchableOpacity>
                            </>
                        ) : status === 'expired' && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>หมดเวลาชำระเงิน กรุณาลองใหม่อีกครั้ง</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.instructionBox}>
                        <Text style={styles.instructionTitle}>วิธีชำระเงิน:</Text>
                        <Text style={styles.instructionItem}>1. บันทึกรูปภาพ QR Code ลงในมือถือ</Text>
                        <Text style={styles.instructionItem}>2. เปิดแอปธนาคารและเลือก "สแกนจ่าย"</Text>
                        <Text style={styles.instructionItem}>3. เลือกรูปภาพ QR Code ที่บันทึกไว้</Text>
                        <Text style={styles.instructionItem}>4. ยืนยันการจ่าย (ระบบจะอัปเกรดให้อัตโนมัติ)</Text>
                    </View>

                    <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelBtnText}>ยกเลิกและกลับไปหน้าเดิม</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FBF9',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1A5F2A',
        textAlign: 'center',
    },
    planNameText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#444',
        textAlign: 'center',
        marginTop: 5,
    },
    statusBadge: {
        backgroundColor: '#f5f5f5',
        alignSelf: 'center',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 15,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#666',
    },
    timerText: {
        fontSize: 16,
        color: '#D32F2F',
        fontWeight: '800',
        textAlign: 'center',
        marginTop: 15,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 20,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    priceLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '700',
    },
    priceValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1A5F2A',
    },
    qrSection: {
        alignItems: 'center',
        backgroundColor: '#F9FBF9',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#eee',
    },
    qrHint: {
        fontSize: 13,
        color: '#666',
        marginBottom: 15,
        fontWeight: '600',
    },
    qrImage: {
        width: 220,
        height: 220,
        backgroundColor: '#fff',
    },
    thaiQRText: {
        marginTop: 15,
        fontSize: 16,
        fontWeight: '900',
        color: '#004677',
    },
    saveBtn: {
        backgroundColor: '#004677',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 15,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 14,
    },
    errorBox: {
        padding: 40,
        alignItems: 'center',
    },
    errorText: {
        color: '#D32F2F',
        fontWeight: '700',
        textAlign: 'center',
    },
    instructionBox: {
        marginTop: 25,
        backgroundColor: 'rgba(26, 95, 42, 0.03)',
        padding: 20,
        borderRadius: 18,
        borderLeftWidth: 4,
        borderLeftColor: '#1A5F2A',
    },
    instructionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#333',
        marginBottom: 10,
    },
    instructionItem: {
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
        fontWeight: '600',
    },
    cancelBtn: {
        marginTop: 25,
        padding: 15,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#999',
        fontWeight: '700',
        fontSize: 14,
    },
});
