import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OwnerStackParamList } from '../../navigation/types';
import { getFieldAvailability, createOfflineBooking } from '../../services/bookingService';
import { getFieldById } from '../../services/venueService';
import { FieldAvailability, Venue } from '../../types';

const { width } = Dimensions.get('window');

export default function AddOfflineBookingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OwnerStackParamList>>();
  const route = useRoute<any>();
  const { courtName: initialCourtName, startTime: initialStartTime, fieldId } = route.params || {};

  const [venue, setVenue] = useState<Venue | null>(null);
  const [availability, setAvailability] = useState<FieldAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlots, setSelectedSlots] = useState<{ start: string, end: string }[]>(
    initialStartTime ? [{ start: initialStartTime, end: `${(parseInt(initialStartTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00:00` }] : []
  );

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bookingType, setBookingType] = useState('Walk-in');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');

  const fetchInitialData = async () => {
    if (!fieldId) return;
    try {
      setLoading(true);
      // Fetch both venue and availability in parallel
      const [venueData, availabilityData] = await Promise.all([
        getFieldById(fieldId),
        getFieldAvailability(fieldId, selectedDate)
      ]);
      
      setVenue(venueData);
      setAvailability(availabilityData);
      
      // Auto-select court logic
      const activeCourtId = selectedCourtId || (initialCourtName 
        ? availabilityData.courts.find(c => c.court_name === initialCourtName)?.court_id
        : availabilityData.courts[0]?.court_id);
      
      if (activeCourtId) {
        setSelectedCourtId(activeCourtId);
        const court = availabilityData.courts.find(c => c.court_id === activeCourtId);
        if (court && !price) {
          const currentSlotsCount = selectedSlots.length || 1;
          setPrice((court.price_per_hour * currentSlotsCount).toString());
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    if (!fieldId || loading) return; // Skip if initial loading is already happening
    try {
      setAvailabilityLoading(true);
      const data = await getFieldAvailability(fieldId, selectedDate);
      setAvailability(data);
      
      // Update price if court is already selected
      if (selectedCourtId) {
        const court = data.courts.find(c => c.court_id === selectedCourtId);
        if (court) {
          setPrice((court.price_per_hour * (selectedSlots.length || 1)).toString());
        }
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [fieldId]);

  useEffect(() => {
    // Only fetch availability separately if it's not the first load
    if (!loading && venue) {
      fetchAvailability();
    }
  }, [selectedDate]);

  const availableHours = useMemo(() => {
    if (!availability || !selectedCourtId) return [];
    
    const court = availability.courts.find(c => c.court_id === selectedCourtId);
    if (!court) return [];

    const slots = [];
    const openHour = parseInt(availability.open_time.split(':')[0]);
    const closeHour = parseInt(availability.close_time.split(':')[0]);
    
    const now = new Date();
    const currentHour = now.getHours();
    const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const isToday = selectedDate === today;

    for (let h = openHour; h < closeHour; h++) {
      // 1. Skip if it's already past (if today)
      if (isToday && h <= currentHour) continue;

      const startHourStr = h.toString().padStart(2, '0');
      const startStr = `${startHourStr}:00:00`;
      const endStr = `${(h + 1).toString().padStart(2, '0')}:00:00`;
      
      // 2. Skip if specifically booked in booked_slots
      const isBooked = court.booked_slots.some(bs => {
        const bsStartHour = bs.start_time.split(':')[0];
        return bsStartHour === startHourStr;
      });

      if (!isBooked) {
        slots.push({ start: startStr, end: endStr });
      }
    }
    return slots;
  }, [availability, selectedCourtId, selectedDate]);

  const dates = useMemo(() => {
    const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    const now = new Date();
    const todayISO = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    
    return Array.from({ length: 14 }, (_, i) => { // Show 14 days for more scrolling
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      const dayIndex = d.getDay();
      return { 
        iso, 
        dateNum: d.getDate(),
        dayName: dayNames[dayIndex],
        isToday: iso === todayISO,
        isMoneyDay: dayIndex === 5 || dayIndex === 6, // Fri, Sat
      };
    });
  }, []);

  const handleSave = async () => {
    if (!customerName || !price || selectedSlots.length === 0 || !selectedCourtId) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกชื่อลูกค้าและราคาให้ครบถ้วน');
      return;
    }

    try {
      setSaving(true);
      
      const court = availability?.courts.find(c => c.court_id === selectedCourtId);
      
      const payload = {
        field_id: fieldId || '',
        booking_date: selectedDate,
        customer_name: customerName,
        customer_tel: phoneNumber.replace(/-/g, ''),
        customer_paid_source: paymentMethod || 'เงินสด',
        customer_remark: note,
        items: selectedSlots.map(slot => ({
          court_id: selectedCourtId!,
          start_time: slot.start.substring(0, 5),
          end_time: slot.end.substring(0, 5),
        }))
      };

      const response = await createOfflineBooking(payload);
      
      // Navigate to success screen
      navigation.navigate('OfflineBookingSuccess', {
        bookingNo: response.booking_no,
        venueName: availability?.field_name || venue?.name || '',
        courtName: court?.court_name || '',
        date: selectedDate,
        timeRange: `${selectedSlots[0].start.substring(0, 5)} - ${selectedSlots[selectedSlots.length - 1].end.substring(0, 5)}`,
        customerName: customerName,
        totalPrice: price,
      });

    } catch (error: any) {
      console.error('Error creating offline booking:', error);
      Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถบันทึกการจองได้');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A5F2A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          
          {/* Venue Header */}
          <View style={styles.venueHeaderContainer}>
            <View style={styles.headerRow}>
                <Text style={styles.venueName}>{availability?.field_name || venue?.name || 'สนามของคุณ'}</Text>
                <View style={styles.timeBadge}>
                    <Text style={styles.timeBadgeText}>
                      ⏰ {selectedSlots.length > 0 ? `${selectedSlots.length} ช่วงเวลา` : 'เลือกเวลา'}
                    </Text>
                </View>
            </View>
            <Text style={styles.venueDesc}>{venue?.description || 'รายละเอียดสนาม'}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>📍 {availability?.address || venue?.address_line || 'ที่อยู่สนาม'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>🕒 {availability?.open_time.substring(0,5) || venue?.open_time.substring(0,5)} - {availability?.close_time.substring(0,5) || venue?.close_time.substring(0,5)}</Text>
            </View>
            <Text style={styles.startPrice}>เริ่มต้น <Text style={styles.boldText}>฿{venue?.price_per_hour || 0} / ชั่วโมง</Text></Text>
          </View>

          {/* Court Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>เลือกสนาม / คอร์ท</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
              {availability?.courts.map((court) => (
                <TouchableOpacity 
                  key={court.court_id}
                  style={[styles.courtCard, selectedCourtId === court.court_id && styles.courtCardSelected]}
                  onPress={() => {
                    setSelectedCourtId(court.court_id);
                    setPrice((court.price_per_hour * (selectedSlots.length || 1)).toString());
                  }}
                >
                  <Text style={[styles.courtCardName, selectedCourtId === court.court_id && styles.primaryText]}>{court.court_name}</Text>
                  <View style={styles.statusRow}>
                    <View style={styles.greenDot} />
                    <Text style={styles.statusLabel}>ว่าง</Text>
                  </View>
                  <Text style={[styles.courtCardPrice, selectedCourtId === court.court_id && styles.primaryText]}>฿{court.price_per_hour}/ชม.</Text>
                  <Text style={styles.courtCardInfo}>{venue?.sport_type} • {court.capacity || 0} คน</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>เลือกวันที่</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScrollList}>
              {dates.map((d) => (
                <TouchableOpacity 
                  key={d.iso}
                  style={[
                    styles.dateCard, 
                    selectedDate === d.iso && styles.dateCardSelected,
                    (d.isMoneyDay && selectedDate !== d.iso) && styles.dateCardWeekend
                  ]}
                  onPress={() => setSelectedDate(d.iso)}
                >
                  <Text style={[
                    styles.dayNameText, 
                    selectedDate === d.iso && styles.whiteText,
                    (d.isMoneyDay && selectedDate !== d.iso) && styles.goldLabelText
                  ]}>{d.dayName}</Text>
                  
                  <Text style={[
                    styles.dateNumText, 
                    selectedDate === d.iso && styles.whiteText,
                    (d.isMoneyDay && selectedDate !== d.iso) && styles.goldCardText
                  ]}>{d.dateNum}</Text>
                  
                  {d.isToday ? (
                    <Text style={[styles.todayText, selectedDate === d.iso && styles.whiteTextToday]}>วันนี้</Text>
                  ) : (
                    <View style={{ height: 14 }} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Time Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>เลือกรอบเวลา (เฉพาะที่ว่าง)</Text>
            {availabilityLoading ? (
              <ActivityIndicator size="small" color="#1A5F2A" />
            ) : (
              <View style={styles.timeGrid}>
                {availableHours.map((slot, idx) => {
                  const isSelected = selectedSlots.some(s => s.start === slot.start);
                  return (
                    <TouchableOpacity 
                      key={idx}
                      style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
                      onPress={() => {
                        let newSlots;
                        if (isSelected) {
                          newSlots = selectedSlots.filter(s => s.start !== slot.start);
                        } else {
                          newSlots = [...selectedSlots, slot].sort((a, b) => a.start.localeCompare(b.start));
                        }
                        setSelectedSlots(newSlots);
                        
                        const court = availability?.courts.find(c => c.court_id === selectedCourtId);
                        if (court) {
                          setPrice((court.price_per_hour * (newSlots.length || 1)).toString());
                        }
                      }}
                    >
                      <Text style={[styles.timeSlotText, isSelected && styles.boldText]}>
                        {slot.start.substring(0, 5)} - {slot.end.substring(0, 5)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {availableHours.length === 0 && <Text style={styles.noSlots}>ไม่มีเวลาว่างสำหรับวันที่เลือก</Text>}
              </View>
            )}
          </View>

          {/* Order Details Form */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>ข้อมูลผู้จอง & การชำระเงิน</Text>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>ชื่อลูกค้า *</Text>
                <TextInput style={styles.input} placeholder="ระบุชื่อลูกค้า" value={customerName} onChangeText={setCustomerName} />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>เบอร์โทรศัพท์ (ไม่บังคับ)</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="08x-xxx-xxxx" 
                  keyboardType="phone-pad" 
                  value={phoneNumber} 
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '');
                    const limited = cleaned.slice(0, 10);
                    let formatted = limited;
                    if (limited.length > 6) {
                      formatted = `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
                    } else if (limited.length > 3) {
                      formatted = `${limited.slice(0, 3)}-${limited.slice(3)}`;
                    }
                    setPhoneNumber(formatted);
                  }} 
                />
            </View>
            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>ราคา *</Text>
                    <TextInput style={[styles.input, styles.priceInputText]} value={price} onChangeText={setPrice} keyboardType="numeric" />
                </View>
                <View style={[styles.inputGroup, { flex: 1.5 }]}>
                    <Text style={styles.label}>วิธีชำระเงิน</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {['เงินสด', 'โอนเงิน', 'อื่นๆ'].map(m => (
                            <TouchableOpacity key={m} style={[styles.miniChip, paymentMethod === m && styles.miniChipActive]} onPress={() => setPaymentMethod(m)}>
                                <Text style={[styles.miniChipText, paymentMethod === m && styles.whiteText]}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>หมายเหตุ</Text>
                <TextInput style={[styles.input, styles.textArea]} multiline placeholder="ข้อความเพิ่มเติม..." value={note} onChangeText={setNote} />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, saving && styles.submitBtnDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>ยืนยันการเพิ่มการจอง</Text>
            )}
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A5F2A' },
  container: { flex: 1, backgroundColor: '#F9FBF9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingBottom: 40 },
  venueHeaderContainer: { padding: 20, backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  timeBadge: { backgroundColor: '#FFF8E1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#FFECB3' },
  timeBadgeText: { fontSize: 13, fontWeight: '800', color: '#F57F17' },
  venueSportType: { fontSize: 13, fontWeight: '700', color: '#1A5F2A', marginBottom: 4 },
  venueName: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', marginBottom: 8 },
  venueDesc: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  metaText: { fontSize: 13, color: '#888', fontWeight: '600' },
  startPrice: { fontSize: 16, marginTop: 10, color: '#1A5F2A' },
  boldText: { fontWeight: '900' },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: '#1a1a1a', marginBottom: 16 },
  scrollList: { paddingRight: 20, gap: 12 },
  courtCard: { width: 150, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderColor: '#eee', borderWidth: 1.5 },
  courtCardSelected: { borderColor: '#1A5F2A', backgroundColor: '#F1F8E9' },
  courtCardName: { fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 4 },
  primaryText: { color: '#1A5F2A' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
  statusLabel: { fontSize: 13, fontWeight: '700', color: '#4CAF50' },
  courtCardPrice: { fontSize: 14, fontWeight: '800', color: '#1A5F2A', marginBottom: 4 },
  courtCardInfo: { fontSize: 11, color: '#888', fontWeight: '600' },
  dateScrollList: { paddingRight: 20, gap: 16 },
  dateCard: { 
    width: 75, 
    height: 100,
    backgroundColor: '#fff', 
    borderRadius: 20, 
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dateCardSelected: { 
    backgroundColor: '#1A5F2A', 
    borderColor: '#1A5F2A',
    shadowColor: '#1A5F2A',
    shadowOpacity: 0.3,
  },
  dateCardWeekend: {
    borderColor: '#C5A021',
    backgroundColor: '#FFFDF5',
  },
  dayNameText: { fontSize: 13, fontWeight: '700', color: '#888' },
  dateNumText: { fontSize: 22, fontWeight: '900', color: '#1a1a1a' },
  todayText: { fontSize: 10, fontWeight: '800', color: '#1A5F2A', textTransform: 'uppercase' },
  whiteTextToday: { color: '#C8E6C9' },
  goldCardText: { color: '#C5A021' },
  goldLabelText: { color: '#D4AF37' },
  whiteText: { color: '#fff' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeSlot: { width: '48%', paddingVertical: 14, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  timeSlotSelected: { borderColor: '#C5A021', backgroundColor: '#FFF8E1' },
  timeSlotText: { fontSize: 14, fontWeight: '700', color: '#333' },
  noSlots: { color: '#999', fontStyle: 'italic', fontSize: 14, padding: 10 },
  formContainer: { marginTop: 24, paddingHorizontal: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#eee' },
  priceInputText: { fontSize: 18, fontWeight: '900', color: '#1A5F2A' },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  miniChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  miniChipActive: { backgroundColor: '#1A5F2A', borderColor: '#1A5F2A' },
  miniChipText: { fontSize: 12, fontWeight: '700', color: '#666' },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitBtn: { marginHorizontal: 20, marginTop: 30, backgroundColor: '#1A5F2A', paddingVertical: 18, borderRadius: 18, alignItems: 'center', shadowColor: '#1A5F2A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  submitBtnDisabled: { backgroundColor: '#A5D6A7', shadowOpacity: 0 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
