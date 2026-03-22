import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Platform, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OwnerStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;
const SPACING = 16;
const FULL_CARD_SIZE = CARD_WIDTH + SPACING;
const SIDE_INSET = (width - CARD_WIDTH) / 2;

export default function UpgradePlanScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<OwnerStackParamList>>();
    const scrollX = useRef(new Animated.Value(0)).current;

    // Mock state for trial status
    const trialDaysLeft = 5;
    const isCurrentlyTrialing = false;

    const plans = [
        {
            key: 'free',
            name: '[ Free ]',
            price: '฿0 / เดือน',
            features: ['1 สนาม', '2 สนามย่อย'],
            fears: [
                '⚠️ ลูกค้าไม่เห็นสนามคุณ',
                '⚠️ ไม่มีรายงานรายได้',
                '⚠️ โอกาสเสียลูกค้าให้คู่แข่ง',
                '❌ เสียโอกาสรายได้ทุกวัน',
            ],
            type: 'free',
            active: true,
        },
        {
            key: 'standard',
            name: '[ Standard ⭐ ]',
            price: '฿299 / เดือน',
            features: [
                '3 สนาม',
                'สนามย่อยไม่จำกัด',
                '✔ รายงานรายได้',
                '✔ ระบบโปรโมชัน',
            ],
            type: 'standard',
        },
        {
            key: 'pro',
            name: '[ Pro 👑 ]',
            price: '฿999 / เดือน',
            features: [
                'ไม่จำกัดสนาม',
                'ไม่จำกัดสนามย่อย',
                '✔ Advanced Report',
                '✔ แสดงหน้าแรก',
            ],
            type: 'pro',
            isPro: true,
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            {isCurrentlyTrialing && (
                <View style={styles.trialStatusBanner}>
                    <Text style={styles.trialStatusText}>✨ คุณกำลังทดลอง Pro (เหลือ {trialDaysLeft} วัน)</Text>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Section 1: Hero */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroEmoji}>🚀</Text>
                    <Text style={styles.heroTitle}>เพิ่มรายได้สนามของคุณ</Text>
                </View>

                {/* Section 2: Urgency Banner */}
                <View style={styles.urgencyBanner}>
                    <Text style={styles.urgencyText}>⏰ เหลือสิทธิ์ทดลองฟรีอีก 3 วันสุดท้ายสำหรับเดือนนี้!</Text>
                </View>

                {/* Section 3: Plan Comparison Carousel */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>เลือกแพ็กเกจที่ใช่</Text>
                </View>
                
                <View style={styles.carouselWrapper}>
                    <Animated.ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={FULL_CARD_SIZE}
                        decelerationRate="fast"
                        contentContainerStyle={{
                            paddingHorizontal: SIDE_INSET,
                            paddingVertical: 20,
                        }}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: true }
                        )}
                        scrollEventThrottle={16}
                        snapToAlignment="center"
                    >
                        {plans.map((item, index) => {
                            const inputRange = [
                                (index - 1) * FULL_CARD_SIZE,
                                index * FULL_CARD_SIZE,
                                (index + 1) * FULL_CARD_SIZE,
                            ];

                            const scale = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.9, 1.05, 0.9],
                                extrapolate: 'clamp',
                            });

                            const shadowOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.05, 0.2, 0.05],
            extrapolate: 'clamp',
        });

        const borderColor = scrollX.interpolate({
            inputRange,
            outputRange: ['#f0f0f0', '#C5A021', '#f0f0f0'],
            extrapolate: 'clamp',
        });
           const opacity = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.6, 1, 0.6],
                                extrapolate: 'clamp',
                            });

                            return (
                                <Animated.View 
                                    key={item.key}
                                    style={[
                                        styles.planCard,
                                        item.isPro && styles.planCardPro,
                                        { transform: [{ scale }], opacity, borderColor, shadowOpacity, borderWidth: 2, shadowColor: '#C5A021' }
                                    ]}
                                >
                                    {item.active && (
                                        <View style={styles.currentPlanBadge}>
                                            <Text style={styles.currentPlanText}>คุณกำลังใช้งาน</Text>
                                        </View>
                                    )}
                                    {item.isPro && (
                                        <View style={styles.proTagGold}>
                                            <Text style={styles.proTagTextGold}>👑 PRO (แนะนำที่สุด)</Text>
                                        </View>
                                    )}
                                    
                                    <Text style={[
                                        styles.planName, 
                                        item.type === 'standard' && styles.planNameStandard,
                                        item.type === 'pro' && styles.planNamePro
                                    ]}>
                                        {item.name}
                                    </Text>
                                    
                                    <Text style={item.isPro ? styles.planPricePro : styles.planPrice}>
                                        {item.price}
                                    </Text>

                                    {item.isPro && <Text style={styles.proSubtitleHighlight}>🔥 ทดลองฟรี 7 วัน</Text>}
                                    
                                    <View style={styles.planDivider} />
                                    
                                    <View style={styles.featuresContainer}>
                                        {item.features.map((f, i) => (
                                            <Text key={i} style={styles.planFeature}>{f}</Text>
                                        ))}
                                    </View>

                                    {item.fears && (
                                        <View style={styles.fearTriggerContainer}>
                                            {item.fears.map((fear, i) => (
                                                <Text key={i} style={styles.fearTriggerText}>{fear}</Text>
                                            ))}
                                        </View>
                                    )}

                                    {item.type === 'standard' && (
                                        <TouchableOpacity 
                                            style={styles.selectPlanBtnSmall}
                                            onPress={() => navigation.navigate('UpgradePayment', { planName: 'Standard', price: 299 })}
                                        >
                                            <Text style={styles.selectPlanTextSmall}>เลือก Standard</Text>
                                        </TouchableOpacity>
                                    )}

                                    {item.isPro && (
                                        <TouchableOpacity 
                                            style={styles.selectPlanBtnPro}
                                            onPress={() => navigation.navigate('UpgradePayment', { planName: 'Pro', price: 999 })}
                                        >
                                            <Text style={styles.selectPlanTextPro}>🔥 เริ่มทดลองใช้ฟรี</Text>
                                        </TouchableOpacity>
                                    )}
                                </Animated.View>
                            );
                        })}
                    </Animated.ScrollView>
                </View>

                {/* Section 4: Feature Comparison Table */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>ตารางเปรียบเทียบ</Text>
                </View>
                <View style={styles.tableCard}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.tableCell, styles.featureCol]}>Feature</Text>
                        <Text style={styles.tableCell}>Free</Text>
                        <Text style={styles.tableCell}>Std</Text>
                        <Text style={[styles.tableCell, styles.proColBox]}>Pro</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.featureCol]}>สนาม</Text>
                        <Text style={styles.tableCell}>1</Text>
                        <Text style={styles.tableCell}>3</Text>
                        <Text style={[styles.tableCell, styles.proColValue]}>∞</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.featureCol]}>รายงาน</Text>
                        <Text style={[styles.tableCell, styles.disabledCell]}>❌</Text>
                        <Text style={styles.tableCell}>✔️</Text>
                        <Text style={[styles.tableCell, styles.proColValue]}>✔️</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.featureCol]}>โปรโมท</Text>
                        <Text style={[styles.tableCell, styles.disabledCell]}>❌</Text>
                        <Text style={styles.tableCell}>✔️</Text>
                        <Text style={[styles.tableCell, styles.proColValue]}>✔️</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.featureCol]}>หน้าแรก</Text>
                        <Text style={[styles.tableCell, styles.disabledCell]}>❌</Text>
                        <Text style={[styles.tableCell, styles.disabledCell]}>❌</Text>
                        <Text style={[styles.tableCell, styles.proColValue]}>✔️</Text>
                    </View>
                </View>

                {/* Section 5: Social Proof */}
                <View style={styles.socialProofSection}>
                    <View style={styles.testimonialCard}>
                        <Text style={styles.testimonialText}>⭐ สนาม A เพิ่มยอดจอง 40%</Text>
                    </View>
                    <View style={styles.testimonialCard}>
                        <Text style={styles.testimonialText}>⭐ สนาม B ลูกค้าเพิ่ม 2 เท่า</Text>
                    </View>
                </View>

                {/* Section 6: ROI */}
                <View style={styles.roiCard}>
                    <Text style={styles.roiTitle}>💰 สนามของคุณอาจเพิ่มรายได้</Text>
                    <Text style={styles.roiCalculation}>+27,000/เดือน</Text>
                    <Text style={styles.roiSubText}>จ่ายแค่ ฿999/เดือน</Text>
                    <View style={styles.roiProfitHighlight}>
                        <Text style={styles.roiProfitHighlightText}>กำไรเพิ่ม 26,000+</Text>
                    </View>
                </View>
                
                <View style={{ height: 120 }} />

            </ScrollView>

            {/* Sticky Bottom CTA - Compact Version */}
            <View style={styles.stickyCTAContainerCompact}>
                <View style={styles.ctaLeftContent}>
                    <Text style={styles.ctaHighlightText}>🚀 ทดลองใช้ฟรี 7 วัน</Text>
                    <Text style={styles.ctaAnchorText}>หลังจากนั้น ฿999/เดือน</Text>
                    <View style={styles.guaranteeBox}>
                        <Text style={styles.guaranteeText}>✔ ยกเลิกได้ทุกเมื่อ  ✔ ไม่มีการผูกมัด</Text>
                        <Text style={styles.guaranteeText}>✔ ไม่คิดเงินทันที</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.ctaRightButton} 
                    onPress={() => navigation.navigate('UpgradePayment', { planName: 'Pro', price: 999 })}
                >
                    <Text style={styles.ctaButtonText}>🔥 เริ่มทดลองใช้ฟรี 7 วัน{"\n"}ไม่ต้องจ่ายตอนนี้</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FBF9',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    trialStatusBanner: {
        backgroundColor: '#E8F5E9',
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#C8E6C9',
    },
    trialStatusText: {
        color: '#2E7D32',
        fontWeight: '800',
        fontSize: 14,
    },
    heroSection: {
        backgroundColor: '#1A5F2A',
        paddingVertical: 50,
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    heroEmoji: {
        fontSize: 60,
        marginBottom: 10,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 15,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    urgencyBanner: {
        backgroundColor: '#FFF1F1',
        marginHorizontal: 20,
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#FFCDCD',
        alignItems: 'center',
    },
    urgencyText: {
        color: '#D32F2F',
        fontWeight: '800',
        fontSize: 14,
        textAlign: 'center',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        marginTop: 35,
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1a1a1a',
    },
    carouselWrapper: {
        height: 500, // Adjusted for scaling
    },
    planCard: {
        backgroundColor: '#fff',
        width: CARD_WIDTH,
        borderRadius: 32,
        padding: 24,
        marginRight: SPACING,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 10,
        height: 440, // Fixed height for consistency
    },
    planCardPro: {
        borderColor: '#C5A021',
        borderWidth: 2,
    },
    currentPlanBadge: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        marginBottom: 12,
    },
    currentPlanText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#888',
    },
    proTagGold: {
        backgroundColor: '#C5A021',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    proTagTextGold: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '900',
    },
    proSubtitleHighlight: {
        fontSize: 15,
        fontWeight: '900',
        color: '#FF4D4D',
        marginBottom: 8,
        textShadowColor: 'rgba(255, 77, 77, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    planName: {
        fontSize: 18,
        fontWeight: '900',
        color: '#444',
        marginBottom: 12,
    },
    planNameStandard: {
        color: '#1A5F2A',
    },
    planNamePro: {
        color: '#C5A021',
    },
    planPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: '#666',
        marginTop: 5,
    },
    planPricePro: {
        fontSize: 22,
        fontWeight: '900',
        color: '#C5A021',
        marginTop: 5,
        marginBottom: 8,
    },
    planDivider: {
        width: '100%',
        height: 1,
        backgroundColor: '#f5f5f5',
        marginVertical: 15,
    },
    featuresContainer: {
        alignItems: 'center',
        minHeight: 120,
    },
    planFeature: {
        fontSize: 14,
        color: '#333',
        fontWeight: '700',
        marginBottom: 12,
    },
    fearTriggerContainer: {
        marginTop: 10,
        width: '100%',
        backgroundColor: '#FFF5F5',
        padding: 12,
        borderRadius: 16,
    },
    fearTriggerText: {
        fontSize: 12,
        color: '#D32F2F',
        fontWeight: '700',
        marginBottom: 5,
    },
    selectPlanBtnSmall: {
        marginTop: 15,
        backgroundColor: 'rgba(26, 95, 42, 0.08)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(26, 95, 42, 0.15)',
    },
    selectPlanTextSmall: {
        color: '#1A5F2A',
        fontSize: 13,
        fontWeight: '800',
    },
    selectPlanBtnPro: {
        marginTop: 15,
        backgroundColor: '#C5A021',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        shadowColor: '#C5A021',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    selectPlanTextPro: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
    },
    tableCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 24,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: '#eee',
        overflow: 'hidden',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f8f8',
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#F9FBF9',
        borderBottomWidth: 2,
        borderBottomColor: '#eee',
    },
    tableCell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '700',
        color: '#444',
    },
    featureCol: {
        flex: 1.5,
        textAlign: 'left',
        color: '#666',
        fontWeight: '800',
    },
    proColBox: {
        color: '#C5A021',
        fontWeight: '900',
    },
    proColValue: {
        color: '#C5A021',
        fontWeight: '900',
        fontSize: 16,
    },
    disabledCell: {
        color: '#ccc',
        opacity: 0.5,
    },
    roiCard: {
        backgroundColor: '#1A5F2A',
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 25,
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    roiTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 10,
    },
    roiCalculation: {
        fontSize: 36,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 20,
    },
    roiSubText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '700',
        marginBottom: 10,
    },
    roiProfitHighlight: {
        backgroundColor: '#C5A021',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 15,
        marginTop: 5,
    },
    roiProfitHighlightText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 18,
    },
    socialProofSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 40,
    },
    testimonialCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#eee',
    },
    testimonialText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#444',
        textAlign: 'center',
        lineHeight: 20,
    },
    stickyCTAContainerCompact: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 32 : 18,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
    },
    ctaLeftContent: {
        flex: 1.2,
    },
    ctaHighlightText: {
        fontSize: 15,
        fontWeight: '900',
        color: '#1A5F2A',
    },
    ctaAnchorText: {
        fontSize: 12,
        color: '#D32F2F',
        fontWeight: '900',
        marginTop: 2,
    },
    guaranteeBox: {
        marginTop: 4,
    },
    guaranteeText: {
        fontSize: 10,
        color: '#666',
        fontWeight: '700',
    },
    ctaRightButton: {
        backgroundColor: '#1A5F2A',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 14,
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    ctaButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
        textAlign: 'center',
    },
});
