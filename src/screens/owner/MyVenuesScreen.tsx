import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { getOwnerFields, updateFieldStatus } from '../../services/venueService';
import { getMockBookingsByVenue } from '../customer/BookingFormScreen';
import { Venue } from '../../types';
import { OwnerStackParamList } from '../../navigation/types';
import { useFocusEffect } from '@react-navigation/native';
import { RefreshControl } from 'react-native';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<OwnerStackParamList, 'MyVenues'>;
};

function VenueCard({
  venue,
  onPress,
  onToggle,
  onEdit,
  bookingCount,
}: {
  venue: Venue;
  onPress: () => void;
  onToggle: (id: string, currentStatus: string) => void;
  onEdit: (venue: Venue) => void;
  bookingCount: number;
}) {
  const isActive = venue.status === 'active';
  const isPending = venue.status === 'pending_review';
  const imageUrl = venue.images?.[0]?.image_url;

  return (
    <TouchableOpacity
      style={[styles.card, !isActive && styles.cardInactive]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, styles.imagePlaceholder]}>
            <Text style={styles.placeholderIcon}>🏟️</Text>
          </View>
        )}

        <View style={[styles.statusBadge, !isActive && !isPending && styles.statusBadgeInactive]}>
          <View style={[styles.statusDot, isPending ? styles.statusDotPending : (!isActive && styles.statusDotInactive)]} />
          <Text style={[styles.statusText, !isActive && !isPending && styles.statusTextInactive]}>
            {isPending ? 'รอกลั่นกรอง' : (isActive ? 'เปิดบริการ' : 'ปิดบริการ')}
          </Text>
        </View>

        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>฿{venue.price_per_hour}</Text>
          <Text style={styles.priceUnit}>/ชม.</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>{venue.sport_type}</Text>
          </View>
          <View style={styles.bookingBadge}>
            <Text style={styles.bookingBadgeText}>{bookingCount} จอง</Text>
          </View>
        </View>

        <Text style={styles.venueName} numberOfLines={1}>{venue.name}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
          <Text style={styles.infoText} numberOfLines={1}>
            {venue.address_line}, {venue.district}, {venue.province}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🕐</Text>
          <Text style={styles.infoText}>
            {venue.open_time} - {venue.close_time}
          </Text>
        </View>

        {/* Footer Actions */}
        <View style={styles.cardFooter}>
          <View style={styles.toggleContainer}>
            <Switch
              value={isActive}
              onValueChange={() => onToggle(venue.id, venue.status)}
              trackColor={{ false: '#ddd', true: '#b8e6c1' }}
              thumbColor={isActive ? '#1A5F2A' : '#999'}
              disabled={isPending}
            />
            <Text style={[styles.toggleLabel, (isPending || !isActive) && { color: '#999' }]}>
              {isActive ? 'เปิดจอง' : (isPending ? 'รอตรวจสอบ' : 'ปิดจอง')}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => onEdit(venue)}
            >
              <Text style={styles.editBtnIcon}>✏️</Text>
              <Text style={styles.editBtnText}>แก้ไข</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, !isActive && !isPending && styles.actionBtnInactive]} 
              onPress={onPress}
            >
              <Text style={styles.actionBtnText}>จัดการ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={[styles.goldAccent, !isActive && { backgroundColor: '#999' }]} />
    </TouchableOpacity>
  );
}

export default function MyVenuesScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [venues, setVenues] = React.useState<Venue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchVenues = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const venuesData = await getOwnerFields(user.id);
      setVenues(venuesData || []);
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchVenues();
    }, [fetchVenues])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVenues();
  }, [fetchVenues]);

  const handleToggleStatus = async (fieldId: string, currentStatus: string) => {
    if (!user?.id) return;
    
    if (currentStatus === 'pending_review') {
      Alert.alert('ขออภัย', 'ไม่สามารถเปลี่ยนสถานะได้ขณะรอการตรวจสอบ');
      return;
    }

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    setLoading(true);

    try {
      await updateFieldStatus(user.id, fieldId, newStatus);
      // Refresh after update as requested
      await fetchVenues();
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleEdit = (venue: Venue) => {
    navigation.navigate('EditVenue', { venue });
  };

  const activeCount = venues.filter(v => v.status === 'active' || v.status === 'pending_review').length;

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.welcomeText}>OWNER PRESTIGE</Text>
          <Text style={styles.headerTitle}>สนามของคุณ</Text>
        </View>
        <TouchableOpacity style={styles.profileCircle}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.goldDivider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{venues.length}</Text>
          <Text style={styles.statLabel}>ทั้งหมด</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{activeCount}</Text>
          <Text style={styles.statLabel}>เปิดอยู่</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#C5A021' }]}>฿{(venues.length * 1250).toLocaleString()}</Text>
          <Text style={styles.statLabel}>รายได้คาดการณ์</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={venues}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1A5F2A']}
            tintColor="#1A5F2A"
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptySubtitle}>กำลังโหลดข้อมูล...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIcon}>🏟️</Text>
              </View>
              <Text style={styles.emptyTitle}>คุณยังไม่เพิ่มสนาม</Text>
              <Text style={styles.emptySubtitle}>เริ่มสร้างรายได้ด้วยการเพิ่มสนามแข่งของคุณ</Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <VenueCard
            venue={item}
            onPress={() => navigation.navigate('VenueBookings', { venueId: item.id })}
            onToggle={handleToggleStatus}
            onEdit={handleEdit}
            bookingCount={getMockBookingsByVenue(item.id).length}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9',
  },
  header: {
    backgroundColor: '#1A5F2A',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 10,
    color: '#C5A021',
    fontWeight: '900',
    letterSpacing: 2.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 33, 0.4)',
  },
  profileIcon: {
    fontSize: 20,
  },
  goldDivider: {
    width: 30,
    height: 2,
    backgroundColor: '#C5A021',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 42, 0.05)',
  },
  cardInactive: {
    opacity: 0.8,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#f0f0f0', // Light gray background to see container
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#f0f7f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1A5F2A',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#1A5F2A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  priceUnit: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 2,
    fontWeight: '600',
  },
  cardContent: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sportBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sportBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1A5F2A',
    textTransform: 'uppercase',
  },
  bookingBadge: {
    backgroundColor: '#fff8e1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookingBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#C5A021',
  },
  venueName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfoLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A5F2A',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A5F2A',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1A5F2A',
  },
  editBtnIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  editBtnText: {
    color: '#1A5F2A',
    fontSize: 13,
    fontWeight: '800',
  },
  actionBtn: {
    backgroundColor: '#1A5F2A',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionBtnInactive: {
    backgroundColor: '#999',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  statusBadgeInactive: {
    backgroundColor: 'rgba(200,200,200,0.95)',
  },
  statusDotInactive: {
    backgroundColor: '#999',
  },
  statusDotPending: {
    backgroundColor: '#C5A021',
  },
  statusTextInactive: {
    color: '#666',
  },
  goldAccent: {
    height: 4,
    backgroundColor: '#C5A021',
    opacity: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 33, 0.2)',
  },
  emptyIcon: {
    fontSize: 36,
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
    lineHeight: 20,
  },
});
