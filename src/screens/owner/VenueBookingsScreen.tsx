import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { OwnerStackParamList } from '../../navigation/types';
import { getVenueById } from '../../data/venueStore';

const { width } = Dimensions.get('window');

type Props = {
  route: RouteProp<OwnerStackParamList, 'VenueBookings'>;
};

function getStatusConfig(status: string) {
  switch (status) {
    case 'confirmed':
      return { label: 'ยืนยันแล้ว', color: '#1A5F2A', bg: '#e8f5e9', icon: '✅' };
    case 'pending':
      return { label: 'รอยืนยัน', color: '#C5A021', bg: '#fff8e1', icon: '⏳' };
    case 'cancelled':
      return { label: 'ยกเลิก', color: '#d32f2f', bg: '#ffebee', icon: '❌' };
    default:
      return { label: status, color: '#666', bg: '#f5f5f5', icon: '📋' };
  }
}

export default function VenueBookingsScreen({ route }: Props) {
  const { venueId } = route.params;
  const venue = getVenueById(venueId);
  const bookings: any[] = []; // In a real app, fetch from backend via venueId

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  if (!venue) {
    return (
      <View style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundIcon}>🔍</Text>
          <Text style={styles.notFoundText}>ไม่พบสนาม</Text>
        </View>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Venue Info Card */}
      <View style={styles.venueInfoCard}>
        <View style={styles.venueInfoLeft}>
          <Text style={styles.venueName} numberOfLines={1}>{venue.name}</Text>
          <Text style={styles.venueSport}>{venue.sportType}</Text>
        </View>
        <View style={styles.venueInfoRight}>
          <Text style={styles.venuePriceLabel}>ราคา/ชม.</Text>
          <Text style={styles.venuePrice}>฿{venue.pricePerHour}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{bookings.length}</Text>
          <Text style={styles.statLabel}>ทั้งหมด</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{confirmedCount}</Text>
          <Text style={styles.statLabel}>ยืนยัน</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#C5A021' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>รอยืนยัน</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#C5A021' }]}>฿{totalRevenue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>รายได้</Text>
        </View>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>รายการจอง</Text>
    </View>
  );

  const renderBookingCard = ({ item }: { item: any }) => {
    const statusConfig = getStatusConfig(item.status);
    return (
      <View style={styles.bookingCard}>
        {/* Left accent */}
        <View style={[styles.cardAccent, { backgroundColor: statusConfig.color }]} />

        <View style={styles.bookingContent}>
          {/* Top Row: Date & Status */}
          <View style={styles.bookingTopRow}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {/* Time Row */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeIcon}>🕐</Text>
            <Text style={styles.timeText}>{item.startTime} - {item.endTime}</Text>
          </View>

          {/* Bottom Row: Customer & Price */}
          <View style={styles.bookingBottomRow}>
            <View style={styles.customerInfo}>
              <Text style={styles.customerIcon}>👤</Text>
              <Text style={styles.customerName}>ลูกค้า #{item.userId.slice(-4)}</Text>
            </View>
            <Text style={styles.bookingPrice}>฿{item.totalPrice.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>📋</Text>
            </View>
            <Text style={styles.emptyTitle}>ยังไม่มีรายการจอง</Text>
            <Text style={styles.emptySubtitle}>
              รายการจองจะปรากฏที่นี่เมื่อลูกค้าทำการจองสนามนี้
            </Text>
          </View>
        }
        renderItem={renderBookingCard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },

  // Header
  headerSection: {
    marginBottom: 8,
  },
  venueInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#1A5F2A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  venueInfoLeft: {
    flex: 1,
  },
  venueName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  venueSport: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  venueInfoRight: {
    alignItems: 'flex-end',
  },
  venuePriceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  venuePrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#C5A021',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 42, 0.08)',
    shadowColor: '#1a5f2a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A5F2A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: 4,
  },

  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  // Booking Card
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 42, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardAccent: {
    width: 5,
  },
  bookingContent: {
    flex: 1,
    padding: 16,
  },
  bookingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  timeText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '600',
  },
  bookingBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  customerName: {
    fontSize: 14,
    color: '#777',
    fontWeight: '600',
  },
  bookingPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#C5A021',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f0f7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: 'rgba(197, 160, 33, 0.2)',
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A5F2A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },

  // Not Found
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
  },
});
