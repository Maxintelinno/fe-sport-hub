import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { OwnerStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<OwnerStackParamList, 'UpgradeSuccess'>;
    route: RouteProp<OwnerStackParamList, 'UpgradeSuccess'>;
};

export default function UpgradeSuccessScreen({ navigation, route }: Props) {
    const { planName, paymentNo } = route.params;

    const handleDone = () => {
        // Navigate back to the main profile or refresh the state
        navigation.navigate('Profile');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Text style={styles.iconEmoji}>👑</Text>
                </View>
                
                <Text style={styles.congratsTitle}>ยินดีด้วย!</Text>
                <Text style={styles.congratsSubtitle}>คุณได้อัปเกรดเป็น {planName} เรียบร้อยแล้ว</Text>
                
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>หมายเลขการชำระเงิน</Text>
                        <Text style={styles.infoValue}>{paymentNo}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>สถานะ</Text>
                        <Text style={[styles.infoValue, { color: '#1A5F2A' }]}>ชำระเงินสำเร็จ</Text>
                    </View>
                </View>

                <View style={styles.benefitBox}>
                    <Text style={styles.benefitTitle}>สิ่งที่คุณจะได้รับตอนนี้:</Text>
                    <Text style={styles.benefitItem}>✨ ปลดล็อกรายงานขั้นสูง</Text>
                    <Text style={styles.benefitItem}>✨ แสดงสนามของคุณในหน้าแรก</Text>
                    <Text style={styles.benefitItem}>✨ เพิ่มยอดจองด้วยระบบโปรโมชัน</Text>
                </View>

                <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
                    <Text style={styles.doneBtnText}>เริ่มใช้งานฟีเจอร์ใหม่</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FBF9',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#C5A021',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
        marginBottom: 30,
        borderWidth: 2,
        borderColor: '#C5A021',
    },
    iconEmoji: {
        fontSize: 50,
    },
    congratsTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1A5F2A',
        marginBottom: 10,
    },
    congratsSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        fontWeight: '700',
        marginBottom: 40,
    },
    infoCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 30,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    infoLabel: {
        color: '#999',
        fontSize: 14,
        fontWeight: '600',
    },
    infoValue: {
        color: '#333',
        fontSize: 14,
        fontWeight: '800',
    },
    benefitBox: {
        width: '100%',
        backgroundColor: 'rgba(197, 160, 33, 0.05)',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(197, 160, 33, 0.1)',
        marginBottom: 40,
    },
    benefitTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#C5A021',
        marginBottom: 12,
    },
    benefitItem: {
        fontSize: 14,
        color: '#444',
        fontWeight: '700',
        marginBottom: 8,
    },
    doneBtn: {
        backgroundColor: '#1A5F2A',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    doneBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
});
