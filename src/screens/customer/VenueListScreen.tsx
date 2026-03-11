import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, StatusBar, ScrollView, ActivityIndicator, Alert, Modal, Text as RNText } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { CustomerStackParamList } from '../../navigation/types';
import { getAllVenues } from '../../data/venueStore';
import { Venue } from '../../types';
import { useAuth } from '../../context/AuthContext';
import * as Location from 'expo-location';
import { getFilteredFields } from '../../services/venueService';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<CustomerStackParamList, 'VenueList'>;
};

function VenueCard({ venue, onPress, onImagePress, onBookPress }: { venue: Venue; onPress: () => void; onImagePress: (images: any[]) => void; onBookPress: () => void }) {
  const displayImages = Array.isArray(venue.images) && venue.images.length > 0
    ? [...venue.images].sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
    : [];

  const firstImage = displayImages[0];
  const thumbUri = (typeof firstImage === 'string' ? firstImage : firstImage?.image_url)
    || venue.imageUrl
    || (Array.isArray(venue.imageUrls) ? venue.imageUrls[0] : null);

  const active = venue.status !== 'inactive' && venue.status !== 'pending_review';

  return (
    <TouchableOpacity
      style={[styles.card, !active && styles.cardInactive]}
      onPress={active ? onPress : undefined}
      activeOpacity={0.9}
      disabled={!active}
    >
      <View style={styles.imageContainer}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => onImagePress(displayImages)}
          style={styles.cardImageTouch}
        >
          {thumbUri ? (
            <Image source={{ uri: thumbUri }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderIcon}>🏟️</Text>
            </View>
          )}
        </TouchableOpacity>
        {!active && (
          <View style={styles.inactiveOverlay}>
            <Text style={styles.inactiveBadge}>ปิดให้บริการ</Text>
          </View>
        )}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>฿{venue.price_per_hour || venue.pricePerHour}</Text>
          <Text style={styles.priceUnit}>/ชม.</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.sportBadge}>
          <Text style={styles.sportTypeText}>{venue.sport_type || venue.sportType}</Text>
        </View>

        <Text style={styles.name} numberOfLines={1}>{venue.name}</Text>

        <View style={styles.locationContainer}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.address} numberOfLines={1}>
            {venue.address_line || venue.address}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.ratingContainer}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.ratingText}>4.8 (120+)</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.bookActionBtn}
            onPress={(e) => {
              e.stopPropagation();
              onBookPress();
            }}
          >
            <Text style={styles.bookActionText}>จองสนาม</Text>
          </TouchableOpacity>
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

const QUICK_MENU = [
  { id: '1', title: 'จองสนาม', icon: '⚽', color: '#E8F5E9', target: 'Venues' },
  { id: '2', title: 'การจอง', icon: '📋', color: '#FFF8E1', target: 'MyBookings' },
  { id: '3', title: 'โปรโมชั่น', icon: '🎁', color: '#E3F2FD', target: 'AllPromotions' },
  { id: '4', title: 'สาระกีฬา', icon: '💡', color: '#F3E5F5', target: 'SportsInsights' },
];

export default function VenueListScreen({ navigation }: Props) {
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = React.useState('ทั้งหมด');
  const [refreshing, setRefreshing] = React.useState(false);
  const [filteredVenues, setFilteredVenues] = React.useState<Venue[]>([]);
  const scrollRef = React.useRef<ScrollView>(null);
  const venuesSectionRef = React.useRef<View>(null);
  const [venuesY, setVenuesY] = React.useState(0);

  // Gallery State
  const [galleryVisible, setGalleryVisible] = React.useState(false);
  const [galleryImages, setGalleryImages] = React.useState<any[]>([]);

  const allVenues = useMemo(() => getAllVenues(), []);

  // No longer sync with mock data
  // React.useEffect(() => {
  //   setFilteredVenues(allVenues);
  // }, [allVenues]);

  const CATEGORIES = ['ทั้งหมด', 'สนามยอดนิยม', 'สนามใกล้คุณ', 'สนามในจังหวัดของคุณ'];

  const categoryToSection = (cat: string): 'all' | 'popular' | 'nearby' | 'province' => {
    switch (cat) {
      case 'ทั้งหมด': return 'all';
      case 'สนามยอดนิยม': return 'popular';
      case 'สนามใกล้คุณ': return 'nearby';
      case 'สนามในจังหวัดของคุณ': return 'province';
      default: return 'all';
    }
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'ขอสิทธิ์เข้าถึงตำแหน่ง',
        'กรุณาเปิดสิทธิ์การเข้าถึงตำแหน่งเพื่อใช้งานฟีเจอร์นี้',
        [{ text: 'ตกลง' }]
      );
      return null;
    }

    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      Alert.alert(
        'Location Service ปิดอยู่',
        'กรุณาเปิด Location Service ในการตั้งค่าเครื่องเพื่อใช้งานฟีเจอร์นี้',
        [{ text: 'ตกลง' }]
      );
      return null;
    }

    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude
    };
  };

  const handleCategoryPress = async (category: string) => {
    // If we're still loading auth, wait
    if (authLoading) return;

    setSelectedCategory(category);
    setRefreshing(true);

    try {
      const section = categoryToSection(category);
      let lat, lng, provinceStr;

      if (section === 'nearby' || section === 'province') {
        const loc = await getCurrentLocation();
        if (!loc) {
          setRefreshing(false);
          return;
        }
        lat = loc.lat;
        lng = loc.lng;

        if (section === 'province') {
          // Reverse geocode to get province
          try {
            const reverseGeocode = await Location.reverseGeocodeAsync({
              latitude: lat,
              longitude: lng
            });
            
            console.log('Reverse Geocode Result:', JSON.stringify(reverseGeocode, null, 2));

            if (reverseGeocode.length > 0) {
              const geo = reverseGeocode[0];
              // In Thailand:
              // region is often the province (e.g. "Bangkok", "Chiang Mai")
              // city might also contain it in some cases
              provinceStr = geo.region || geo.city;
            }
          } catch (geoError) {
            console.error('Reverse Geocode Error:', geoError);
          }
          
          // Fallback if not detected or provided
          if (!provinceStr) {
            provinceStr = 'กรุงเทพมหานคร';
          }
        }
      }

      const results = await getFilteredFields({
        section,
        lat,
        lng,
        province: provinceStr,
        limit: 10,
        offset: 0
      });

      console.log(`Results from API (${section}):`, JSON.stringify(results, null, 2));
      setFilteredVenues(results);
    } catch (error: any) {
      console.error('Error fetching venues:', error);
      
      // If unauthorized, show login prompt only then
      if (error.message?.includes('Authorization') || error.message?.includes('401')) {
        Alert.alert(
          'กรุณาเข้าสู่ระบบ',
          'กรุณาเข้าสู่ระบบเพื่อดูข้อมูลสนามในหมวดหมู่นี้',
          [
            { text: 'ภายหลัง', style: 'cancel' },
            { 
              text: 'เข้าสู่ระบบ', 
              onPress: () => (navigation as any).navigate('Auth', { screen: 'Login', params: { role: 'cust' } })
            }
          ]
        );
      } else {
        Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถโหลดข้อมูลสนามได้');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenGallery = (images: any[]) => {
    if (images.length > 0) {
      setGalleryImages(images);
      setGalleryVisible(true);
    } else {
      Alert.alert('ขออภัย', 'ไม่มีรูปภาพเพิ่มเติมสำหรับสนามนี้');
    }
  };

  // Trigger initial load when auth is ready
  React.useEffect(() => {
    if (!authLoading) {
      handleCategoryPress('ทั้งหมด');
    }
  }, [authLoading]);

  const handleQuickMenuPress = (item: typeof QUICK_MENU[0]) => {
    switch (item.target) {
      case 'Venues':
        scrollRef.current?.scrollTo({ y: venuesY - 20, animated: true });
        break;
      case 'MyBookings':
        navigation.navigate('MyBookings' as any);
        break;
      case 'AllPromotions':
        navigation.navigate('AllPromotions');
        break;
      case 'SportsInsights':
        navigation.navigate('SportsInsights');
        break;
    }
  };

  const handleBookPress = (venue: Venue) => {
    const vId = venue.id || (venue as any).field_id;
    if (!vId) {
      console.error('Venue ID is missing!', venue);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับสนามนี้ได้');
      return;
    }

    if (!isLoggedIn) {
      Alert.alert(
        'กรุณาเข้าสู่ระบบ',
        'คุณต้องเข้าสู่ระบบก่อนทำการจองสนาม',
        [
          { text: 'ยกเลิก', style: 'cancel' },
          { 
            text: 'เข้าสู่ระบบ', 
            onPress: () => (navigation as any).navigate('Auth', { screen: 'Login', params: { role: 'cust' } })
          }
        ]
      );
      return;
    }
    navigation.navigate('VenueDetail', { venueId: vId });
  };

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

  const renderInsightItem = ({ item }: { item: typeof MOCK_INSIGHTS[0] }) => (
    <TouchableOpacity 
      style={[styles.adContainer, { backgroundColor: item.bg }]}
      onPress={() => navigation.navigate('InsightDetail', { insightId: item.id })}
    >
      <View style={styles.adContent}>
        <Text style={styles.adTitle}>{item.title}</Text>
        <Text style={styles.adDescription}>{item.description}</Text>
      </View>
      <Text style={styles.adIcon}>{item.image}</Text>
      <View style={styles.adGoldLine} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
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

        {/* QUICK MENU SECTION */}
        <View style={styles.quickMenuContainer}>
          {QUICK_MENU.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => handleQuickMenuPress(item)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.color }]}>
                <RNText style={styles.menuIconText}>{item.icon}</RNText>
              </View>
              <RNText style={styles.menuLabel}>{item.title}</RNText>
            </TouchableOpacity>
          ))}
        </View>

        {/* SECTION 1: Special Promotions */}
        <View style={styles.adsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>โปรโมชั่นพิเศษ</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllPromotions')}>
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
            snapToInterval={width * 0.8 + 16}
            decelerationRate="fast"
          />
        </View>

        {/* SECTION 2: All Venues */}
        <View 
          style={styles.venuesSection}
          onLayout={(e) => setVenuesY(e.nativeEvent.layout.y)}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>สนามทั้งหมด</Text>
          </View>

          {/* Categories Filter */}
          <View style={styles.categoriesSection}>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryBtn,
                    selectedCategory === item && styles.categoryBtnActive
                  ]}
                  onPress={() => handleCategoryPress(item)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === item && styles.categoryTextActive
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          {refreshing ? (
            <View style={styles.venueLoadingContainer}>
              <ActivityIndicator size="large" color="#1A5F2A" />
              <Text style={styles.loadingText}>กำลังค้นหาสนาม...</Text>
            </View>
          ) : (
            <View style={styles.venuesList}>
              {filteredVenues.map((item) => (
                <VenueCard 
                  key={item.id || (item as any).field_id} 
                  venue={item} 
                  onPress={() => handleBookPress(item)} 
                  onImagePress={handleOpenGallery}
                  onBookPress={() => handleBookPress(item)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Gallery Modal */}
        <Modal
          visible={galleryVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setGalleryVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>COURT GALLERY</Text>
                <TouchableOpacity 
                  style={styles.closeBtn}
                  onPress={() => setGalleryVisible(false)}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={galleryImages}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.galleryItem}>
                    <Image 
                      source={{ uri: typeof item === 'string' ? item : item.image_url }} 
                      style={styles.galleryImage}
                      resizeMode="contain"
                    />
                    <View style={styles.galleryGoldFrame} />
                  </View>
                )}
              />
              
              <View style={styles.modalFooter}>
                <View style={styles.goldIndicator} />
                <Text style={styles.modalSwipeText}>เลื่อนดูรูปภาพเพิ่มเติม</Text>
                <View style={styles.goldIndicator} />
              </View>
            </View>
          </View>
        </Modal>

        {/* SECTION 3: Knowledge & Sports Techniques */}
        <View style={[styles.adsSection, { marginTop: 10, marginBottom: 40 }]}>
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
            renderItem={renderInsightItem}
            contentContainerStyle={styles.adsList}
            snapToAlignment="start"
            snapToInterval={width * 0.8 + 16}
            decelerationRate="fast"
          />
        </View>
      </ScrollView>
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
  quickMenuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  menuItem: {
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuIconText: {
    fontSize: 24,
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
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
  categoriesSection: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingHorizontal: 24,
  },
  categoryBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#E8EBE8',
  },
  categoryBtnActive: {
    backgroundColor: '#1A5F2A',
    borderColor: '#1A5F2A',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#666',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  venuesSection: {
    paddingTop: 10,
  },
  venuesList: {
    paddingTop: 10,
  },
  venueLoadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#1A5F2A',
    fontWeight: '700',
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
    backgroundColor: '#C5A021',
    borderRadius: 2,
    opacity: 0.6,
  },
  bookActionBtn: {
    backgroundColor: '#1A5F2A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bookActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  // Gallery Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  modalTitle: {
    color: '#C5A021',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 33, 0.3)',
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  galleryItem: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  galleryGoldFrame: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 33, 0.2)',
    borderRadius: 15,
    pointerEvents: 'none',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  modalSwipeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginHorizontal: 15,
  },
  goldIndicator: {
    width: 30,
    height: 1,
    backgroundColor: '#C5A021',
    opacity: 0.5,
  },
  cardImageTouch: {
    width: '100%',
    height: '100%',
  },
});

