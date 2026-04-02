import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OwnerStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<OwnerStackParamList, 'OfflineBookingSuccess'>;

export default function OfflineBookingSuccessScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { 
    bookingNo, 
    venueName, 
    courtName, 
    date, 
    timeRange, 
    customerName, 
    totalPrice 
  } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.successIconContainer}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>บันทึกการจองสำเร็จ</Text>
          <Text style={styles.successSubtitle}>ระบบได้บันทึกข้อมูลการจองออฟไลน์เรียบร้อยแล้ว</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>สรุปรายละเอียด</Text>
          
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>หมายเลขการจอง</Text>
            <Text style={styles.infoValue}>{bookingNo}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>สนาม</Text>
            <Text style={styles.infoValue}>{venueName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>คอร์ท</Text>
            <Text style={styles.infoValue}>{courtName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>วันที่</Text>
            <Text style={styles.infoValue}>{date}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>เวลา</Text>
            <Text style={styles.infoValue}>{timeRange}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ชื่อลูกค้า</Text>
            <Text style={styles.infoValue}>{customerName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>ยอดรวมทั้งหมด</Text>
            <Text style={styles.totalValue}>฿{totalPrice}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.homeBtn}
          onPress={() => navigation.navigate('OwnerHome')}
        >
          <Text style={styles.homeBtnText}>กลับไปหน้าหลัก</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FBF9' },
  container: { padding: 24, alignItems: 'center' },
  successIconContainer: { alignItems: 'center', marginVertical: 32 },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A5F2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  checkIcon: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#1a1a1a', marginBottom: 8 },
  successSubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  summaryCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: 32,
  },
  summaryTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { fontSize: 14, color: '#666', fontWeight: '600' },
  infoValue: { fontSize: 14, color: '#1a1a1a', fontWeight: '800', textAlign: 'right', flex: 1, marginLeft: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  totalValue: { fontSize: 24, fontWeight: '900', color: '#1A5F2A' },
  homeBtn: {
    width: '100%',
    backgroundColor: '#1A5F2A',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  homeBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
