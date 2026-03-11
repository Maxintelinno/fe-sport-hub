import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar, SafeAreaView, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<CustomerStackParamList, 'SportsInsights'>;
};

const INSIGHTS = [
  { 
    id: '1', 
    title: '5 เทคนิคเตะบอลให้แม่นแม่นยำ', 
    category: 'TECHNIQUE',
    description: 'การเตะบอลให้แม่นยำต้องเริ่มจากการวางเท้าหลัก การจัดระเบียบร่างกาย และการเลือกใช้ส่วนของเท้าที่เหมาะสม...', 
    bg: 'linear-gradient(rgba(30, 64, 175, 0.8), rgba(30, 64, 175, 1))',
    color: '#1E40AF',
    image: '⚽',
    readTime: '5 นาที'
  },
  { 
    id: '2', 
    title: 'ยืดเหยียดก่อนแข่งสำคัญอย่างไร?', 
    category: 'WELLNESS',
    description: 'การยืดเหยียดช่วยเพิ่มความยืดหยุ่น ลดความเสี่ยงในการบาดเจ็บ และช่วยให้ระบบไหลเวียนโลหิตทำงานได้ดีขึ้น...', 
    bg: '#6D28D9', 
    color: '#6D28D9',
    image: '🧘',
    readTime: '3 นาที'
  },
  { 
    id: '3', 
    title: 'รวมสนามบาสในร่มสุดเจ๋ง 2024', 
    category: 'REVIEW',
    description: 'พาไปดูสนามบาสเกตบอลในร่มที่มีพื้นไม้มาตรฐานสากล แสงสว่างเพียงพอ และสิ่งอำนวยความสะดวกครบครัน...', 
    bg: '#B45309', 
    color: '#B45309',
    image: '🏀',
    readTime: '7 นาที'
  },
  { 
    id: '4', 
    title: 'โภชนาการสำหรับนักกีฬาสมัครเล่น', 
    category: 'HEALTH',
    description: 'กินอย่างไรให้มีแรงตลอดทั้งแมตช์? รวมรายการอาหารที่ควรเน้นก่อนและหลังการออกกำลังกายหนักๆ...', 
    bg: '#059669', 
    color: '#059669',
    image: '🥗',
    readTime: '6 นาที'
  },
  { 
    id: '5', 
    title: 'จิตวิทยาการกีฬา: คุมสติเมื่อตามหลัง', 
    category: 'MENTAL',
    description: 'เคล็ดลับในการฝึกสมาธิและการรักษาความเชื่อมั่นในตัวเอง แม้ในสภาวะที่เกมกำลังเป็นรอง...', 
    bg: '#DC2626', 
    color: '#DC2626',
    image: '🧠',
    readTime: '4 นาที'
  },
];

export default function SportsInsightsScreen({ navigation }: Props) {
  const renderItem = ({ item }: { item: typeof INSIGHTS[0] }) => (
    <TouchableOpacity 
      style={styles.insightCard} 
      activeOpacity={0.9}
      onPress={() => navigation.navigate('InsightDetail', { insightId: item.id })}
    >
      <View style={[styles.cardImageSection, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.cardIcon}>{item.image}</Text>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>{item.category}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardMeta}>
          <Text style={styles.readTime}>⏱️ {item.readTime}</Text>
          <View style={styles.goldDot} />
          <Text style={styles.author}>ROYAL EXPERT</Text>
        </View>
        
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.premiumIndicator}>
            <Text style={styles.premiumText}>PREMIUM CONTENT</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </View>
      </View>
      
      <View style={[styles.accentBar, { backgroundColor: item.color }]} />
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
          <Text style={styles.screenTitle}>SPORTS INSIGHTS</Text>
          <Text style={styles.screenSubtitle}>ยกระดับทักษะและการดูแลตัวเองของคุณ</Text>
        </View>
      </View>

      <FlatList
        data={INSIGHTS}
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
    backgroundColor: '#F7FAF7', // Marble White
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
    color: '#1E40AF',
    fontWeight: 'bold',
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E40AF',
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
  insightCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginBottom: 24,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.05)',
  },
  cardImageSection: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardIcon: {
    fontSize: 40,
  },
  categoryTag: {
    position: 'absolute',
    bottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#1E40AF',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  readTime: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  goldDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C5A021',
    marginHorizontal: 8,
  },
  author: {
    fontSize: 10,
    color: '#C5A021',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 6,
    lineHeight: 24,
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumIndicator: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  premiumText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  arrowIcon: {
    fontSize: 20,
    color: '#C5A021',
    fontWeight: 'bold',
  },
  accentBar: {
    width: 4,
    height: '100%',
  },
});
