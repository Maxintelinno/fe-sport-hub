import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Dimensions, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CustomerStackParamList } from '../../navigation/types';
import { getFieldById } from '../../services/venueService';
import { getFieldAvailability, getCourtsByField } from '../../services/bookingService';
import { Venue, FieldAvailability, Court } from '../../types';
import { useAuth } from '../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<CustomerStackParamList, 'VenueDetail'>;
  route: RouteProp<CustomerStackParamList, 'VenueDetail'>;
};

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 210;

export default function VenueDetailScreen({ navigation, route }: Props) {
  const { venueId } = route.params;
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  console.log('VenueDetail - isLoggedIn:', isLoggedIn, 'user:', JSON.stringify(user));
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStart, setSelectedStart] = useState('');
  const [selectedEnd, setSelectedEnd] = useState('');
  const [availability, setAvailability] = useState<FieldAvailability | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [loadingCourts, setLoadingCourts] = useState(false);

  // Initialize selected date to today when venue loads
  useEffect(() => {
    if (venue && !selectedDate) {
      const today = new Date().toISOString().slice(0, 10);
      setSelectedDate(today);
    }
  }, [venue]);

  useEffect(() => {
    if (venueId && selectedDate) {
      fetchAvailability(venueId, selectedDate);
    }
  }, [venueId, selectedDate]);

  const fetchAvailability = async (id: string, date: string) => {
    try {
      setAvailabilityLoading(true);
      const data = await getFieldAvailability(id, date);
      setAvailability(data);
    } catch (error) {
      console.error('Error fetching availability:', error);
      // Don't show alert here to be less intrusive, just log it
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) {
        console.log('--- AUTH GUARD TRIGGERED --- Redirecting...');
        Alert.alert(
          'กรุณาเข้าสู่ระบบ',
          'กรุณาเข้าสู่ระบบเพื่อเข้าชมข้อมูลสนาม',
          [
            { text: 'ภายหลัง', onPress: () => navigation.goBack() },
            { 
              text: 'เข้าสู่ระบบ', 
              onPress: () => (navigation as any).navigate('Auth', { screen: 'Login', params: { role: 'cust' } }) 
            }
          ]
        );
        return;
      }
      console.log('--- AUTH GUARD PASSED --- Proceeding to fetch...');
      fetchVenueDetails();
      fetchCourts();
    }
  }, [venueId, authLoading, isLoggedIn]);

  const fetchCourts = async () => {
    try {
      setLoadingCourts(true);
      const data = await getCourtsByField(venueId);
      setCourts(data);
      if (data.length > 0) {
        setSelectedCourtId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching courts:', error);
    } finally {
      setLoadingCourts(false);
    }
  };

  const fetchVenueDetails = async () => {
    try {
      console.log('Fetching venue details for ID:', venueId);
      setLoading(true);
      const data = await getFieldById(venueId);
      console.log('Venue data received:', JSON.stringify(data, null, 2));
      setVenue(data);
    } catch (error: any) {
      console.error('Error fetching venue details:', error);
      console.log('Error Full Details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      const errorMessage = error.response?.data?.message || error.message || '';
      const status = error.response?.status;

      if (status === 401 || status === 403 || errorMessage.includes('Authorization')) {
          Alert.alert(
            'กรุณาเข้าสู่ระบบ',
            'ข้อมูลสนามนี้ต้องเข้าสู่ระบบเพื่อเข้าชม',
            [
              { text: 'ยกเลิก', onPress: () => navigation.goBack() },
              { text: 'เข้าสู่ระบบ', onPress: () => navigation.navigate('Auth' as any, { screen: 'Login', params: { role: 'cust' } }) }
            ]
          );
      } else if (status === 404 || errorMessage.includes('Not Found')) {
        Alert.alert('ไม่พบข้อมูล', 'ขออภัย ไม่พบข้อมูลสนามที่คุณต้องการในขณะนี้');
      } else {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลสนามได้ กรุณาลองใหม่ภายหลัง');
      }
    } finally {
      setLoading(false);
    }
  };
  const minPrice = useMemo(() => {
    const venuePrice = venue?.price_per_hour || venue?.pricePerHour || 0;
    if (courts.length === 0) return venuePrice;
    return Math.min(...courts.map(c => c.price_per_hour || 0));
  }, [courts, venue]);

  const getCourtStatus = (courtId: string) => {
    if (!availability) return { label: 'ข้อมูลไม่พร้อม', color: '#999', emoji: '⚪' };
    
    const courtAvail = availability.courts.find(c => c.court_id === courtId);
    if (!courtAvail) return { label: 'ว่าง', color: '#28a745', emoji: '🟢' };

    const bookedCount = TIME_SLOTS.filter(slot => {
      return courtAvail.booked_slots.some(booked => {
        const slotStart = slot;
        const bookedStart = booked.start_time.substring(0, 5);
        const bookedEnd = booked.end_time.substring(0, 5);
        return slotStart >= bookedStart && slotStart < bookedEnd;
      });
    }).length;

    const totalSlots = TIME_SLOTS.length;
    const freeSlots = totalSlots - bookedCount;

    if (freeSlots === 0) return { label: 'เต็ม', color: '#dc3545', emoji: '🔴' };
    if (freeSlots <= 3) return { label: 'เหลือน้อย', color: '#ffc107', emoji: '🟡' };
    return { label: 'ว่าง', color: '#28a745', emoji: '🟢' };
  };

  const images = useMemo(() => {
    if (!venue) return [];
    if (Array.isArray(venue.images) && venue.images.length > 0) {
        return venue.images
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(img => img.image_url);
    }
    if (venue.imageUrls?.length) return venue.imageUrls;
    if (venue.imageUrl) return [venue.imageUrl];
    return [];
  }, [venue]);

  if (loading || authLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1a5f2a" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูลสนาม...</Text>
      </View>
    );
  }

  if (!venue) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>ไม่พบสนาม</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>กลับไปหน้าหลัก</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle active status from API (status string)
  const isVenueActive = venue.status !== 'inactive' && venue.status !== 'pending_review';

  const isStartTimeBooked = (timeStr: string) => {
    if (!availability || !selectedCourtId) return false;
    
    const courtAvailability = availability.courts.find(c => c.court_id === selectedCourtId);
    if (!courtAvailability) return false;

    return courtAvailability.booked_slots.some(slot => {
        const slotStart = slot.start_time.substring(0, 5);
        const slotEnd = slot.end_time.substring(0, 5);
        return timeStr >= slotStart && timeStr < slotEnd;
    });
  };

  const isEndTimeBooked = (timeStr: string) => {
    if (!availability || !selectedCourtId) return false;
    
    const courtAvailability = availability.courts.find(c => c.court_id === selectedCourtId);
    if (!courtAvailability) return false;

    return courtAvailability.booked_slots.some(slot => {
        const slotStart = slot.start_time.substring(0, 5);
        const slotEnd = slot.end_time.substring(0, 5);
        return timeStr > slotStart && timeStr <= slotEnd;
    });
  };

  const isRangeBooked = (start: string, end: string) => {
    if (!availability) return false;
    
    // For every hour in the range, check if it's booked
    const startHour = parseInt(start.split(':')[0], 10);
    const endHour = parseInt(end.split(':')[0], 10);
    
    for (let i = startHour; i < endHour; i++) {
      const timeToCheck = `${i.toString().padStart(2, '0')}:00`;
      if (isStartTimeBooked(timeToCheck)) {
        return true;
      }
    }
    return false;
  };

  const handleBook = () => {
    if (!selectedCourtId || !selectedDate || !selectedStart || !selectedEnd) {
      Alert.alert('กรุณาเลือกสนาม วันที่ และเวลา');
      return;
    }

    if (isRangeBooked(selectedStart, selectedEnd)) {
      Alert.alert('เวลาไม่ว่าง', 'ช่วงเวลาที่คุณเลือกมีผู้จองไปแล้ว กรุณาเลือกเวลาอื่น');
      return;
    }

    const selectedCourt = courts.find(c => c.id === selectedCourtId);

    navigation.navigate('BookingForm', {
      venueId: venue.id,
      courtId: selectedCourtId,
      courtName: selectedCourt?.name || '',
      date: selectedDate,
      startTime: selectedStart,
      endTime: selectedEnd,
      pricePerHour: selectedCourt?.price_per_hour || 0
    });
  };

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  // Display fields mapping from API
  const venueName = venue.name;
  const venueSportType = venue.sport_type || venue.sportType;
  const venueDescription = venue.description;
  const venueAddress = venue.address_line || venue.address;
  const venueOpenTime = venue.open_time || venue.openingTime;
  const venueCloseTime = venue.close_time || venue.closingTime;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {images.length > 0 ? (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
          {images.map((uri, i) => (
            <Image key={`${uri}-${i}`} source={{ uri }} style={styles.heroImage} resizeMode="cover" />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>🏟️</Text>
        </View>
      )}

      <Text style={styles.sportType}>{venueSportType}</Text>
      <Text style={styles.name}>{venueName}</Text>
      <Text style={styles.description}>{venueDescription}</Text>
      <Text style={styles.address}>📍 {venueAddress}</Text>
      <Text style={styles.hours}>🕐 {venueOpenTime} - {venueCloseTime}</Text>
      {minPrice > 0 && <Text style={styles.price}>เริ่มต้น ฿{minPrice} / ชั่วโมง</Text>}

      {!isVenueActive ? (
        <View style={styles.closedBox}>
          <Text style={styles.closedTitle}>สนามปิดให้บริการชั่วคราว</Text>
          <Text style={styles.closedSub}>โปรดลองเลือกสนามอื่น หรือกลับมาใหม่ภายหลัง</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>เลือกสนาม / คอร์ท</Text>
          {loadingCourts ? (
            <ActivityIndicator size="small" color="#1a5f2a" style={{ marginVertical: 10 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courtsContainer}>
              {courts.map((court) => (
                <TouchableOpacity
                  key={court.id}
                  style={[
                    styles.courtCard,
                    selectedCourtId === court.id && styles.courtCardSelected
                  ]}
                  onPress={() => {
                    setSelectedCourtId(court.id);
                    setSelectedStart('');
                    setSelectedEnd('');
                  }}
                >
                  <Text style={[styles.courtName, selectedCourtId === court.id && styles.courtNameSelected]}>
                    {court.name}
                  </Text>
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusDot, { color: getCourtStatus(court.id).color }]}>
                      {getCourtStatus(court.id).emoji}
                    </Text>
                    <Text style={[styles.statusLabel, { color: getCourtStatus(court.id).color }]}>
                      {getCourtStatus(court.id).label}
                    </Text>
                  </View>
                  <Text style={[styles.courtPrice, selectedCourtId === court.id && styles.courtPriceSelected]}>
                    ฿{court.price_per_hour}/ชม.
                  </Text>
                  <Text style={[styles.courtInfo, selectedCourtId === court.id && styles.courtInfoSelected]}>
                    {court.court_type} • {court.capacity} คน
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Text style={styles.sectionTitle}>เลือกวันที่</Text>
          <View style={styles.rowWrap}>
            {dates.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, selectedDate === d && styles.chipSelected]}
                onPress={() => setSelectedDate(d)}
              >
                <Text style={[styles.chipText, selectedDate === d && styles.chipTextSelected]}>
                  {new Date(d).getDate()}/{new Date(d).getMonth() + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>
            เวลาเริ่ม 
            {availabilityLoading && <ActivityIndicator size="small" color="#1a5f2a" style={{marginLeft: 10}} />}
          </Text>
          <View style={styles.rowWrap}>
            {TIME_SLOTS.map((t) => {
              const booked = isStartTimeBooked(t);
              const isSelected = selectedStart === t;
              return (
              <TouchableOpacity
                key={`start-${t}`}
                style={[
                  styles.chip, 
                  isSelected && styles.chipSelected,
                  booked && styles.chipDisabled
                ]}
                disabled={booked}
                onPress={() => {
                  setSelectedStart(t);
                  setSelectedEnd('');
                }}
              >
                <Text style={[
                  styles.chipText, 
                  isSelected && styles.chipTextSelected,
                  booked && styles.chipTextDisabled
                ]}>{t}</Text>
              </TouchableOpacity>
            )})}
          </View>

          <Text style={styles.sectionTitle}>เวลาสิ้นสุด</Text>
          <View style={styles.rowWrap}>
            {TIME_SLOTS.filter((t) => !selectedStart || t > selectedStart).map((t) => {
              // End time cannot overlap a booked slot. We check the range from selectedStart to t.
              const invalidRange = selectedStart ? isRangeBooked(selectedStart, t) : false;
              const booked = invalidRange || isEndTimeBooked(t);
              const isSelected = selectedEnd === t;
              
              return (
              <TouchableOpacity
                key={`end-${t}`}
                style={[
                  styles.chip, 
                  isSelected && styles.chipSelected,
                  booked && styles.chipDisabled
                ]}
                disabled={booked}
                onPress={() => setSelectedEnd(t)}
              >
                <Text style={[
                  styles.chipText, 
                  isSelected && styles.chipTextSelected,
                  booked && styles.chipTextDisabled
                ]}>{t}</Text>
              </TouchableOpacity>
            )})}
          </View>

          <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
            <Text style={styles.bookButtonText}>จองสนาม</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7f0' },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#1a5f2a', fontWeight: 'bold' },
  errorText: { fontSize: 18, color: '#666', marginBottom: 20 },
  backBtn: { backgroundColor: '#1a5f2a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: 'bold' },
  content: { paddingBottom: 32 },
  carousel: { maxHeight: IMAGE_HEIGHT, marginBottom: 16 },
  heroImage: { width: screenWidth, height: IMAGE_HEIGHT, backgroundColor: '#e0e0e0' },
  imagePlaceholder: { width: screenWidth, height: IMAGE_HEIGHT, backgroundColor: '#e8f0e8', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  placeholderIcon: { fontSize: 60 },

  sportType: { fontSize: 12, color: '#1a5f2a', fontWeight: '700', marginBottom: 4, marginHorizontal: 16 },
  name: { fontSize: 22, fontWeight: '900', color: '#222', marginBottom: 8, marginHorizontal: 16 },
  description: { fontSize: 15, color: '#555', marginBottom: 8, marginHorizontal: 16 },
  address: { fontSize: 14, color: '#666', marginBottom: 4, marginHorizontal: 16 },
  hours: { fontSize: 14, color: '#666', marginBottom: 8, marginHorizontal: 16 },
  price: { fontSize: 18, fontWeight: '800', color: '#1a5f2a', marginBottom: 24, marginHorizontal: 16 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 8, marginTop: 8, marginHorizontal: 16 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8, marginHorizontal: 16 },
  chip: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ccc' },
  chipSelected: { backgroundColor: '#1a5f2a', borderColor: '#1a5f2a' },
  chipDisabled: { backgroundColor: '#f5f5f5', borderColor: '#eee' },
  chipText: { fontSize: 14, color: '#333', fontWeight: '700' },
  chipTextSelected: { color: '#fff' },
  chipTextDisabled: { color: '#ccc', textDecorationLine: 'line-through' },

  bookButton: { backgroundColor: '#1a5f2a', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20, marginHorizontal: 16 },
  bookButtonText: { color: '#fff', fontSize: 18, fontWeight: '900' },

  closedBox: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  closedTitle: { fontSize: 16, fontWeight: '900', color: '#a11', marginBottom: 6 },
  closedSub: { fontSize: 14, color: '#666', fontWeight: '600' },
  
  courtsContainer: { paddingHorizontal: 16, gap: 12, paddingBottom: 10 },
  courtCard: {
    width: 160,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  courtCardSelected: {
    borderColor: '#1a5f2a',
    backgroundColor: '#f0f7f0',
  },
  courtName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  courtNameSelected: {
    color: '#1a5f2a',
  },
  courtPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a5f2a',
    marginBottom: 4,
  },
  courtPriceSelected: {
    color: '#1a5f2a',
  },
  courtInfo: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  courtInfoSelected: {
    color: '#4a7c59',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  statusDot: {
    fontSize: 10,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});
