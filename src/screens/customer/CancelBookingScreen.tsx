import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CustomerStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { getCancelBookingDetail } from '../../services/bookingService';

type CancelBookingRouteProp = RouteProp<CustomerStackParamList, 'CancelBooking'>;

export default function CancelBookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<CancelBookingRouteProp>();
  const { bookingId } = route.params;

  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDetail();
  }, [bookingId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await getCancelBookingDetail(bookingId);
      setDetail(data);
    } catch (error: any) {
      console.error('Error fetching cancel detail:', error);
      Alert.alert('Error', error.message || 'Could not fetch cancellation details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!user?.phone) {
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่พบข้อมูลเบอร์โทรศัพท์ของคุณ');
        return;
    }

    navigation.navigate('ValidatePin', { 
        bookingId, 
        phone: user.phone 
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a5f2a" />
        <Text style={styles.loadingText}>กำลังดึงข้อมูล...</Text>
      </View>
    );
  }

  if (!detail) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => time.substring(0, 5);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Header Summary Card */}
        <View style={styles.headerCard}>
          <Text style={styles.bookingNoLabel}>หมายเลขการจอง</Text>
          <Text style={styles.bookingNo}>{detail.booking_no}</Text>
          <View style={styles.dateRow}>
            <Text style={styles.dateEmoji}>📅</Text>
            <Text style={styles.dateText}>{formatDate(detail.booking_date)}</Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>รายละเอียดสนาม</Text>
          <View style={styles.courtsContainer}>
            {detail.courts.map((court: any, index: number) => (
              <View key={index} style={styles.courtRow}>
                <View style={styles.courtBadge} />
                <View style={styles.courtInfo}>
                  <Text style={styles.courtName}>{court.court_name || 'สนามกีฬาทั่วไป'}</Text>
                  <Text style={styles.courtTime}>
                    🕒 {formatTime(court.start_time)} - {formatTime(court.end_time)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Refund Policy Card */}
        <View style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <Text style={styles.policyTitle}>นโยบายการคืนเงิน</Text>
            <View style={[styles.policyBadge, detail.refund_policy === 'full' ? styles.fullRefund : styles.partialRefund]}>
              <Text style={styles.policyBadgeText}>
                {detail.refund_policy === 'full' ? 'คืนเงินเต็มจำนวน' : 'คืนเงินบางส่วน'}
              </Text>
            </View>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>จำนวนเงินเครดิตการจอง:</Text>
            <Text style={styles.originalAmount}>฿{detail.total_amount.toLocaleString()}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.refundTotalRow}>
            <View>
              <Text style={styles.refundLabel}>ยอดเงินที่จะได้รับเครดิตการจอง</Text>
              <Text style={styles.refundPercent}>คิดเป็น {detail.refund_percent}% ของยอดทั้งหมด</Text>
            </View>
            <Text style={styles.refundAmount}>฿{detail.refund_amount.toLocaleString()}</Text>
          </View>

          {detail.hours_until_play < 24 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ แนะนำ: เหลือเวลาอีกเพียง {Math.floor(detail.hours_until_play)} ชม. จะถึงเวลาเล่น โปรดตรวจสอบความถูกต้อง
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.helperText}>
          การกดปุ่ม "ยืนยันการยกเลิก" จะถือว่าคุณยอมรับนโยบายการคืนเงินเข้าเครดิตการจองข้างต้น ยอดเงินจะถูกคืนตามเงื่อนไขที่กำหนด
        </Text>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.confirmButton, cancelling && styles.disabledButton]}
            onPress={handleConfirmCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>ยืนยันการยกเลิก</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={cancelling}
          >
            <Text style={styles.backButtonText}>กลับไปหน้าก่อนหน้า</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a5f2a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    color: '#1a5f2a',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8faf8',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  bookingNoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  bookingNo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a5f2a',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f8f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dateEmoji: {
    fontSize: 14,
    marginRight: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a5f2a',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
    marginBottom: 12,
    marginLeft: 4,
  },
  courtsContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  courtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  courtBadge: {
    width: 6,
    height: 30,
    backgroundColor: '#1a5f2a',
    borderRadius: 3,
    marginRight: 12,
  },
  courtInfo: {
    flex: 1,
  },
  courtName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#444',
  },
  courtTime: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  policyCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffebee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  policyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#333',
  },
  policyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fullRefund: {
    backgroundColor: '#e8f5e9',
  },
  partialRefund: {
    backgroundColor: '#fff3e0',
  },
  policyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2e7d32',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: '#777',
    fontWeight: '600',
  },
  originalAmount: {
    fontSize: 14,
    color: '#444',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  refundTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refundLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1a5f2a',
  },
  refundPercent: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },
  refundAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1a5f2a',
  },
  warningBox: {
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  warningText: {
    fontSize: 12,
    color: '#c62828',
    fontWeight: '600',
    lineHeight: 18,
  },
  helperText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  actions: {
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.7,
  },
  backButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '700',
  },
});
