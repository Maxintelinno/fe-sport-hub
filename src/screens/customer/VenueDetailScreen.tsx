import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CustomerStackParamList } from '../../navigation/types';
import { getVenueById } from '../../data/venueStore';

type Props = {
  navigation: NativeStackNavigationProp<CustomerStackParamList, 'VenueDetail'>;
  route: RouteProp<CustomerStackParamList, 'VenueDetail'>;
};

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 210;

export default function VenueDetailScreen({ navigation, route }: Props) {
  const { venueId } = route.params;
  const venue = getVenueById(venueId);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStart, setSelectedStart] = useState('');
  const [selectedEnd, setSelectedEnd] = useState('');

  const images = useMemo(() => {
    if (!venue) return [];
    if (venue.imageUrls?.length) return venue.imageUrls;
    if (venue.imageUrl) return [venue.imageUrl];
    return [];
  }, [venue]);

  if (!venue) {
    return (
      <View style={styles.container}>
        <Text>ไม่พบสนาม</Text>
      </View>
    );
  }

  if (venue.isActive === false) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {images.length > 0 && (
          <Image source={{ uri: images[0] }} style={styles.heroImage} resizeMode="cover" />
        )}
        <Text style={styles.sportType}>{venue.sportType}</Text>
        <Text style={styles.name}>{venue.name}</Text>
        <Text style={styles.description}>{venue.description}</Text>
        <Text style={styles.address}>📍 {venue.address}</Text>
        <Text style={styles.hours}>🕐 {venue.openingTime} - {venue.closingTime}</Text>
        <View style={styles.closedBox}>
          <Text style={styles.closedTitle}>สนามปิดให้บริการชั่วคราว</Text>
          <Text style={styles.closedSub}>โปรดลองเลือกสนามอื่น หรือกลับมาใหม่ภายหลัง</Text>
        </View>
      </ScrollView>
    );
  }

  const handleBook = () => {
    if (!selectedDate || !selectedStart || !selectedEnd) {
      Alert.alert('กรุณาเลือกวันที่และเวลา');
      return;
    }
    navigation.navigate('BookingForm', {
      venueId: venue.id,
      date: selectedDate,
      startTime: selectedStart,
      endTime: selectedEnd,
    });
  };

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {images.length > 0 && (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
          {images.map((uri, i) => (
            <Image key={`${uri}-${i}`} source={{ uri }} style={styles.heroImage} resizeMode="cover" />
          ))}
        </ScrollView>
      )}

      <Text style={styles.sportType}>{venue.sportType}</Text>
      <Text style={styles.name}>{venue.name}</Text>
      <Text style={styles.description}>{venue.description}</Text>
      <Text style={styles.address}>📍 {venue.address}</Text>
      <Text style={styles.hours}>🕐 {venue.openingTime} - {venue.closingTime}</Text>
      <Text style={styles.price}>฿{venue.pricePerHour} / ชั่วโมง</Text>

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

      <Text style={styles.sectionTitle}>เวลาเริ่ม</Text>
      <View style={styles.rowWrap}>
        {TIME_SLOTS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, selectedStart === t && styles.chipSelected]}
            onPress={() => {
              setSelectedStart(t);
              setSelectedEnd('');
            }}
          >
            <Text style={[styles.chipText, selectedStart === t && styles.chipTextSelected]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>เวลาสิ้นสุด</Text>
      <View style={styles.rowWrap}>
        {TIME_SLOTS.filter((t) => !selectedStart || t > selectedStart).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, selectedEnd === t && styles.chipSelected]}
            onPress={() => setSelectedEnd(t)}
          >
            <Text style={[styles.chipText, selectedEnd === t && styles.chipTextSelected]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
        <Text style={styles.bookButtonText}>จองสนาม</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7f0' },
  content: { paddingBottom: 32 },
  carousel: { maxHeight: IMAGE_HEIGHT, marginBottom: 16 },
  heroImage: { width: screenWidth, height: IMAGE_HEIGHT, backgroundColor: '#e0e0e0' },

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
  chipText: { fontSize: 14, color: '#333', fontWeight: '700' },
  chipTextSelected: { color: '#fff' },

  bookButton: { backgroundColor: '#1a5f2a', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20, marginHorizontal: 16 },
  bookButtonText: { color: '#fff', fontSize: 18, fontWeight: '900' },

  closedBox: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  closedTitle: { fontSize: 16, fontWeight: '900', color: '#a11', marginBottom: 6 },
  closedSub: { fontSize: 14, color: '#666', fontWeight: '600' },
});

