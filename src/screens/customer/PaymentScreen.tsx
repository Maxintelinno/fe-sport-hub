import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CustomerStackParamList } from '../../navigation/types';

type Props = {
    navigation: NativeStackNavigationProp<CustomerStackParamList, 'Payment'>;
    route: RouteProp<CustomerStackParamList, 'Payment'>;
};

export default function PaymentScreen({ navigation, route }: Props) {
    const { bookingId, venueName, totalPrice } = route.params;

    const handleFinish = () => {
        Alert.alert('ชำระเงินสำเร็จ', 'เราได้รับยอดเงินของคุณเรียบร้อยแล้ว', [
            { text: 'ตกลง', onPress: () => navigation.popToTop() },
        ]);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.card}>
                <Text style={styles.title}>ชำระเงิน</Text>
                <Text style={styles.subtitle}>{venueName}</Text>
                <Text style={styles.bookingId}>Booking ID: {bookingId}</Text>

                <View style={styles.divider} />

                <View style={styles.priceRow}>
                    <Text style={styles.totalLabel}>ยอดที่ต้องชำระ</Text>
                    <Text style={styles.totalValue}>฿{totalPrice.toLocaleString()}</Text>
                </View>

                <View style={styles.qrContainer}>
                    <Text style={styles.qrLabel}>Scan QR Code เพื่อชำrateเงิน</Text>
                    <Image
                        source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PromptPay_Mock_Data' }}
                        style={styles.qrImage}
                    />
                    <Text style={styles.promptPayText}>PromptPay / QR Payment</Text>
                </View>

                <View style={styles.instructionCard}>
                    <Text style={styles.instructionTitle}>ขั้นตอนการชำระเงิน:</Text>
                    <Text style={styles.instructionText}>1. บันทึกรูปภาพ QR Code หรือสแกนจากหน้าจอนี้</Text>
                    <Text style={styles.instructionText}>2. เปิดแอปพลิเคชันธนาคารของคุณ</Text>
                    <Text style={styles.instructionText}>3. เลือกเมนูสแกนจ่าย และตรวจสอบยอดเงิน</Text>
                    <Text style={styles.instructionText}>4. เมื่อชำระเงินสำเร็จ ระบบจะแจ้งเตือนคุณ</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={handleFinish}>
                <Text style={styles.confirmButtonText}>แจ้งชำระเงินสำเร็จ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
            </TouchableOpacity>
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
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 20,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    totalLabel: {
        fontSize: 16,
        color: '#666',
    },
    totalValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1a5f2a',
    },
    qrContainer: {
        alignItems: 'center',
        backgroundColor: '#f9fcf9',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e8f0e8',
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
    promptPayText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '700',
        color: '#004677', // PromptPay Blue
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
});
