import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Text as RNText } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings } from '../../services/bookingService';
import { Booking } from '../../types';

export default function MyBookingsScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const userId = user.id;
      const data = await getMyBookings(userId);
      setBookings(data);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      setErrorMsg(error.message || 'ไม่สามารถดึงข้อมูลการจองได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateStr.split('T')[0];
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '-';
    // API might return "18:00:00" or "18:00"
    return timeStr.substring(0, 5);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1a5f2a" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.container, styles.center]}>
        <RNText style={{ fontSize: 40, marginBottom: 16 }}>⚠️</RNText>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={fetchBookings}>
          <Text style={styles.browseBtnText}>ลองใหม่อีกครั้ง</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a5f2a" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <RNText style={{ fontSize: 40, marginBottom: 16 }}>📋</RNText>
            <Text style={styles.empty}>ยังไม่มีรายการจองในขณะนี้</Text>
            <TouchableOpacity 
                style={styles.browseBtn}
                onPress={() => {
                  // @ts-ignore - Browse route is handled by parent navigator
                  navigation.navigate('Browse');
                }}
            >
                <Text style={styles.browseBtnText}>ไปดูสนามต่างๆ</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.bookingNo}>หมายเลข: {item.booking_no}</Text>
                  <Text style={styles.date}>{formatDate(item.booking_date)}</Text>
                </View>
                <View style={[styles.badge, item.status === 'confirmed' || item.status === 'pending' ? styles.badgeActive : styles.badgeCancelled]}>
                  <Text style={styles.badgeText}>
                    {item.status === 'pending' ? 'รอดำเนินการ' : item.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ยกเลิก'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {item.items.map((subItem, idx) => (
                <View key={subItem.id || idx} style={styles.courtRow}>
                  <View style={styles.courtInfo}>
                    <Text style={styles.courtName}>{subItem.court_name || `รายการที่ ${idx + 1}`}</Text>
                    <Text style={styles.timeInfo}>
                      🕒 {formatTime(subItem.start_time)} - {formatTime(subItem.end_time)}
                    </Text>
                  </View>
                  <Text style={styles.courtPrice}>฿{subItem.total_amount}</Text>
                </View>
              ))}

              <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.paymentStatus}>
                        {item.payment_status === 'paid' ? '✅ ชำระเงินแล้ว' : '⏳ รอการชำระเงิน'}
                    </Text>
                </View>
                <View style={styles.totalBlock}>
                  <Text style={styles.priceLabel}>ราคาสุทธิ</Text>
                  <Text style={styles.price}>฿{item.total_amount}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await logout();
          // Reset navigation and go to main page
          navigation.reset({
            index: 0,
            routes: [{ name: 'Browse' as any }],
          });
        }}
      >
        <Text style={styles.logoutText}>ออกจากระบบ</Text>
      </TouchableOpacity>
    </View>
  );
}

// End of file

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faf8',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  empty: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    marginBottom: 20,
  },
  browseBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1a5f2a',
    borderRadius: 12,
  },
  browseBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#1a5f2a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#eef3ee',
  },
  cardBody: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingNo: {
    fontSize: 13,
    color: '#1a5f2a',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  courtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  courtInfo: {
    flex: 1,
  },
  courtName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  timeInfo: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  courtPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f8f8f8',
  },
  paymentStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  totalBlock: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a5f2a',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#e8f5e9',
  },
  badgeCancelled: {
    backgroundColor: '#ffebee',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2e7d32',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '700',
  },
});
