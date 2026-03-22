import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { OwnerStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<OwnerStackParamList, 'TrialSuccess'>;
    route: RouteProp<OwnerStackParamList, 'TrialSuccess'>;
};

export default function TrialSuccessScreen({ navigation, route }: Props) {
    const { expiryDate } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Text style={styles.iconEmoji}>🎉</Text>
                </View>
                
                <Text style={styles.congratsTitle}>คุณเริ่มใช้งาน Pro แล้ว!</Text>
                
                <View style={styles.expiryBox}>
                    <Text style={styles.expiryLabel}>ทดลองใช้ฟรีถึง:</Text>
                    <Text style={styles.expiryDate}>📅 {expiryDate}</Text>
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity 
                        style={styles.primaryBtn} 
                        onPress={() => navigation.navigate('AddVenueTab' as any)}
                    >
                        <Text style={styles.primaryBtnText}>➕ เพิ่มสนามแรกของคุณ</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.secondaryBtn} 
                        onPress={() => navigation.navigate('RevenueDetail')}
                    >
                        <Text style={styles.secondaryBtnText}>📊 ดูรายได้รายวัน</Text>
                    </TouchableOpacity>
                </View>
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
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
        marginBottom: 30,
        borderWidth: 3,
        borderColor: '#1A5F2A',
    },
    iconEmoji: {
        fontSize: 60,
    },
    congratsTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1A5F2A',
        textAlign: 'center',
        marginBottom: 20,
    },
    expiryBox: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#eee',
        alignItems: 'center',
        marginBottom: 40,
    },
    expiryLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '700',
        marginBottom: 5,
    },
    expiryDate: {
        fontSize: 18,
        color: '#333',
        fontWeight: '900',
    },
    actionContainer: {
        width: '100%',
        gap: 15,
    },
    primaryBtn: {
        backgroundColor: '#1A5F2A',
        width: '100%',
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
        fontSize: 17,
        fontWeight: '900',
    },
    secondaryBtn: {
        backgroundColor: '#fff',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1A5F2A',
    },
    secondaryBtnText: {
        color: '#1A5F2A',
        fontSize: 17,
        fontWeight: '800',
    },
});
