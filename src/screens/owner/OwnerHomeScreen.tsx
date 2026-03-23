import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getOwnerProfile, OwnerProfileResponse, getRevenueReport, RevenueReportResponse } from '../../services/profileService';

const { width } = Dimensions.get('window');

// Enhanced Bar Chart showing 7 days
function RevenueChart({ data }: { data: { label: string; value: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.value), 1000);
  
  return (
    <View style={chartStyles.container}>
      {data.length === 0 ? (
        <View style={chartStyles.emptyContainer}>
          <Text style={chartStyles.emptyText}>ยังไม่มีข้อมูลรายได้</Text>
        </View>
      ) : (
        <View style={chartStyles.wrapper}>
            <View style={chartStyles.chartArea}>
                {data.map((item, idx) => {
                    const barHeight = (item.value / maxVal) * 120;
                    return (
                        <View key={idx} style={chartStyles.barColumn}>
                            <View style={chartStyles.barBackground}>
                                <View 
                                    style={[
                                        chartStyles.barFill, 
                                        { height: barHeight, backgroundColor: idx === 6 ? '#1A5F2A' : '#C5A021' }
                                    ]} 
                                />
                            </View>
                            <Text style={chartStyles.barLabel}>{item.label}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
      )}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: {
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
  },
  wrapper: {
    flex: 1,
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barBackground: {
    width: 12,
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: '700',
  },
});

export default function OwnerHomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<OwnerProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulated 7-day data
  const weeklyData = [
    { label: 'จ.', value: 1200 },
    { label: 'อ.', value: 1900 },
    { label: 'พ.', value: 1500 },
    { label: 'พฤ.', value: 2200 },
    { label: 'ศ.', value: 2800 },
    { label: 'ส.', value: 3500 },
    { label: 'อา.', value: 1800 },
  ];

  const fetchData = async () => {
    try {
      const profData = await getOwnerProfile();
      setProfile(profData);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      // Fallback for non-UUID accounts in staging to avoid blank screen
      if (error?.message?.toLowerCase().includes('uuid')) {
        setProfile({
          user: { name: (user?.name || 'Owner User'), phone: '', role: 'owner', avatar_url: '', initials: 'O' },
          stats: { field_count: 2, booking_count: 15, total_revenue: 27500 },
          plan: { name: 'Free Plan', field_usage: '2/1', court_usage: '5/2', can_upgrade: true },
          revenue_summary: { total: 27500, daily: 0, monthly: 12000, yearly: 27500 }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A5F2A" />
      </View>
    );
  }

  const isFreePlan = (profile?.plan?.name || user?.subscription?.plan_name || 'Free Plan')
    .toLowerCase()
    .includes('free');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.mainWrapper}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            
            {/* Header Section */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>สถิติร้านค้าของคุณ 📈</Text>
                    <Text style={styles.ownerName}>{profile?.user.name || user?.name}</Text>
                    <View style={styles.planBadge}>
                        <Text style={styles.planText}>🟢 {profile?.plan?.name || user?.subscription?.plan_name || 'Free Plan'}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{ (profile?.user.name || user?.name || 'O').charAt(0).toUpperCase() }</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Revenue Hero Card */}
            <View style={styles.heroCard}>
                <View style={styles.heroHeader}>
                    <Text style={styles.heroLabel}>รายได้รวมทั้งหมด</Text>
                    <View style={styles.heroTrend}>
                        <Text style={styles.heroTrendText}>📈 +20% จากสัปดาห์ที่แล้ว</Text>
                    </View>
                </View>
                <Text style={styles.heroValue}>฿{(profile?.stats.total_revenue || 0).toLocaleString()}</Text>
                
                <TouchableOpacity 
                    style={styles.heroAction}
                    onPress={() => navigation.navigate('RevenueDetail')}
                >
                    <Text style={styles.heroActionText}>ดูรายงานรายได้ละเอียด</Text>
                    <Text style={styles.heroActionIcon}>→</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>การจอง</Text>
                    <Text style={styles.statValue}>{profile?.stats.booking_count || 0}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>สนามทั้งหมด</Text>
                    <Text style={styles.statValue}>{profile?.stats.field_count || 0}</Text>
                </View>
            </View>

            {/* Dynamic Alert Section */}
            {profile?.revenue_summary.daily === 0 && (
                <TouchableOpacity 
                    style={styles.bookingAlert}
                    onPress={() => navigation.navigate('UpgradePlan')}
                >
                    <View style={styles.alertIconWrapper}>
                        <Text style={styles.alertEmoji}>⚠️</Text>
                    </View>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>วันนี้ยังไม่มีการจอง</Text>
                        <Text style={styles.alertAction}>👉 เปิดโปรโมชั่นเพื่อเพิ่มลูกค้าทันที</Text>
                    </View>
                </TouchableOpacity>
            )}

            {/* To-Do Section (High conversion) */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📌 สิ่งที่ควรทำตอนนี้</Text>
            </View>
            <View style={styles.todoList}>
                <TouchableOpacity style={styles.todoItem} onPress={() => navigation.navigate('ManagementTab')}>
                    <View style={styles.todoDot} />
                    <Text style={styles.todoText}>เปิดช่วงเวลาขายดี <Text style={styles.todoHighlight}>18:00 – 21:00</Text></Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.todoItem} onPress={() => navigation.navigate('AllPromotions')}>
                    <View style={styles.todoDot} />
                    <Text style={styles.todoText}>จัดโปรโมชั่นช่วงเช้าเพื่อดึงคน</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.todoItem} onPress={() => navigation.navigate('AddVenueTab')}>
                    <View style={styles.todoDot} />
                    <Text style={styles.todoText}>เพิ่มสนามใหม่ เพื่อรับลูกค้าเพิ่ม</Text>
                </TouchableOpacity>
            </View>

            {/* Chart Section */}
            <View style={styles.sectionHeader}>
                <View>
                    <Text style={styles.sectionTitle}>แนวโน้มรายได้ (7 วันล่าสุด)</Text>
                    <Text style={styles.sectionSubtitle}>เปรียบเทียบสัปดาห์ก่อนหน้า</Text>
                </View>
            </View>
            <RevenueChart data={weeklyData} />

            {/* Quick Actions Grid */}
            <View style={styles.actionGrid}>
                <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('AddVenueTab')}
                >
                    <View style={[styles.actionIconBg, { backgroundColor: '#E8F5E9' }]}>
                        <Text style={styles.actionEmoji}>➕</Text>
                    </View>
                    <Text style={styles.actionLabel}>เพิ่มสนาม</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('ManagementTab')}
                >
                    <View style={[styles.actionIconBg, { backgroundColor: '#FFF8E1' }]}>
                        <Text style={styles.actionEmoji}>📋</Text>
                    </View>
                    <Text style={styles.actionLabel}>จัดการสนาม</Text>
                </TouchableOpacity>
            </View>

            {/* PRO Revenue Banner */}
            <TouchableOpacity 
                style={styles.proBanner}
                onPress={() => navigation.navigate('UpgradePlan')}
            >
                <View style={styles.proInfo}>
                    <Text style={styles.proImpactText}>💰 เพิ่มรายได้ +27,000/เดือน</Text>
                    <Text style={styles.proPriceText}>จ่ายแค่ ฿999/เดือน • <Text style={styles.proProfit}>กำไรเพิ่ม ~฿26k+</Text></Text>
                </View>
                <TouchableOpacity 
                    style={styles.proGhostBtn}
                    onPress={() => navigation.navigate('UpgradePlan')}
                >
                    <Text style={styles.proGhostBtnText}>ดูรายละเอียด</Text>
                </TouchableOpacity>
            </TouchableOpacity>

            <View style={{ height: 100 }} />
        </ScrollView>

        {/* Sticky Bottom CTA */}
        {isFreePlan && (
            <View style={styles.stickyContainer}>
                <TouchableOpacity 
                    style={styles.stickyBtn}
                    onPress={() => navigation.navigate('ConfirmTrial')}
                >
                    <View style={styles.stickyBtnLeft}>
                        <Text style={styles.stickyTitle}>🔥 ลอง PRO ฟรี (เหลือ 3 วันสุดท้าย)</Text>
                        <Text style={styles.stickyDesc}>ยกเลิกได้ทุกเมื่อ • ไม่มีการผูกมัด • ไม่คิดเงินทันที</Text>
                    </View>
                    <View style={styles.stickyBtnRight}>
                        <Text style={styles.stickyActionText}>เริ่มใช้ฟรีเลย</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FBF9',
  },
  mainWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ownerName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  planBadge: {
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 0.5,
    borderColor: '#C8E6C9',
  },
  planText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E7D32',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A5F2A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#1A5F2A',
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
  },
  heroTrend: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  heroTrendText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  heroValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 24,
  },
  heroAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  heroActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  heroActionIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#eee',
  },

  // Alert
  bookingAlert: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFDADA',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  alertIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertEmoji: {
    fontSize: 20,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#C62828',
    marginBottom: 2,
  },
  alertAction: {
    fontSize: 13,
    color: '#444',
    fontWeight: '700',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginTop: 2,
  },

  // To-Do List
  todoList: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  todoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C5A021',
    marginRight: 12,
  },
  todoText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '700',
  },
  todoHighlight: {
    color: '#1A5F2A',
    fontWeight: '900',
  },

  // Actions Grid
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionEmoji: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#333',
  },

  // PRO Banner
  proBanner: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  proInfo: {
    flex: 1,
  },
  proImpactText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#C5A021',
    marginBottom: 4,
  },
  proPriceText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  proProfit: {
    color: '#4CAF50',
    fontWeight: '800',
  },
  proGhostBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 12,
  },
  proGhostBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },

  // Sticky CTA
  stickyContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  stickyBtn: {
    backgroundColor: '#1A5F2A',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stickyBtnLeft: {
    flex: 1,
  },
  stickyTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 2,
  },
  stickyDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '600',
  },
  stickyBtnRight: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginLeft: 12,
  },
  stickyActionText: {
    color: '#1A5F2A',
    fontSize: 13,
    fontWeight: '900',
  },
});
