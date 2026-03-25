import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function WithdrawSuccessScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { amount, netAmount, bankName, accountNumber } = route.params || {};

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.successIconBox}>
                    <Text style={styles.successIcon}>🎉</Text>
                </View>

                <Text style={styles.title}>ส่งคำขอถอนเงินสำเร็จ</Text>
                <Text style={styles.subtitle}>ระบบกำลังดำเนินการตรวจสอบรายการของคุณ</Text>

                <View style={styles.card}>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>ยอดที่ถอน:</Text>
                        <Text style={styles.value}>฿{amount?.toLocaleString()}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>รับสุทธิ:</Text>
                        <Text style={styles.valuePrimary}>฿{netAmount?.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.detailRow, { marginTop: 12, borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 12 }]}>
                        <Text style={styles.label}>ไปยัง:</Text>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.bankName}>{bankName}</Text>
                            <Text style={styles.accountNumber}>{accountNumber}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>เงินจะเข้าภายใน 1-24 ชั่วโมง</Text>
                    <Text style={styles.subInfoText}>คุณสามารถตรวจสอบสถานะได้ที่ประวัติการถอนเงิน</Text>
                </View>

                <TouchableOpacity 
                    style={styles.historyButton}
                    onPress={() => {
                        // For now navigate back, as history screen might not be implemented yet
                        navigation.navigate('Profile');
                    }}
                >
                    <Text style={styles.historyButtonText}>ดูประวัติการถอน</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.doneButton}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Text style={styles.doneButtonText}>กลับหน้าหลัก</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successIconBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successIcon: {
        fontSize: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1A5F2A',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        fontWeight: '600',
        marginBottom: 40,
        textAlign: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: '#F9FBF9',
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
    },
    value: {
        fontSize: 16,
        color: '#333',
        fontWeight: '700',
    },
    valuePrimary: {
        fontSize: 20,
        color: '#C5A021',
        fontWeight: '900',
    },
    bankName: {
        fontSize: 15,
        color: '#333',
        fontWeight: '800',
    },
    accountNumber: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
    },
    infoBox: {
        alignItems: 'center',
        marginBottom: 48,
    },
    infoText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A5F2A',
        marginBottom: 4,
    },
    subInfoText: {
        fontSize: 13,
        color: '#999',
        fontWeight: '500',
    },
    historyButton: {
        width: '100%',
        backgroundColor: '#F5F5F5',
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
        marginBottom: 12,
    },
    historyButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '800',
    },
    doneButton: {
        width: '100%',
        backgroundColor: '#1A5F2A',
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
});
