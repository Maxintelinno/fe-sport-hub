import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { CustomerStackParamList } from '../../navigation/types';
import { getAllVenues } from '../../data/venueStore';
import { Venue } from '../../types';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<CustomerStackParamList, 'VenueList'>;
};

function VenueCard({ venue, onPress }: { venue: Venue; onPress: () => void }) {
  const thumbUri = venue.imageUrls?.[0] ?? venue.imageUrl;
  const active = venue.isActive !== false;

  return (
    <TouchableOpacity
      style={[styles.card, !active && styles.cardInactive]}
      onPress={active ? onPress : undefined}
      activeOpacity={0.9}
      disabled={!active}
    >
      <View style={styles.imageContainer}>
        {thumbUri ? (
          <Image source={{ uri: thumbUri }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>🏟️</Text>
          </View>
        )}
        {!active && (
          <View style={styles.inactiveOverlay}>
            <Text style={styles.inactiveBadge}>ปิดให้บริการ</Text>
          </View>
        )}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>฿{venue.pricePerHour}</Text>
          <Text style={styles.priceUnit}>/ชม.</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.sportBadge}>
          <Text style={styles.sportTypeText}>{venue.sportType}</Text>
        </View>

        <Text style={styles.name} numberOfLines={1}>{venue.name}</Text>

        <View style={styles.locationContainer}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.address} numberOfLines={1}>
            {venue.address}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.ratingContainer}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.ratingText}>4.8 (120+)</Text>
          </View>
          <View style={styles.goldAccentLine} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const MOCK_ADS = [
  { id: '1', title: 'โปรโมชั่นเปิดสนามใหม่!', description: 'รับส่วนลด 20% สำหรับการจองครั้งแรก', bg: '#1A5F2A', image: '🎁' },
  { id: '2', title: 'Member get Member', description: 'ชวนเพื่อนมาเล่น รับฟรีน้ำดื่ม 2 ขวด', bg: '#C5A021', image: '🤝' },
  { id: '3', title: 'จองล่วงหน้าคุ้มกว่า', description: 'จองล่วงหน้า 3 วัน ลดเพิ่ม 50 บาท', bg: '#0D3D1A', image: '⏰' },
];

const MOCK_INSIGHTS = [
  { id: '1', title: 'สาระ: วิ่งอย่างไรไม่เจ็บ', description: 'เทคนิคการลงเท้าและเลือกรองเท้าที่ถูกต้อง', bg: '#1E40AF', image: '🏃' },
  { id: '2', title: 'เทคนิค: ตบแบดแม่นยำ', description: 'การจัดระเบียบร่างกายเพื่อพลังการตบที่สูงขึ้น', bg: '#B45309', image: '🏸' },
  { id: '3', title: 'สุขภาพ: ยืดเหยียดหลังเล่น', description: '5 ท่าโยคะช่วยคลายกล้ามเนื้อหลังออกกำลังกาย', bg: '#6D28D9', image: '🧘' },
];

export default function VenueListScreen({ navigation }: Props) {
  const venues = useMemo(() => getAllVenues(), []);
  const { isLoggedIn, user } = useAuth();

  const handleProfilePress = () => {
    if (!isLoggedIn) {
      navigation.navigate('Auth' as any, {
        screen: 'Login',
        params: { role: 'cust' }
      });
    } else {
      // Future: Navigate to Customer Profile
    }
  };


  const renderSliderItem = ({ item }: { item: typeof MOCK_ADS[0] }) => (
    <TouchableOpacity style={[styles.adContainer, { backgroundColor: item.bg }]}>
      <View style={styles.adContent}>
        <Text style={styles.adTitle}>{item.title}</Text>
        <Text style={styles.adDescription}>{item.description}</Text>
      </View>
      <Text style={styles.adIcon}>{item.image}</Text>
      <View style={styles.adGoldLine} />
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            {isLoggedIn && user && (
              <Text style={styles.userGreeting}>สวัสดี, {user.name}</Text>
            )}
            <Text style={styles.welcomeText}>ROYAL SPORTS</Text>
          </View>
          <TouchableOpacity
            style={styles.profileCircle}
            onPress={handleProfilePress}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.goldDivider} />
        <Text style={styles.headerTitle}>ค้นหาสนามกีฬาที่ดีที่สุด</Text>
        <Text style={styles.headerSubtitle}>สัมผัสประสบการณ์การเล่นกีฬาระดับพรีเมียม</Text>
      </View>

      {/* Promotion Slider */}
      <View style={styles.adsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>โปรโมชั่นพิเศษ</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={MOCK_ADS}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderSliderItem}
          contentContainerStyle={styles.adsList}
          snapToAlignment="start"
          decelerationRate="fast"
          snapToInterval={width * 0.8 + 16}
        />
      </View>

      <Text style={[styles.sectionTitle, { marginLeft: 24, marginBottom: 12 }]}>สนามทั้งหมด</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={[styles.adsSection, { marginTop: 20, marginBottom: 40 }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>สาระน่ารู้ & เทคนิคกีฬา</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SportsInsights')}>
          <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={MOCK_INSIGHTS}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderSliderItem}
        contentContainerStyle={styles.adsList}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={width * 0.8 + 16}
      />
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
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <VenueCard venue={item} onPress={() => navigation.navigate('VenueDetail', { venueId: item.id })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9', // Pearl Base
  },
  header: {
    backgroundColor: '#1A5F2A', // Deep Royal Emerald
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 12,
    color: '#C5A021', // Rich Gold
    fontWeight: '900',
    letterSpacing: 3,
  },
  userGreeting: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 33, 0.3)',
  },
  profileIcon: {
    fontSize: 18,
  },
  goldDivider: {
    width: 40,
    height: 2,
    backgroundColor: '#C5A021',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },

  // Ads Slider
  adsSection: {
    marginVertical: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  seeAllText: {
    fontSize: 13,
    color: '#1A5F2A',
    fontWeight: '700',
  },
  adsList: {
    paddingLeft: 24,
    paddingRight: 8,
  },
  adContainer: {
    width: width * 0.8,
    height: 120,
    marginRight: 16,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  adContent: {
    flex: 1,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  adDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  adIcon: {
    fontSize: 40,
  },
  adGoldLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(197, 160, 33, 0.5)',
  },

  list: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 42, 0.05)',
  },
  cardInactive: {
    opacity: 0.7,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e8f0e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
  },
  inactiveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveBadge: {
    backgroundColor: '#d32f2f',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontWeight: '900',
    fontSize: 14,
  },
  priceBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A5F2A',
  },
  priceUnit: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    marginLeft: 2,
  },
  cardBody: {
    padding: 18,
  },
  sportBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  sportTypeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1A5F2A',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  address: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C5A021',
  },
  goldAccentLine: {
    width: 60,
    height: 3,
    backgroundColor: '#C5A021',
    borderRadius: 2,
    opacity: 0.6,
  },
});

