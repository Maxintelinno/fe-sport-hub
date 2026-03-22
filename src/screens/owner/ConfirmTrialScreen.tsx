import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OwnerStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<OwnerStackParamList, 'ConfirmTrial'>;
};

export default function ConfirmTrialScreen({ navigation }: Props) {
    
    const handleStartTrial = () => {
        // Calculate trial expiry (Today + 7 days)
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7);
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
        const expiryStr = expiry.toLocaleDateString('th-TH', options);

        navigation.navigate('TrialSuccess', { expiryDate: expiryStr });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.headerEmoji}>🎉</Text>
                    <Text style={styles.headerTitle}>เริ่มทดลองใช้ฟรี Pro 7 วัน</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>คุณจะได้รับ:</Text>
                    <View style={styles.benefitsList}>
                        <View style={styles.benefitItem}>
                            <Text style={styles.checkIcon}>✔</Text>
                            <Text style={styles.benefitText}>เพิ่มสนามไม่จำกัด</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Text style={styles.checkIcon}>✔</Text>
                            <Text style={styles.benefitText}>ดูรายงานรายได้</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Text style={styles.checkIcon}>✔</Text>
                            <Text style={styles.benefitText}>โปรโมทสนาม</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Text style={styles.checkIcon}>✔</Text>
                            <Text style={styles.benefitText}>แสดงในหน้าแรก</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>เงื่อนไข:</Text>
                    <View style={styles.conditionsBox}>
                        <Text style={styles.conditionText}>• ทดลองใช้ฟรี 7 วัน</Text>
                        <Text style={styles.conditionText}>• หลังจากนั้น ฿999/เดือน</Text>
                        <Text style={styles.conditionText}>• ยกเลิกได้ทุกเมื่อ</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleStartTrial}>
                        <Text style={styles.primaryBtnText}>🚀 เริ่มใช้ฟรีตอนนี้</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.secondaryBtnText}>ยกเลิก</Text>
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
        paddingBottom: 40,
    },
    header: {
        backgroundColor: '#1A5F2A',
        paddingVertical: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerEmoji: {
        fontSize: 50,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: -30,
        borderRadius: 30,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#333',
        marginBottom: 20,
    },
    benefitsList: {
        marginBottom: 10,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    checkIcon: {
        fontSize: 18,
        color: '#1A5F2A',
        fontWeight: '800',
        marginRight: 12,
    },
    benefitText: {
        fontSize: 16,
        color: '#444',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 20,
    },
    conditionsBox: {
        backgroundColor: '#FFF9F0',
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#FFECC7',
    },
    conditionText: {
        fontSize: 15,
        color: '#B45309',
        fontWeight: '700',
        marginBottom: 8,
    },
    footer: {
        paddingHorizontal: 20,
        marginTop: 30,
    },
    primaryBtn: {
        backgroundColor: '#1A5F2A',
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
    secondaryBtn: {
        marginTop: 15,
        padding: 15,
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#999',
        fontSize: 15,
        fontWeight: '700',
    },
});
