import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, StatusBar, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<CustomerStackParamList, 'InsightDetail'>;

// Premium Mock Data (Sync with list)
const INSIGHTS_CONTENT: Record<string, any> = {
  '1': {
    title: '5 เทคนิคเตะบอลให้แม่นแม่นยำ',
    category: 'TECHNIQUE',
    author: 'COACH MAX',
    date: '11 มี.ค. 2024',
    readTime: '5 นาที',
    color: '#1E40AF',
    image: '⚽',
    content: [
      { type: 'text', text: 'การเตะฟุตบอลให้มีความแม่นยำสูงนั้น ไม่ได้มาจากเพียงแค่ความแรงเพียงอย่างเดียว แต่หัวใจสำคัญคือ "การควบคุมร่างกาย" และ "จุดสัมผัส" ระหว่างเท้ากับลูกฟุตบอล' },
      { type: 'heading', text: '1. การวางเท้าหลัก (Supporting Foot)' },
      { type: 'text', text: 'เท้าหลักควรวางขนานกับลูกฟุตบอล ห่างประมาณ 1 ฝ่ามือ โดยให้ปลายเท้าชี้ไปยังทิศทางที่ต้องการให้บอลพุ่งไป' },
      { type: 'ad', title: 'Sponsor: ROYAL BOOTS', desc: 'รองเท้าฟุตบอลที่ออกแบบมาเพื่อการควบคุมที่เหนือชั้น ลดแรงกระแทก 30%', btn: 'ดูรายละเอียด' },
      { type: 'heading', text: '2. จุดสัมผัสบอล' },
      { type: 'text', text: 'หากต้องการเตะเรียดพื้น ให้สัมผัสตรงกึ่งกลางลูกพอดี แต่หากต้องการให้บอลลอยสูงขึ้นเล็กน้อย ให้ลดจุดสัมผัสลงมาที่ส่วนล่างของลูก' },
    ]
  },
  '2': {
    title: 'ยืดเหยียดก่อนแข่งสำคัญอย่างไร?',
    category: 'WELLNESS',
    author: 'DR. SPORTY',
    date: '10 มี.ค. 2024',
    readTime: '3 นาที',
    color: '#6D28D9',
    image: '🧘',
    content: [
      { type: 'text', text: 'นักกีฬาหลายคนมักละเลยการวอร์มอัพและยืดเหยียด ซึ่งเป็นสาเหตุหลักของการบาดเจ็บเรื้อรัง การเตรียมกล้ามเนื้อให้พร้อมคือกุญแจสู่ชัยชนะที่ยั่งยืน' },
      { type: 'ad', title: 'Sponsor: WELLNESS SPA', desc: 'ผ่อนคลายกล้ามเนื้อหลังแข่งด้วยโปรแกรม Recovery Spa 90 นาที ลด 40%', btn: 'จองตอนนี้' },
      { type: 'heading', text: 'Dynamic vs Static Stretching' },
      { type: 'text', text: 'ก่อนลงสนามควรใช้ Dynamic Stretching (การยืดแบบเคลื่อนไหว) เพื่อกระตุ้นระบบประสาทและเพิ่มความร้อนในกล้ามเนื้อ' },
    ]
  }
};

export default function InsightDetailScreen({ route, navigation }: Props) {
  const { insightId } = route.params;
  const insight = INSIGHTS_CONTENT[insightId] || INSIGHTS_CONTENT['1']; // Fallback to 1

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {/* Header Navigation */}
        <View style={styles.headerNav}>
           <SafeAreaView>
            <View style={styles.headerNavContent}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{insight.title}</Text>
                <View style={{ width: 40 }} /> 
            </View>
           </SafeAreaView>
        </View>

        {/* Hero Section */}
        <View style={[styles.hero, { backgroundColor: insight.color }]}>
          <Text style={styles.heroIcon}>{insight.image}</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{insight.category}</Text>
          </View>
          <View style={styles.heroGoldLine} />
        </View>

        {/* Article Body */}
        <View style={styles.contentContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.authorText}>โดย {insight.author}</Text>
            <View style={styles.goldDot} />
            <Text style={styles.dateText}>{insight.date}</Text>
            <View style={styles.goldDot} />
            <Text style={styles.readTimeText}>⏱️ {insight.readTime}</Text>
          </View>

          <Text style={styles.mainTitle}>{insight.title}</Text>

          {insight.content.map((block: any, index: number) => {
            if (block.type === 'text') {
              return <Text key={index} style={styles.paragraph}>{block.text}</Text>;
            }
            if (block.type === 'heading') {
              return <Text key={index} style={styles.heading}>{block.text}</Text>;
            }
            if (block.type === 'ad') {
              return (
                <View key={index} style={styles.adCard}>
                  <View style={styles.adHeader}>
                    <Text style={styles.adBadge}>SPONSORED</Text>
                    <Text style={styles.adStar}>✨</Text>
                  </View>
                  <Text style={styles.adTitle}>{block.title}</Text>
                  <Text style={styles.adDesc}>{block.desc}</Text>
                  <TouchableOpacity style={styles.adBtn}>
                    <Text style={styles.adBtnText}>{block.btn}</Text>
                  </TouchableOpacity>
                  <View style={styles.adBorderTop} />
                </View>
              );
            }
            return null;
          })}

          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>© 2024 ROYAL SPORTS PREMIUM CONTENT</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerNav: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  headerNavContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 50,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: '#1A1A1A',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 0.5,
    maxWidth: width * 0.6,
  },
  hero: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  heroGoldLine: {
    position: 'absolute',
    bottom: 0,
    height: 5,
    width: '100%',
    backgroundColor: '#C5A021',
  },
  contentContainer: {
    padding: 24,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  authorText: {
    fontSize: 12,
    color: '#C5A021',
    fontWeight: '900',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  readTimeText: {
    fontSize: 12,
    color: '#666',
  },
  goldDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#C5A021',
    marginHorizontal: 10,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    lineHeight: 36,
    marginBottom: 24,
  },
  paragraph: {
    fontSize: 16,
    color: '#444',
    lineHeight: 26,
    marginBottom: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  adCard: {
    backgroundColor: '#0D3D1A',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  adBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#C5A021',
    letterSpacing: 2,
  },
  adStar: {
    fontSize: 16,
  },
  adTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
  },
  adDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: 20,
  },
  adBtn: {
    backgroundColor: '#C5A021',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  adBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  adBorderTop: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 2,
    backgroundColor: '#C5A021',
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#EEE',
    marginTop: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 10,
    color: '#BBB',
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 1,
  }
});
