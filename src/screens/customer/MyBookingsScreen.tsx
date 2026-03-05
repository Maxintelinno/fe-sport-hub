import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getMockBookings } from './BookingFormScreen';

export default function MyBookingsScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const bookings = user ? getMockBookings(user.id) : [];

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>ยังไม่มีรายการจอง</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              {item.venueImage ? (
                <Image source={{ uri: item.venueImage }} style={styles.venueImage} />
              ) : (
                <View style={[styles.venueImage, styles.placeholderImage]}>
                  <Text style={styles.placeholderText}>ไม่มีรูป</Text>
                </View>
              )}
              <View style={styles.headerOverlay}>
                <View style={[styles.badge, item.status === 'confirmed' && styles.badgeConfirmed]}>
                  <Text style={styles.badgeText}>
                    {item.status === 'confirmed' ? 'ยืนยันแล้ว' : item.status}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.venueName}>{item.venueName}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📅</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🕒</Text>
                <Text style={styles.time}>{item.startTime} - {item.endTime}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.priceLabel}>ราคารวม</Text>
                <Text style={styles.price}>฿{item.totalPrice}</Text>
              </View>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          logout();
          // @ts-ignore
          navigation.navigate('Browse');
        }}
      >
        <Text style={styles.logoutText}>ออกจากระบบ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faf8',
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
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#edf2ed',
  },
  cardHeader: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  venueImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  headerOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  cardBody: {
    padding: 16,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  date: {
    fontSize: 14,
    color: '#555',
  },
  time: {
    fontSize: 14,
    color: '#555',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a5f2a',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  badgeConfirmed: {
    backgroundColor: '#2e7d32',
  },
  badgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});
