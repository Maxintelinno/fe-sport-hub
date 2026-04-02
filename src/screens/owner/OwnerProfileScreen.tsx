import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getOwnerProfile, OwnerProfileResponse, getRevenueReport, RevenueReportResponse, getBankAccounts, BankAccountsResponse } from '../../services/profileService';
import { ActivityIndicator, Alert } from 'react-native';

const { width } = Dimensions.get('window');
const PIE_SIZE = 220;

const PERIOD_TABS = [
    { key: 'all', label: 'รวม' },
    { key: 'day', label: 'วัน' },
    { key: 'month', label: 'เดือน' },
    { key: 'year', label: 'ปี' },
];

const CHART_COLORS = [
    '#1A5F2A', '#C5A021', '#4CAF50', '#FF9800', '#2196F3',
    '#9C27B0', '#E91E63', '#00BCD4', '#795548', '#607D8B',
];

// Simple pie chart using conic gradient approximation with View segments
function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) {
        return (
            <View style={pieStyles.container}>
                <View style={pieStyles.emptyCircle}>
                    <Text style={pieStyles.emptyText}>ยังไม่มีรายได้</Text>
                </View>
            </View>
        );
    }

    // Build segments as percentage arcs
    let cumulativePercent = 0;
    const segments = data.filter(d => d.value > 0).map((d) => {
        const percent = (d.value / total) * 100;
        const segment = { ...d, percent, start: cumulativePercent };
        cumulativePercent += percent;
        return segment;
    });

    return (
        <View style={pieStyles.container}>
            <View style={pieStyles.outerRing}>
                {/* Render colored segment indicators as stacked layers */}
                {segments.map((seg, i) => {
                    const rotation = (seg.start / 100) * 360;
                    const angle = (seg.percent / 100) * 360;
                    // For simplicity, use overlapping half-circles
                    return (
                        <View
                            key={i}
                            style={[
                                pieStyles.segment,
                                {
                                    backgroundColor: seg.color,
                                    transform: [{ rotate: `${rotation}deg` }],
                                    opacity: 0.9,
                                },
                            ]}
                        />
                    );
                })}
                {/* Inner white circle for donut effect */}
                <View style={pieStyles.innerCircle}>
                    <Text style={pieStyles.totalLabel}>รายได้รวม</Text>
                    <Text style={pieStyles.totalValue}>฿{total.toLocaleString()}</Text>
                </View>
            </View>
        </View>
    );
}

const pieStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
    },
    emptyCircle: {
        width: PIE_SIZE,
        height: PIE_SIZE,
        borderRadius: PIE_SIZE / 2,
        backgroundColor: '#f5f5f5',
        borderWidth: 3,
        borderColor: 'rgba(197, 160, 33, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        fontWeight: '600',
    },
    outerRing: {
        width: PIE_SIZE,
        height: PIE_SIZE,
        borderRadius: PIE_SIZE / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e0e0e0',
    },
    segment: {
        position: 'absolute',
        width: PIE_SIZE,
        height: PIE_SIZE / 2,
        top: 0,
        left: 0,
        transformOrigin: `${PIE_SIZE / 2}px ${PIE_SIZE / 2}px`,
    },
    innerCircle: {
        width: PIE_SIZE * 0.6,
        height: PIE_SIZE * 0.6,
        borderRadius: (PIE_SIZE * 0.6) / 2,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        zIndex: 10,
    },
    totalLabel: {
        fontSize: 11,
        color: '#888',
        fontWeight: '600',
        marginBottom: 2,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#C5A021',
    },
});

export default function OwnerProfileScreen() {
    const { user, logout } = useAuth();
    const navigation = useNavigation<any>();
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [profile, setProfile] = useState<OwnerProfileResponse | null>(null);
    const [revenueReport, setRevenueReport] = useState<RevenueReportResponse | null>(null);
    const [bankAccountStatus, setBankAccountStatus] = useState<BankAccountsResponse | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingRevenue, setLoadingRevenue] = useState(false);
    const [loadingBank, setLoadingBank] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                setLoadingProfile(true);
                setLoadingRevenue(true);
                setLoadingBank(true);
                try {
                    const profData = await getOwnerProfile();
                    setProfile(profData);
                    
                    const apiPeriod: any = selectedPeriod === 'all' ? 'total' : selectedPeriod;
                    const revData = await getRevenueReport(apiPeriod);
                    setRevenueReport(revData);

                    const bankData = await getBankAccounts();
                    setBankAccountStatus(bankData);
                } catch (error) {
                    console.error('Error fetching dashboard data:', error);
                } finally {
                    setLoadingProfile(false);
                    setLoadingRevenue(false);
                    setLoadingBank(false);
                }
            };

            if (user) {
                fetchData();
            }
        }, [user, selectedPeriod])
    );

    const revenueChartData = useMemo(() => {
        if (!revenueReport) return [];
        return revenueReport.by_field.map((f: any, idx: number) => ({
            label: f.field_name,
            value: f.revenue,
            color: CHART_COLORS[idx % CHART_COLORS.length],
            bookings: f.booking_count,
        }));
    }, [revenueReport]);

    if (!user) return null;

    if (loadingProfile && !profile) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#1A5F2A" />
            </View>
        );
    }

    // Use profile data if available, fallback to Auth user
    const displayName = profile?.user.name || user.name;
    const displayPhone = profile?.user.phone || user.phone || 'ไม่มีข้อมูลการติดต่อ';
    const fieldCount = profile?.stats.field_count ?? 0;
    const bookingCount = profile?.stats.booking_count ?? 0;
    const totalRevenue = profile?.stats.total_revenue ?? 0;
    const planName = profile?.plan.name || 'Free Plan';
    const fieldUsage = profile?.plan.field_usage || '0/1';
    const courtUsage = profile?.plan.court_usage || '0/2';
    
    // Period-specific revenue from report
    const currentPeriodRevenue = revenueReport?.total_revenue ?? 0;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Profile Header */}
            <View style={styles.profileCard}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarRing}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.crownBadge}>
                        <Text style={styles.crownIcon}>👑</Text>
                    </View>
                </View>
                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.email}>{displayPhone}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>🏆 เจ้าของสนาม</Text>
                </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.quickStatsRow}>
                <View style={styles.quickStatCard}>
                    <Text style={styles.quickStatIcon}>🏟️</Text>
                    <Text style={styles.quickStatValue}>{fieldCount}</Text>
                    <Text style={styles.quickStatLabel}>สนาม</Text>
                </View>
                <View style={styles.quickStatCard}>
                    <Text style={styles.quickStatIcon}>📋</Text>
                    <Text style={styles.quickStatValue}>{bookingCount}</Text>
                    <Text style={styles.quickStatLabel}>การจอง</Text>
                </View>
                <View style={styles.quickStatCard}>
                    <Text style={styles.quickStatIcon}>💰</Text>
                    <Text style={[styles.quickStatValue, { color: '#C5A021' }]}>
                        ฿{totalRevenue.toLocaleString()}
                    </Text>
                    <Text style={styles.quickStatLabel}>รายได้</Text>
                </View>
            </View>

            {/* Upgrade Card */}
            <TouchableOpacity 
                style={styles.upgradeCard}
                onPress={() => navigation.navigate('UpgradePlan')}
            >
                <View style={styles.upgradeLeft}>
                    <View style={styles.upgradePlanBadge}>
                        <Text>📦</Text>
                        <Text style={styles.upgradePlanText}>{planName}</Text>
                    </View>
                    <View style={styles.upgradeStatRow}>
                        <Text style={styles.upgradeStatItem}>สนาม: {fieldUsage}</Text>
                        <Text style={styles.upgradeStatItem}>คอร์ท: {courtUsage}</Text>
                    </View>
                </View>
                <View style={styles.upgradeAction}>
                    <Text style={styles.upgradeActionText}>🚀 Upgrade Now</Text>
                </View>
            </TouchableOpacity>

            {/* Revenue Section */}
            <View style={styles.revenueCard}>
                <View style={styles.revenueTitleRow}>
                    <Text style={styles.revenueTitle}>💎 รายได้ของคุณ</Text>
                    <TouchableOpacity
                        style={styles.viewDetailBtn}
                        onPress={() => navigation.navigate('RevenueDetail')}
                    >
                        <Text style={styles.viewDetailText}>ดูรายละเอียด →</Text>
                    </TouchableOpacity>
                </View>

                {/* Period Filter Tabs */}
                <View style={styles.periodTabsRow}>
                    {PERIOD_TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.periodTab, selectedPeriod === tab.key && styles.periodTabActive]}
                            onPress={() => setSelectedPeriod(tab.key)}
                        >
                            <Text style={[styles.periodTabText, selectedPeriod === tab.key && styles.periodTabTextActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Pie Chart / Center Summary */}
                {loadingRevenue ? (
                    <View style={{ height: PIE_SIZE, justifyContent: 'center' }}>
                        <ActivityIndicator color="#1A5F2A" />
                    </View>
                ) : (
                    <PieChart data={revenueChartData} />
                )}

                {/* Revenue Breakdown by Venue */}
                <View style={styles.breakdownSection}>
                    <Text style={styles.breakdownTitle}>🏟️ รายได้แยกตามสนาม</Text>
                    {loadingRevenue ? (
                         <ActivityIndicator size="small" color="#1A5F2A" style={{ marginVertical: 10 }} />
                    ) : (
                        revenueChartData.length === 0 ? (
                            <Text style={styles.noDataText}>ยังไม่มีสนาม</Text>
                        ) : (
                            revenueChartData.map((vr: any, idx: number) => (
                                <View key={idx} style={styles.breakdownItem}>
                                    <View style={styles.breakdownLeft}>
                                        <View style={[styles.colorDot, { backgroundColor: vr.color }]} />
                                        <View>
                                            <Text style={styles.breakdownName} numberOfLines={1}>{vr.label}</Text>
                                            <Text style={styles.breakdownBookings}>{vr.bookings} การจอง</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.breakdownValue}>฿{vr.value.toLocaleString()}</Text>
                                </View>
                            ))
                        )
                    )}
                </View>

                {/* Revenue Breakdown by Sport Type */}
                <View style={[styles.breakdownSection, { borderTopWidth: 0, marginTop: 0 }]}>
                    <Text style={styles.breakdownTitle}>⚽ รายได้แยกตามประเภทกีฬา</Text>
                    {loadingRevenue ? (
                         <ActivityIndicator size="small" color="#1A5F2A" style={{ marginVertical: 10 }} />
                    ) : (
                        !revenueReport || revenueReport.by_sport_type.length === 0 ? (
                            <Text style={styles.noDataText}>ยังไม่มีข้อมูลกีฬา</Text>
                        ) : (
                            revenueReport.by_sport_type.map((st: any, idx: number) => (
                                <View key={idx} style={styles.breakdownItem}>
                                    <View style={styles.breakdownLeft}>
                                        <View style={[styles.colorDot, { backgroundColor: CHART_COLORS[(idx + 6) % CHART_COLORS.length] }]} />
                                        <View>
                                            <Text style={styles.breakdownName}>{st.sport_type}</Text>
                                            <Text style={styles.breakdownBookings}>{st.booking_count} การจอง</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.breakdownValue}>฿{st.revenue.toLocaleString()}</Text>
                                </View>
                            ))
                        )
                    )}
                </View>
            </View>

            {/* Finance Section */}
            <View style={styles.financeSection}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>💎 การเงินของฉัน</Text>
                </View>
                
                <View style={styles.financeGrid}>
                    <TouchableOpacity 
                        style={styles.financeCard}
                        onPress={() => navigation.navigate('BankAccounts')}
                    >
                        <View style={styles.financeCardIconContainer}>
                            <Text style={styles.financeCardIcon}>💳</Text>
                        </View>
                        <View style={styles.financeCardContent}>
                            <Text style={styles.financeCardTitle}>บัญชีรับเงิน</Text>
                            <Text style={styles.financeCardSubtitle}>
                                {loadingBank ? 'กำลังโหลด...' : (bankAccountStatus?.has_bank_account ? 'ตรวจสอบสถานะ' : 'เพิ่มบัญชีรับเงิน')}
                            </Text>
                        </View>
                        <Text style={styles.chevronIcon}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.financeCard}
                        onPress={() => navigation.navigate('Withdraw')}
                    >
                        <View style={[styles.financeCardIconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                            <Text style={styles.financeCardIcon}>💸</Text>
                        </View>
                        <View style={styles.financeCardContent}>
                            <Text style={styles.financeCardTitle}>ถอนเงิน</Text>
                            <Text style={styles.financeCardSubtitle}>โอนเข้าบัญชีธนาคาร</Text>
                        </View>
                        <Text style={styles.chevronIcon}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.financeCard}
                        onPress={() => navigation.navigate('TransactionHistory')}
                    >
                        <View style={[styles.financeCardIconContainer, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                            <Text style={styles.financeCardIcon}>📄</Text>
                        </View>
                        <View style={styles.financeCardContent}>
                            <Text style={styles.financeCardTitle}>ประวัติการโอน</Text>
                            <Text style={styles.financeCardSubtitle}>ดูรายการย้อนหลัง</Text>
                        </View>
                        <Text style={styles.chevronIcon}>→</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Team Management Section */}
            <View style={[styles.financeSection, { marginTop: 16 }]}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>💼 การจัดการทีม</Text>
                </View>
                
                <View style={styles.financeGrid}>
                    <TouchableOpacity 
                        style={styles.financeCard}
                        onPress={() => navigation.navigate('MyEmployees')}
                    >
                        <View style={[styles.financeCardIconContainer, { backgroundColor: 'rgba(26, 95, 42, 0.1)' }]}>
                            <Text style={styles.financeCardIcon}>👥</Text>
                        </View>
                        <View style={styles.financeCardContent}>
                            <Text style={styles.financeCardTitle}>พนักงานของฉัน</Text>
                            <Text style={styles.financeCardSubtitle}>ดูและจัดการพนักงานในทีม</Text>
                        </View>
                        <Text style={styles.chevronIcon}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.financeCard}
                        onPress={() => navigation.navigate('AddEmployee')}
                    >
                        <View style={[styles.financeCardIconContainer, { backgroundColor: 'rgba(197, 160, 33, 0.1)' }]}>
                            <Text style={styles.financeCardIcon}>👤+</Text>
                        </View>
                        <View style={styles.financeCardContent}>
                            <Text style={styles.financeCardTitle}>เพิ่มพนักงาน</Text>
                            <Text style={styles.financeCardSubtitle}>ลงทะเบียนพนักงานใหม่</Text>
                        </View>
                        <Text style={styles.chevronIcon}>→</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Logout */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={async () => {
                    await logout();
                    // Reset navigation to Customer Home
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'CustomerMain' as any }],
                    });
                }}
            >
                <Text style={styles.logoutText}>ออกจากระบบ</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FBF9',
    },
    content: {
        padding: 16,
        paddingBottom: 50,
    },

    // Profile Card
    profileCard: {
        backgroundColor: '#1A5F2A',
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 6,
    },

    // Upgrade Card
    upgradeCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(26, 95, 42, 0.1)',
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    upgradeLeft: {
        flex: 1,
    },
    upgradePlanBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(26, 95, 42, 0.05)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    upgradePlanText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1A5F2A',
        marginLeft: 6,
    },
    upgradeStatRow: {
        flexDirection: 'row',
        gap: 16,
    },
    upgradeStatItem: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
    },
    upgradeAction: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C5A021',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        shadowColor: '#C5A021',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    upgradeActionText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#fff',
    },
    avatarSection: {
        position: 'relative',
        marginBottom: 14,
    },
    avatarRing: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: '#C5A021',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 78,
        height: 78,
        borderRadius: 39,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 34,
        fontWeight: '900',
    },
    crownBadge: {
        position: 'absolute',
        top: -8,
        right: -4,
    },
    crownIcon: {
        fontSize: 24,
    },
    name: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 10,
    },
    roleBadge: {
        backgroundColor: 'rgba(197, 160, 33, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(197, 160, 33, 0.4)',
    },
    roleText: {
        color: '#C5A021',
        fontSize: 13,
        fontWeight: '800',
    },

    // Quick Stats
    quickStatsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    quickStatCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(26, 95, 42, 0.06)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    quickStatIcon: {
        fontSize: 22,
        marginBottom: 6,
    },
    quickStatValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1A5F2A',
        marginBottom: 2,
    },
    quickStatLabel: {
        fontSize: 11,
        color: '#888',
        fontWeight: '600',
    },

    // Revenue Card
    revenueCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(197, 160, 33, 0.1)',
        shadowColor: '#C5A021',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    revenueTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    revenueTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1A5F2A',
    },
    viewDetailBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(197, 160, 33, 0.1)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(197, 160, 33, 0.2)',
    },
    viewDetailText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#C5A021',
    },

    // Period Tabs
    periodTabsRow: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 14,
        padding: 3,
        marginBottom: 8,
    },
    periodTab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    periodTabActive: {
        backgroundColor: '#1A5F2A',
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    periodTabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#888',
    },
    periodTabTextActive: {
        color: '#fff',
    },

    // Breakdown
    breakdownSection: {
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 16,
    },
    breakdownTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#333',
        marginBottom: 12,
    },
    noDataText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingVertical: 12,
    },
    breakdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
    },
    breakdownLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    breakdownName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    breakdownBookings: {
        fontSize: 12,
        color: '#888',
        marginTop: 1,
    },
    breakdownValue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1A5F2A', // Changed to match theme more consistently
    },

    // Venue Section
    venueSection: {
        marginBottom: 8,
    },
    venueSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    venueSectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1a1a1a',
    },
    addButton: {
        backgroundColor: '#1A5F2A',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '800',
    },
    venueCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 14,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(26, 95, 42, 0.06)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    venueThumb: {
        width: 65,
        height: 65,
        borderRadius: 14,
        backgroundColor: '#f0f7f0',
        marginRight: 12,
    },
    placeholderThumb: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(197, 160, 33, 0.2)',
        borderStyle: 'dashed',
    },
    placeholderText: {
        fontSize: 24,
    },
    venueInfo: { flex: 1 },
    venueHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    venueName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1a1a1a',
        flex: 1,
        marginRight: 8,
    },
    venueAddress: {
        fontSize: 12,
        color: '#777',
        marginBottom: 3,
    },
    venuePrice: {
        fontSize: 14,
        fontWeight: '800',
        color: '#C5A021',
    },
    venueTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
    },
    venueTagText: {
        fontSize: 11,
        color: '#1A5F2A',
        fontWeight: '700',
    },

    // Empty Venue
    emptyVenue: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyVenueIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    emptyVenueText: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },

    // Logout
    logoutButton: {
        marginTop: 12,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(200, 0, 0, 0.1)',
    },
    logoutText: {
        color: '#c00',
        fontSize: 16,
        fontWeight: '700',
    },

    // Finance Section
    financeSection: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(26, 95, 42, 0.06)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 3,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1A5F2A',
    },
    financeGrid: {
        gap: 12,
    },
    financeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FBF9',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(26, 95, 42, 0.04)',
    },
    financeCardIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(26, 95, 42, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    financeCardIcon: {
        fontSize: 24,
    },
    financeCardContent: {
        flex: 1,
    },
    financeCardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A5F2A',
        marginBottom: 2,
    },
    financeCardSubtitle: {
        fontSize: 13,
        color: '#777',
        fontWeight: '500',
    },
    chevronIcon: {
        fontSize: 18,
        color: 'rgba(26, 95, 42, 0.3)',
        fontWeight: '900',
    },
});
