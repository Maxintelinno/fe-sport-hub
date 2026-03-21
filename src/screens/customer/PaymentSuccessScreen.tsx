import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CustomerStackParamList } from '../../navigation/types';

type Props = {
    navigation: NativeStackNavigationProp<CustomerStackParamList, 'PaymentSuccess'>;
    route: RouteProp<CustomerStackParamList, 'PaymentSuccess'>;
};

export default function PaymentSuccessScreen({ navigation, route }: Props) {
    const { venueName, totalPrice, paymentNo, bookingNo } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.successCard}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.successIcon}>✅</Text>
                    </View>
                    
                    <Text style={styles.successTitle}>จองสนามเรียบร้อย!</Text>
                    <Text style={styles.successSubtitle}>การชำระเงินของคุณได้รับการยืนยันแล้ว</Text>

                    <View style={styles.divider} />

                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>สนาม</Text>
                            <Text style={styles.detailValue}>{venueName}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Booking No</Text>
                            <Text style={styles.detailValue}>{bookingNo}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>เลขที่รายการ</Text>
                            <Text style={styles.detailValue}>{paymentNo}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>ยอดชำระทั้งสิ้น</Text>
                            <Text style={styles.totalValue}>฿{totalPrice.toLocaleString()}</Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.bookingsButton}
                        onPress={() => navigation.navigate('MyBookings' as any)}
                    >
                        <Text style={styles.bookingsButtonText}>ไปหน้าการจองของฉัน</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.homeButton}
                        onPress={() => navigation.navigate('VenueList')}
                    >
                        <Text style={styles.homeButtonText}>กลับหน้าหลัก</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f7f0',
    },
    content: {
        padding: 20,
        flexGrow: 1,
        justifyContent: 'center',
    },
    successCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successIcon: {
        fontSize: 40,
    },
    successTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1a5f2a',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 24,
    },
    detailsContainer: {
        width: '100%',
        marginBottom: 30,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#999',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
        marginLeft: 20,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1a5f2a',
    },
    bookingsButton: {
        backgroundColor: '#1a5f2a',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    bookingsButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    homeButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    homeButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});
