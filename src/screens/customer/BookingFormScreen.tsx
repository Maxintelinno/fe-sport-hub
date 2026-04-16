import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CustomerStackParamList } from '../../navigation/types';
import { getFieldById } from '../../services/venueService';
import { createBooking, checkoutCreditPreview } from '../../services/bookingService';
import { Venue, Court } from '../../types';
import { useAuth } from '../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<CustomerStackParamList, 'BookingForm'>;
  route: RouteProp<CustomerStackParamList, 'BookingForm'>;
};

export default function BookingFormScreen({ navigation, route }: Props) {
  const { venueId, courtId, courtName, date, selectedSlots, pricePerHour } = route.params;
  const { user } = useAuth();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [creditPreview, setCreditPreview] = useState<{
    total_amount: number;
    credit_balance: number;
    credit_to_use: number;
    remaining_to_pay: number;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatThaiDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const hours = selectedSlots.length;
  const totalPrice = pricePerHour * hours;

  useEffect(() => {
    fetchData();
  }, [venueId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [venueData, creditData] = await Promise.all([
        getFieldById(venueId),
        checkoutCreditPreview(totalPrice)
      ]);
      setVenue(venueData);
      setCreditPreview(creditData);
    } catch (error: any) {
      console.error('Error fetching data for booking:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1a5f2a" />
        <Text style={styles.loadingText}>กำลังสร้างรายการ...</Text>
      </View>
    );
  }

  if (!venue || !user || !creditPreview) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>ไม่สามารถเตรียมการจองได้</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>กลับไปแก้ไข</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleConfirm = async () => {
    try {
      setBookingLoading(true);

      // Create Booking
      console.log('Creating booking for court:', courtId);
      const bookingResponse = await createBooking({
        user_id: user.id,
        field_id: venue.id,
        booking_date: date,
        note: 'จองล่วงหน้า',
        items: selectedSlots.map(slot => ({
          court_id: courtId,
          start_time: slot.start,
          end_time: slot.end
        }))
      });

      console.log('Booking created successfully:', bookingResponse.booking_no);

      navigation.replace('Payment', {
        bookingId: bookingResponse.id,
        venueName: venue.name,
        totalPrice: creditPreview.remaining_to_pay,
        originalPrice: totalPrice,
        bookingNo: bookingResponse.booking_no
      });
    } catch (error: any) {
      console.error('Booking Error:', error);
      Alert.alert('การจองผิดพลาด', error.message || 'เกิดข้อผิดพลาดในการจอง');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.venueName}>{venue.name}</Text>
        <Text style={styles.courtNameLabel}>สนามย่อย: {courtName}</Text>
        <View style={styles.goldDivider} />

        <View style={styles.row}>
          <Text style={styles.label}>วันที่</Text>
          <Text style={styles.value}>{formatThaiDate(date)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>เวลา</Text>
          <View style={{ alignItems: 'flex-end' }}>
            {selectedSlots.map((slot, index) => (
              <Text key={index} style={styles.value}>{slot.label}</Text>
            ))}
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>จำนวนชั่วโมง</Text>
          <Text style={styles.value}>{hours} ชม.</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ราคาต่อชั่วโมง</Text>
          <Text style={styles.value}>฿{pricePerHour}</Text>
        </View>

        {/* Total Original Price */}
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Text style={styles.label}>ราคารวม</Text>
          <Text style={styles.value}>฿{totalPrice}</Text>
        </View>

        {/* Credit Section */}
        <View style={styles.creditContainer}>
          <View style={styles.creditRow}>
            <Text style={styles.creditLabel}>ยอดเครดิตที่ใช้ได้</Text>
            <Text style={styles.creditValue}>฿{creditPreview.credit_balance.toLocaleString()}</Text>
          </View>
          <View style={styles.creditRow}>
            <Text style={styles.creditLabel}>เครดิตที่ใช้ครั้งนี้</Text>
            <Text style={styles.creditUsage}>- ฿{creditPreview.credit_to_use.toLocaleString()}</Text>
          </View>
        </View>

        {/* Remaining to Pay Row */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>ชำระยอดรวม</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.totalPrice}>฿{creditPreview.remaining_to_pay.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.timerHint}>⏳ เหลือเวลา {formatTime(timeLeft)}</Text>

        <TouchableOpacity
          style={[styles.button, bookingLoading && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={bookingLoading}
        >
          {bookingLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>ยืนยันและไปชำระเงิน</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerNote}>
          <Text style={styles.noteText}>* ไม่สามารถยกเลิกหลังชำระเงิน</Text>
          <Text style={styles.noteText}>* กรุณามาก่อนเวลา 10 นาที</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fbf9',
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  center: { justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  venueName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  courtNameLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  goldDivider: {
    width: 40,
    height: 3,
    backgroundColor: '#C5A021',
    alignSelf: 'center',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: { fontSize: 16, color: '#666', fontWeight: '600' },
  value: { fontSize: 16, fontWeight: '700', color: '#222' },
  totalRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f7f0',
    padding: 16,
    borderRadius: 16,
  },
  totalLabel: { fontSize: 18, fontWeight: '800', color: '#1a5f2a' },
  totalPrice: { fontSize: 24, fontWeight: '900', color: '#1a5f2a' },
  priceBreakdown: { fontSize: 12, color: '#4a7c59', fontWeight: '600', marginTop: -2 },
  timerHint: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#1a5f2a',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#1a5f2a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  footerNote: {
    marginTop: 20,
    alignItems: 'center',
  },
  noteText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginBottom: 4,
  },
  loadingText: { marginTop: 16, color: '#1a5f2a', fontWeight: 'bold' },
  errorText: { fontSize: 18, color: '#666', marginBottom: 20 },
  backBtn: { backgroundColor: '#1a5f2a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: 'bold' },
  creditContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  creditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  creditLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  creditValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
  },
  creditUsage: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '700',
  },
});
