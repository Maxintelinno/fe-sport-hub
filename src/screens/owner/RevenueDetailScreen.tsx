import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getVenuesByOwner } from '../../data/venueStore';
import { getMockBookingsByVenue } from '../customer/BookingFormScreen';

const { width } = Dimensions.get('window');

const PERIOD_TABS = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'day', label: 'วันนี้' },
    { key: 'month', label: 'เดือนนี้' },
    { key: 'year', label: 'ปีนี้' },
];

const STATUSES = [
    { key: 'all', label: 'สถานะทั้งหมด' },
    { key: 'confirmed', label: 'ยืนยันแล้ว' },
    { key: 'pending', label: 'รอยืนยัน' },
    { key: 'cancelled', label: 'ยกเลิก' },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    confirmed: { label: 'ยืนยันแล้ว', color: '#1A5F2A', bg: '#e8f5e9', icon: '✅' },
    pending: { label: 'รอยืนยัน', color: '#C5A021', bg: '#fff8e1', icon: '⏳' },
    cancelled: { label: 'ยกเลิก', color: '#C0392B', bg: '#fde8e8', icon: '❌' },
};

const PAYMENT_METHODS = ['โอนผ่านธนาคาร', 'พร้อมเพย์', 'บัตรเครดิต', 'ชำระหน้างาน'];

export default function RevenueDetailScreen() {
    const { user } = useAuth();
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [selectedVenue, setSelectedVenue] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const ownerVenues = useMemo(() => {
        if (!user) return [];
        return getVenuesByOwner(user.id);
    }, [user]);

    const allBookings = useMemo(() => {
        if (!user) return [];
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const monthStr = now.toISOString().slice(0, 7);
        const yearStr = now.getFullYear().toString();

        const bookings: any[] = [];
        ownerVenues.forEach((venue) => {
            const vBookings = getMockBookingsByVenue(venue.id);

            // If vBookings is empty, let's inject some dummy data to make it look "website-like"
            const dataToUse = vBookings.length > 0 ? vBookings : generateMockData(venue, 5);

            dataToUse.forEach((b) => {
                let includePeriod = false;
                switch (selectedPeriod) {
                    case 'day':
                        includePeriod = b.date === todayStr;
                        break;
                    case 'month':
                        includePeriod = b.date?.startsWith(monthStr) ?? false;
                        break;
                    case 'year':
                        includePeriod = b.date?.startsWith(yearStr) ?? false;
                        break;
                    default:
                        includePeriod = true;
                }

                const includeVenue = selectedVenue === 'all' || selectedVenue === venue.name;
                const includeStatus = selectedStatus === 'all' || selectedStatus === b.status;

                if (includePeriod && includeVenue && includeStatus) {
                    const bAny = b as any;
                    bookings.push({
                        ...b,
                        venueName: venue.name,
                        sportType: venue.sportType,
                        paymentMethod: bAny.paymentMethod || PAYMENT_METHODS[Math.abs(bAny.id.charCodeAt(0)) % PAYMENT_METHODS.length],
                    });
                }
            });
        });

        // Sort by date descending
        bookings.sort((a, b) => (b.date > a.date ? 1 : b.date === b.date ? (b.startTime > a.startTime ? 1 : -1) : -1));
        return bookings;
    }, [user, ownerVenues, selectedPeriod, selectedVenue, selectedStatus]);

    const totalRevenue = useMemo(() => {
        return allBookings
            .filter((b) => b.status === 'confirmed')
            .reduce((sum, b) => sum + b.totalPrice, 0);
    }, [allBookings]);

    const renderTableRow = ({ item, index }: { item: any; index: number }) => {
        const status = STATUS_MAP[item.status] || STATUS_MAP.pending;
        const isAlternate = index % 2 === 1;

        return (
            <View style={[styles.tableRow, isAlternate && styles.tableRowAlt]}>
                <View style={[styles.col, { flex: 1.2 }]}>
                    <Text style={styles.cellMainText}>{item.date}</Text>
                    <Text style={styles.cellSubText}>{item.startTime} - {item.endTime}</Text>
                </View>
                <View style={[styles.col, { flex: 1.5 }]}>
                    <Text style={styles.cellMainText} numberOfLines={1}>{item.venueName}</Text>
                    <Text style={styles.cellSubText}>{item.sportType}</Text>
                </View>
                <View style={[styles.col, { flex: 1 }]}>
                    <Text style={styles.cellMainText}>{item.paymentMethod}</Text>
                </View>
                <View style={[styles.col, { flex: 1, alignItems: 'center' }]}>
                    <View style={[styles.tableStatusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.tableStatusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>
                <View style={[styles.col, { flex: 1, alignItems: 'flex-end' }]}>
                    <Text style={styles.cellPriceText}>฿{item.totalPrice.toLocaleString()}</Text>
                </View>
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.headerWrapper}>
            {/* Revenue Summary Card */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryDecorCircle1} />
                <View style={styles.summaryDecorCircle2} />
                <View style={styles.summaryContentBox}>
                    <View>
                        <Text style={styles.summaryLabel}>รายได้รวมทั้งหมด</Text>
                        <Text style={styles.summaryValue}>฿{totalRevenue.toLocaleString()}</Text>
                        <View style={styles.revenueTrendRow}>
                            <View style={styles.trendBadge}>
                                <Text style={styles.trendText}>▲ 12.5%</Text>
                            </View>
                            <Text style={styles.trendDesc}>เปรียบเทียบกับช่วงที่แล้ว</Text>
                        </View>
                    </View>
                    <View style={styles.revenueIconBg}>
                        <Text style={styles.revenueIconLarge}>📊</Text>
                    </View>
                </View>

                <View style={styles.summaryStatsGrid}>
                    <View style={styles.summaryStatBox}>
                        <Text style={styles.statBoxLabel}>รายการจอง</Text>
                        <Text style={styles.statBoxValue}>{allBookings.length}</Text>
                    </View>
                    <View style={styles.statBoxDivider} />
                    <View style={styles.summaryStatBox}>
                        <Text style={styles.statBoxLabel}>ยืนยันแล้ว</Text>
                        <Text style={[styles.statBoxValue, { color: '#4CAF50' }]}>
                            {allBookings.filter(b => b.status === 'confirmed').length}
                        </Text>
                    </View>
                    <View style={styles.statBoxDivider} />
                    <View style={styles.summaryStatBox}>
                        <Text style={styles.statBoxLabel}>รอยืนยัน</Text>
                        <Text style={[styles.statBoxValue, { color: '#FFA000' }]}>
                            {allBookings.filter(b => b.status === 'pending').length}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Quick Filters */}
            <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>ตัวกรองรายงาน</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {/* Period Tabs */}
                    <View style={styles.filterGroup}>
                        {PERIOD_TABS.map((tab) => (
                            <TouchableOpacity
                                key={tab.key}
                                style={[styles.filterTag, selectedPeriod === tab.key && styles.filterTagActive]}
                                onPress={() => setSelectedPeriod(tab.key)}
                            >
                                <Text style={[styles.filterTagText, selectedPeriod === tab.key && styles.filterTagTextActive]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.filterDivider} />

                    {/* Status Tabs */}
                    <View style={styles.filterGroup}>
                        {STATUSES.map((status) => (
                            <TouchableOpacity
                                key={status.key}
                                style={[styles.filterTag, selectedStatus === status.key && styles.filterTagActive]}
                                onPress={() => setSelectedStatus(status.key)}
                            >
                                <Text style={[styles.filterTagText, selectedStatus === status.key && styles.filterTagTextActive]}>
                                    {status.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                {/* Venue Filter */}
                <View style={styles.venueFilterRow}>
                    <Text style={styles.venueFilterLabel}>เลือกสนาม:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.venueFilterList}>
                        <TouchableOpacity
                            style={[styles.venueChip, selectedVenue === 'all' && styles.venueChipActive]}
                            onPress={() => setSelectedVenue('all')}
                        >
                            <Text style={[styles.venueChipText, selectedVenue === 'all' && styles.venueChipTextActive]}>
                                ทั้งหมด
                            </Text>
                        </TouchableOpacity>
                        {ownerVenues.map((v) => (
                            <TouchableOpacity
                                key={v.id}
                                style={[styles.venueChip, selectedVenue === v.name && styles.venueChipActive]}
                                onPress={() => setSelectedVenue(v.name)}
                            >
                                <Text style={[styles.venueChipText, selectedVenue === v.name && styles.venueChipTextActive]}>
                                    {v.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
                <View style={[styles.col, { flex: 1.2 }]}><Text style={styles.tableHeaderText}>วันที่/เวลา</Text></View>
                <View style={[styles.col, { flex: 1.5 }]}><Text style={styles.tableHeaderText}>สนาม</Text></View>
                <View style={[styles.col, { flex: 1 }]}><Text style={styles.tableHeaderText}>การชำระ</Text></View>
                <View style={[styles.col, { flex: 1, alignItems: 'center' }]}><Text style={styles.tableHeaderText}>สถานะ</Text></View>
                <View style={[styles.col, { flex: 1, alignItems: 'flex-end' }]}><Text style={styles.tableHeaderText}>ยอดรวม</Text></View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={allBookings}
                keyExtractor={(item) => item.id}
                renderItem={renderTableRow}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📂</Text>
                        <Text style={styles.emptyTitle}>ไม่พบข้อมูลตามเงื่อนไข</Text>
                        <Text style={styles.emptySubtext}>ลองปรับเปลี่ยนตัวกรองเพื่อดูข้อมูลอื่น</Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[0]} // Optional: if we want header to be sticky we should restructure
            />
        </View>
    );
}

// Helper to generate mock data for a better dashboard experience
function generateMockData(venue: any, count: number) {
    const data = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().slice(0, 10);
        data.push({
            id: `mock-${venue.id}-${i}`,
            venueId: venue.id,
            date: dateStr,
            startTime: '18:00',
            endTime: '19:00',
            totalPrice: venue.pricePerHour,
            status: i % 4 === 0 ? 'pending' : (i % 7 === 0 ? 'cancelled' : 'confirmed'),
            paymentMethod: PAYMENT_METHODS[i % PAYMENT_METHODS.length],
        });
    }
    return data;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F7F4',
    },
    listContent: {
        paddingBottom: 40,
    },
    headerWrapper: {
        backgroundColor: '#F4F7F4',
        padding: 16,
    },

    // Summary Card (Premium)
    summaryCard: {
        backgroundColor: '#1A5F2A',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    summaryDecorCircle1: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    summaryDecorCircle2: {
        position: 'absolute',
        bottom: -20,
        left: 20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    summaryContentBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    summaryLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
        marginBottom: 6,
    },
    summaryValue: {
        fontSize: 34,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    revenueTrendRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendBadge: {
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
    },
    trendText: {
        color: '#A5D6A7',
        fontSize: 12,
        fontWeight: '800',
    },
    trendDesc: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        fontWeight: '500',
    },
    revenueIconBg: {
        width: 60,
        height: 60,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    revenueIconLarge: {
        fontSize: 32,
    },
    summaryStatsGrid: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    summaryStatBox: {
        flex: 1,
        alignItems: 'center',
    },
    statBoxLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    statBoxValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    statBoxDivider: {
        width: 1,
        height: '80%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'center',
    },

    // Filter Section
    filterSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    filterSectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#333',
        marginBottom: 12,
    },
    filterScroll: {
        paddingBottom: 4,
    },
    filterGroup: {
        flexDirection: 'row',
        gap: 8,
    },
    filterTag: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#F0F2F0',
        borderWidth: 1,
        borderColor: '#E0E4E0',
    },
    filterTagActive: {
        backgroundColor: '#1A5F2A',
        borderColor: '#1A5F2A',
    },
    filterTagText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#666',
    },
    filterTagTextActive: {
        color: '#FFFFFF',
    },
    filterDivider: {
        width: 1,
        backgroundColor: '#EEE',
        marginHorizontal: 12,
    },
    venueFilterRow: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    venueFilterLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#888',
        marginRight: 10,
    },
    venueFilterList: {
        gap: 8,
    },
    venueChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#DDD',
    },
    venueChipActive: {
        backgroundColor: 'rgba(26, 95, 42, 0.1)',
        borderColor: '#1A5F2A',
    },
    venueChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    venueChipTextActive: {
        color: '#1A5F2A',
        fontWeight: '800',
    },

    // Table UI
    tableHeader: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#E8EBE8',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#D0D6D0',
    },
    tableHeaderText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#555',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        alignItems: 'center',
    },
    tableRowAlt: {
        backgroundColor: '#FBFDFA',
    },
    col: {
        justifyContent: 'center',
    },
    cellMainText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333',
    },
    cellSubText: {
        fontSize: 11,
        color: '#888',
        marginTop: 2,
    },
    cellPriceText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#1A5F2A',
    },
    tableStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tableStatusText: {
        fontSize: 10,
        fontWeight: '800',
    },

    // Empty state
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#333',
        marginBottom: 6,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#888',
    },
});
