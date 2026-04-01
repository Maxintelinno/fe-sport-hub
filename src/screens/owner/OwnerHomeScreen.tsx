import React, { useState } from 'react';
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
import { getOwnerDashboard, OwnerDashboardResponse } from '../../services/profileService';
import { getOwnerBookings, OwnerBookingSlot } from '../../services/bookingService';
import { getOwnerFields } from '../../services/venueService';

const { width } = Dimensions.get('window');

// Enhanced Bar Chart showing 7 days
function RevenueChart({ data }: { data: { label: string; amount: number }[] }) {
  const isNoData = data.length === 0 || data.every(item => item.amount === 0);
  const maxVal = Math.max(...data.map(d => d.amount), 1000);
  
  return (
    <View style={chartStyles.container}>
      {isNoData ? (
        <View style={chartStyles.emptyContainer}>
          <Text style={chartStyles.emptyText}>ยังไม่มีข้อมูลรายได้</Text>
        </View>
      ) : (
        <View style={chartStyles.wrapper}>
            <View style={chartStyles.chartArea}>
                {data.map((item, idx) => {
                    const barHeight = (item.amount / maxVal) * 120;
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
  const [dashboard, setDashboard] = useState<OwnerDashboardResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [ownerBookings, setOwnerBookings] = useState<(OwnerBookingSlot & { court_name: string })[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await getOwnerDashboard();
      setDashboard(response.data);

      // Fetch bookings for the first field
      if (user?.id) {
        const fields = await getOwnerFields(user.id);
        if (fields && fields.length > 0) {
          setActiveFieldId(fields[0].id);
          await fetchBookings(fields[0].id);
        }
      }
    } catch (error: any) {
      // Fallback for non-UUID accounts or uninitialized data in staging
      const errorMsg = error?.message?.toLowerCase() || '';
      if (errorMsg.includes('uuid') || errorMsg.includes('record not found')) {
        console.warn('Dashboard data unavailable (UUID or Record Not Found). Using Zeroed initial state.');
        setDashboard({
          owner: { id: user?.id || '', fullname: user?.name || 'Owner', phone: '', avatar_initial: (user?.name || 'O').charAt(0).toUpperCase() },
          plan: { code: 'free', name: 'Free Plan', status: 'active', trial_days_left: 7, is_trial: true, price_after_trial: 999 },
          summary: { total_revenue: 0, revenue_growth_pct: 0, booking_count: 0, field_count: 0 },
          total_revenue: 0,
          revenue_growth_pct: 0,
          booking_count: 0,
          field_count: 0,
          alerts: [],
          next_actions: [
            { title: 'เพิ่มสนามใหม่ เพื่อรับลูกค้าเพิ่ม', message: 'คุณสามารถเพิ่มสนามได้อีก 1 สนาม', action_text: 'เพิ่มสนาม', action_type: 'create_field' }
          ],
          revenue_trend_7d: [
            { label: 'จ.', amount: 0 },
            { label: 'อ.', amount: 0 },
            { label: 'พ.', amount: 0 },
            { label: 'พฤ.', amount: 0 },
            { label: 'ศ.', amount: 0 },
            { label: 'ส.', amount: 0 },
            { label: 'อา.', amount: 0 },
          ]
        });
      } else {
        console.error('Error fetching dashboard data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (fieldId: string) => {
    try {
      setBookingLoading(true);
      const data = await getOwnerBookings(fieldId);
      
      const allSlots: (OwnerBookingSlot & { court_name: string })[] = [];
      data.courts.forEach(court => {
        court.booked_slots.forEach(slot => {
          allSlots.push({ ...slot, court_name: court.court_name });
        });
        court.available_slots.forEach(slot => {
          allSlots.push({ ...slot, court_name: court.court_name, type: 'available' });
        });
      });

      // Sort by start_time
      allSlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
      setOwnerBookings(allSlots);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setBookingLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  if (loading && !dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A5F2A" />
      </View>
    );
  }

  const isFreePlan = dashboard?.plan?.code?.toLowerCase().includes('free') || user?.subscription?.plan_name?.toLowerCase().includes('free');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.mainWrapper}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            
            {/* Header Section */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>สถิติร้านค้าของคุณ 📈</Text>
                    <Text style={styles.ownerName}>{dashboard?.owner.fullname || user?.name}</Text>
                    <View style={styles.planBadge}>
                        <Text style={styles.planText}>🟢 {dashboard?.plan.name || user?.subscription?.plan_name || 'Free Plan'}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{ dashboard?.owner.avatar_initial || (user?.name || 'O').charAt(0).toUpperCase() }</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Revenue Hero Card */}
            <View style={styles.heroCard}>
                <View style={styles.heroHeader}>
                    <Text style={styles.heroLabel}>รายได้รวมทั้งหมด</Text>
                    {dashboard?.revenue_growth_pct !== undefined && (
                        <View style={styles.heroTrend}>
                            <Text style={styles.heroTrendText}>
                                📈 {dashboard.revenue_growth_pct >= 0 ? '+' : ''}{dashboard.revenue_growth_pct}% จากสัปดาห์ที่แล้ว
                            </Text>
                        </View>
                    )}
                </View>
                <Text style={styles.heroValue}>
                  {(dashboard?.total_revenue || 0) === 0 ? '0' : `฿${dashboard?.total_revenue.toLocaleString()}`}
                </Text>
                
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
                    <Text style={[styles.statValue, (dashboard?.booking_count || 0) === 0 && { fontSize: 13, color: '#999' }]}>
                      {(dashboard?.booking_count || 0) === 0 ? '0' : dashboard?.booking_count}
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>สนามทั้งหมด</Text>
                    <Text style={[styles.statValue, (dashboard?.field_count || 0) === 0 && { fontSize: 13, color: '#999' }]}>
                      {(dashboard?.field_count || 0) === 0 ? '0' : dashboard?.field_count}
                    </Text>
                </View>
            </View>

            {/* Alerts Section (from API) */}
            {dashboard?.alerts && dashboard.alerts.length > 0 && dashboard.alerts.map((alert, idx) => (
                <TouchableOpacity 
                    key={idx}
                    style={[styles.bookingAlert, alert.type === 'error' && { backgroundColor: '#FFF5F5', borderColor: '#FFDADA' }]}
                    onPress={() => {
                        if (alert.action_type === 'upgrade') navigation.navigate('UpgradePlan');
                        if (alert.action_type === 'open_promotion') navigation.navigate('AllPromotions');
                    }}
                >
                    <View style={[styles.alertIconWrapper, alert.type === 'error' && { backgroundColor: '#FFEBEE' }]}>
                        <Text style={styles.alertEmoji}>{alert.type === 'warning' ? '⚠️' : alert.type === 'error' ? '🚫' : '🔔'}</Text>
                    </View>
                    <View style={styles.alertContent}>
                        <Text style={[styles.alertTitle, alert.type === 'error' && { color: '#C62828' }]}>{alert.title}</Text>
                        <Text style={styles.alertAction}>👉 {alert.message}</Text>
                    </View>
                </TouchableOpacity>
            ))}

            {/* To-Do Section (Next Actions from API) */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📌 สิ่งที่ควรทำตอนนี้</Text>
            </View>
            <View style={styles.todoList}>
                {dashboard?.booking_count !== undefined && dashboard.booking_count > 0 && (
                    <TouchableOpacity 
                        style={[styles.todoItem, { borderLeftWidth: 4, borderLeftColor: '#C5A021', paddingLeft: 12 }]} 
                        onPress={() => navigation.navigate('ManagementTab')}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.todoText}>📋 ตรวจสอบการจองล่าสุด</Text>
                            <Text style={styles.todoSubtext}>เพื่อเตรียมสนามให้พร้อม</Text>
                            <Text style={[styles.todoText, { color: '#1A5F2A', marginTop: 4 }]}>👉 [ ดูการจอง ]</Text>
                        </View>
                    </TouchableOpacity>
                )}
                {dashboard?.next_actions.map((action, idx) => (
                    <TouchableOpacity 
                        key={idx} 
                        style={styles.todoItem} 
                        onPress={() => {
                            if (action.action_type === 'create_field') navigation.navigate('AddVenueTab');
                            if (action.action_type === 'open_time') navigation.navigate('ManagementTab');
                            if (action.action_type === 'open_promotion') navigation.navigate('AllPromotions');
                        }}
                    >
                        <View style={styles.todoDot} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.todoText}>{action.title}</Text>
                            {action.message ? <Text style={styles.todoSubtext}>{action.message}</Text> : null}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Today's Bookings Section */}
            <View style={styles.sectionHeader}>
                <View>
                    <Text style={styles.sectionTitle}>📅 การจองวันนี้</Text>
                    <Text style={styles.sectionSubtitle}>
                        วันนี้มี {ownerBookings.filter(s => s.type === 'booked').length} การจอง
                    </Text>
                </View>
                {ownerBookings.some(s => s.type === 'booked') && (
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>
                            ถัดไป {ownerBookings.find(s => s.type === 'booked')?.start_time.substring(0, 5)} - {ownerBookings.find(s => s.type === 'booked')?.court_name}
                        </Text>
                    </View>
                )}
            </View>

            {bookingLoading ? (
                <View style={{ height: 160, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#1A5F2A" />
                </View>
            ) : ownerBookings.length > 0 ? (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.bookingScroll}
                    contentContainerStyle={styles.bookingScrollContent}
                >
                    {ownerBookings.map((slot, idx) => (
                        <TouchableOpacity 
                            key={idx} 
                            style={[
                                styles.bookingCard,
                                slot.type === 'available' && styles.availableCard
                            ]}
                            onPress={() => navigation.navigate('AddOfflineBooking', {
                                courtName: slot.court_name,
                                startTime: slot.start_time,
                                endTime: slot.end_time,
                                fieldId: activeFieldId,
                            })}
                            disabled={slot.type === 'booked'}
                        >
                            <View style={styles.bookingTimeRow}>
                                <Text style={styles.bookingTimeText}>
                                    {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                </Text>
                            </View>
                            <Text style={styles.bookingCourtText}>{slot.court_name}</Text>
                            
                            {slot.type === 'booked' ? (
                                <>
                                    <View style={styles.bookingCustomerRow}>
                                        <Text style={styles.bookingCustomerText} numberOfLines={1}>
                                            {slot.customer_name} · {slot.booking_source === 'online' ? 'ออนไลน์' : 'ออฟไลน์'}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.paymentBadge, 
                                        { backgroundColor: slot.payment_status === 'paid' ? '#E8F5E9' : '#FFF3E0' }
                                    ]}>
                                        <Text style={[
                                            styles.paymentBadgeText,
                                            { color: slot.payment_status === 'paid' ? '#2E7D32' : '#E65100' }
                                        ]}>
                                            {slot.payment_status === 'paid' ? 'ชำระแล้ว' : 'รอชำระ'}
                                        </Text>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.availableContent}>
                                    <View style={styles.availableBadge}>
                                        <Text style={styles.availableText}>ว่าง</Text>
                                    </View>
                                    <Text style={styles.availableSubtext}>เพิ่มการจองออฟไลน์</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            ) : (
                <View style={styles.emptyBookings}>
                    <Text style={styles.emptyBookingsText}>ไม่มีข้อมูลการจองสำหรับวันนี้</Text>
                </View>
            )}

            <View style={styles.bookingActionRow}>
                <TouchableOpacity 
                    style={styles.addOfflineBtn}
                    onPress={() => navigation.navigate('AddOfflineBooking', { fieldId: activeFieldId })}
                >
                    <Text style={styles.addOfflineBtnText}>+ เพิ่มการจองออฟไลน์</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.viewAllBtn}
                    onPress={() => navigation.navigate('ManagementTab')}
                >
                    <Text style={styles.viewAllBtnText}>ดูทั้งหมด</Text>
                </TouchableOpacity>
            </View>

            {/* Chart Section */}
            <View style={styles.sectionHeader}>
                <View>
                    <Text style={styles.sectionTitle}>แนวโน้มรายได้ (7 วันล่าสุด)</Text>
                    <Text style={styles.sectionSubtitle}>เปรียบเทียบสัปดาห์ก่อนหน้า</Text>
                </View>
            </View>
            <RevenueChart data={dashboard?.revenue_trend_7d || []} />

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
                        <Text style={styles.stickyTitle}>🔥 ลอง PRO ฟรี (เหลือ {dashboard?.plan.trial_days_left || 3} วันสุดท้าย)</Text>
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
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  alertIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
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
    color: '#92400E',
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
    alignItems: 'flex-start',
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
    marginTop: 6,
  },
  todoText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '700',
  },
  todoSubtext: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    fontWeight: '600',
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

  // Today's Bookings Styles
  statusBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFECB3',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F57F17',
  },
  bookingScroll: {
    marginBottom: 16,
  },
  bookingScrollContent: {
    paddingRight: 20,
    paddingVertical: 8,
  },
  bookingCard: {
    width: width * 0.48,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  availableCard: {
    backgroundColor: '#fff',
    borderStyle: 'dashed',
    borderColor: '#FFE0B2',
  },
  bookingTimeRow: {
    marginBottom: 4,
  },
  bookingTimeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  bookingCourtText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    marginBottom: 10,
  },
  bookingCustomerRow: {
    marginBottom: 12,
  },
  bookingCustomerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  paymentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  availableContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  availableBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  availableText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E65100',
  },
  availableSubtext: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  emptyBookings: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  emptyBookingsText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  bookingActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  addOfflineBtn: {
    flex: 1.5,
    backgroundColor: '#1A5F2A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOfflineBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  viewAllBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  viewAllBtnText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '800',
  },
});
