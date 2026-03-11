import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<CustomerStackParamList, 'AllPromotions'>;
};

const PROMOTIONS = [
  { 
    id: '1', 
    title: 'โปรโมชั่นเปิดสนามใหม่!', 
    description: 'รับส่วนลด 20% สำหรับการจองครั้งแรก ทุกประเภทกีฬา เฉพาะผู้ใช้งานใหม่เท่านั้น', 
    longDesc: 'ยินดีต้อนรับสู่ประสบการณ์ระดับพรีเมียม สัมผัสสนามที่ได้มาตรฐานระดับสากลพร้อมส่วนลดพิเศษเพื่อให้คุณได้ลองสัมผัสคุณภาพการบริการของเรา',
    bg: '#1A5F2A', 
    image: '🎁',
    type: 'DISCOUNT',
    expiry: '31 มี.ค. 67'
  },
  { 
    id: '2', 
    title: 'Member get Member', 
    description: 'ชวนเพื่อนมาเล่น รับฟรีน้ำดื่ม 2 ขวด และคูปองเงินสด 50 บาท', 
    longDesc: 'เพราะความสนุกจะเพิ่มขึ้นเมื่อมีเพื่อนมาด้วย! เพียงแนะนำเพื่อนมาสมัครสมาชิกและจองสนามครั้งแรก รับทันทีของรางวัลสุดพิเศษทั้งคู่',
    bg: '#C5A021', 
    image: '🤝',
    type: 'ROYALTY',
    expiry: 'สิ้นปี 2567'
  },
  { 
    id: '3', 
    title: 'จองล่วงหน้าคุ้มกว่า', 
    description: 'จองล่วงหน้า 3 วัน ลดเพิ่ม 50 บาท สำหรับช่วงเวลา Golden Hour', 
    longDesc: 'วางแผนการออกกำลังกายของคุณล่วงหน้าเพื่อความคุ้มค่าสูงสุด รับส่วนลดประหยัดทันทีเมื่อจองผ่านแอปพลิเคชันอย่างน้อย 3 วันก่อนเข้าใช้งาน',
    bg: '#0D3D1A', 
    image: '⏰',
    type: 'EARLY_BIRD',
    expiry: 'ไม่มีกำหนด'
  },
  { 
    id: '4', 
    title: 'Weekend Warrior', 
    description: 'สะสมแต้มคูณ 2 เมื่อจองสนามในช่วงวันเสาร์-อาทิตย์', 
    longDesc: 'จัดเต็มทุกวันหยุดสุดสัปดาห์! ยิ่งเล่นเยอะยิ่งได้เยอะ สะสมแต้มเพื่อแลกรับชั่วโมงจองสนามฟรีหรือของพรีเมียมจาก ROYAL SPORTS',
    bg: '#1A5F2A', 
    image: '🔥',
    type: 'POINTS',
    expiry: 'ถาวร'
  },
];

export default function AllPromotionsScreen({ navigation }: Props) {
  const renderItem = ({ item }: { item: typeof PROMOTIONS[0] }) => (
    <TouchableOpacity style={styles.promoCard} activeOpacity={0.95}>
      <View style={[styles.cardHeader, { backgroundColor: item.bg }]}>
        <View style={styles.headerContent}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
          <Text style={styles.headerIcon}>{item.image}</Text>
        </View>
        <View style={styles.goldLine} />
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.divider} />
        <Text style={styles.longDesc}>{item.longDesc}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.expiryContainer}>
            <Text style={styles.expiryLabel}>หมดเขต:</Text>
            <Text style={styles.expiryDate}>{item.expiry}</Text>
          </View>
          <TouchableOpacity style={styles.claimButton}>
            <Text style={styles.claimButtonText}>รับข้อเสนอ</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.royalCorner} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screenHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.screenTitle}>SPECIAL OFFERS</Text>
          <Text style={styles.screenSubtitle}>โปรโมชั่นและสิทธิพิเศษระดับพรีเมียม</Text>
        </View>
      </View>

      <FlatList
        data={PROMOTIONS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9', // Marble White
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#1A5F2A',
    fontWeight: 'bold',
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A5F2A',
    letterSpacing: 2,
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  promoCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 42, 0.05)',
  },
  cardHeader: {
    height: 120,
    padding: 20,
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  typeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerIcon: {
    fontSize: 40,
  },
  goldLine: {
    height: 3,
    width: 60,
    backgroundColor: '#C5A021',
  },
  cardBody: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A5F2A',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#1A5F2A',
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginBottom: 16,
  },
  longDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 4,
  },
  expiryDate: {
    fontSize: 12,
    color: '#1A5F2A',
    fontWeight: '700',
  },
  claimButton: {
    backgroundColor: '#C5A021', // Gold
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  claimButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  royalCorner: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 30,
    height: 30,
    backgroundColor: '#C5A021',
    transform: [{ rotate: '45deg' }],
    opacity: 0.1,
  },
});
