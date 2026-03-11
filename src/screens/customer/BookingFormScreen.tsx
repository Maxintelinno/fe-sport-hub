import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CustomerStackParamList } from '../../navigation/types';
import { getFieldById } from '../../services/venueService';
import { getCourtsByField, createCourt, createBooking } from '../../services/bookingService';
import { Venue, Court } from '../../types';
import { useAuth } from '../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<CustomerStackParamList, 'BookingForm'>;
  route: RouteProp<CustomerStackParamList, 'BookingForm'>;
};

export default function BookingFormScreen({ navigation, route }: Props) {
  const { venueId, date, startTime, endTime } = route.params;
  const { user } = useAuth();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchVenue();
  }, [venueId]);

  const fetchVenue = async () => {
    try {
      setLoading(true);
      const data = await getFieldById(venueId);
      setVenue(data);
    } catch (error: any) {
      console.error('Error fetching venue for booking:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลสนามได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1a5f2a" />
        <Text style={styles.loadingText}>กำลังเตรียมข้อมูลการจอง...</Text>
      </View>
    );
  }

  if (!venue || !user) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>ไม่สามารถเตรียมการจองได้</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>กลับไปแก้ไข</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startHour = parseInt(startTime.slice(0, 2), 10);
  const endHour = parseInt(endTime.slice(0, 2), 10);
  const hours = endHour - startHour;
  const pricePerHour = venue.price_per_hour || venue.pricePerHour || 0;
  const totalPrice = pricePerHour * hours;

  const handleConfirm = async () => {
    try {
      setBookingLoading(true);

      // 1. Check Courts
      console.log('Step 1: Checking courts for field:', venue.id);
      const courts = await getCourtsByField(venue.id);
      let targetCourt = courts.find(c => c.name === 'คอร์ท A1' || c.status === 'active');

      // 2. Create Court if not exists
      if (!targetCourt) {
        console.log('Step 2: Court not found, creating "คอร์ท A1"');
        targetCourt = await createCourt({
          field_id: venue.id,
          name: 'คอร์ท A1',
          price_per_hour: pricePerHour
        });
      }

      // 3. Create Booking
      console.log('Step 3: Creating booking for court:', targetCourt.id);
      const bookingResponse = await createBooking({
        user_id: user.id || 'bb1c049c-b134-426f-8a9d-8ca18a5aaaf3', // Use ID from request if local is empty
        field_id: venue.id,
        booking_date: date,
        note: 'จองล่วงหน้า',
        items: [
          {
            court_id: targetCourt.id,
            start_time: startTime,
            end_time: endTime
          }
        ]
      });

      console.log('Step 4: Booking created successfully:', bookingResponse.booking_no);
      
      Alert.alert('จองสำเร็จ', `การจองหมายเลข ${bookingResponse.booking_no} สำเร็จแล้ว`, [
        {
          text: 'ดูการจองของฉัน',
          onPress: () => navigation.navigate('MyBookings' as any)
        },
      ]);
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
        <View style={styles.goldDivider} />

        <View style={styles.row}>
          <Text style={styles.label}>วันที่</Text>
          <Text style={styles.value}>{date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>เวลา</Text>
          <Text style={styles.value}>{startTime} - {endTime}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>จำนวนชั่วโมง</Text>
          <Text style={styles.value}>{hours} ชม.</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ราคากลางต่อชั่วโมง</Text>
          <Text style={styles.value}>฿{pricePerHour}</Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>ราคารวม</Text>
          <Text style={styles.totalPrice}>฿{totalPrice}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, bookingLoading && { opacity: 0.7 }]} 
          onPress={handleConfirm}
          disabled={bookingLoading}
        >
          {bookingLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>ยืนยันการจอง</Text>
          )}
        </TouchableOpacity>
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
    marginBottom: 8,
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
  button: {
    backgroundColor: '#1a5f2a',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 32,
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
  loadingText: { marginTop: 16, color: '#1a5f2a', fontWeight: 'bold' },
  errorText: { fontSize: 18, color: '#666', marginBottom: 20 },
  backBtn: { backgroundColor: '#1a5f2a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: 'bold' },
});
