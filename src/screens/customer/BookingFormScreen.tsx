import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CustomerStackParamList } from '../../navigation/types';
import { getVenueById } from '../../data/venueStore';
import { useAuth } from '../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<CustomerStackParamList, 'BookingForm'>;
  route: RouteProp<CustomerStackParamList, 'BookingForm'>;
};

// เก็บการจองใน memory (ต่อไปใช้ API)
let mockBookings: Array<{
  id: string;
  venueId: string;
  venueName: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  venueImage?: string;
}> = [];

export function getMockBookings(userId: string) {
  return mockBookings.filter((b) => b.userId === userId);
}

export function getMockBookingsByVenue(venueId: string) {
  return mockBookings.filter((b) => b.venueId === venueId);
}

export function addMockBooking(booking: (typeof mockBookings)[0]) {
  mockBookings.push(booking);
}

export default function BookingFormScreen({ navigation, route }: Props) {
  const { venueId, date, startTime, endTime } = route.params;
  const { user } = useAuth();
  const venue = getVenueById(venueId);

  if (!venue || !user) {
    return (
      <View style={styles.container}>
        <Text>ไม่พบข้อมูล</Text>
      </View>
    );
  }

  const startHour = parseInt(startTime.slice(0, 2), 10);
  const endHour = parseInt(endTime.slice(0, 2), 10);
  const hours = endHour - startHour;
  const totalPrice = venue.pricePerHour * hours;

  const handleConfirm = () => {
    const booking = {
      id: String(Date.now()),
      venueId: venue.id,
      venueName: venue.name,
      userId: user.id,
      date,
      startTime,
      endTime,
      totalPrice,
      status: 'confirmed' as const,
      createdAt: new Date().toISOString(),
      venueImage: venue.imageUrl || (venue.imageUrls && venue.imageUrls[0]),
    };
    addMockBooking(booking);

    Alert.alert('จองสำเร็จ', `กรุณาชำระเงินเพื่อยืนยันการจองสนาม ${venue.name}`, [
      {
        text: 'ไปหน้าชำระเงิน',
        onPress: () => navigation.navigate('Payment', {
          bookingId: booking.id,
          venueName: venue.name,
          totalPrice: totalPrice,
        })
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.venueName}>{venue.name}</Text>
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
        <Text style={styles.label}>ราคารวม</Text>
        <Text style={styles.totalPrice}>฿{totalPrice}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>ยืนยันการจอง</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f7f0',
    padding: 24,
  },
  venueName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: { fontSize: 16, color: '#666' },
  value: { fontSize: 16, fontWeight: '600', color: '#222' },
  totalPrice: { fontSize: 22, fontWeight: '700', color: '#1a5f2a' },
  button: {
    backgroundColor: '#1a5f2a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
