import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getRevenueReport, RevenueReportResponse } from '../../services/profileService';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const PERIOD_TABS = [
    { key: 'all', label: 'รวม' },
    { key: 'day', label: 'วัน' },
    { key: 'month', label: 'เดือน' },
    { key: 'year', label: 'ปี' },
];

export default function RevenueDetailScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [report, setReport] = useState<RevenueReportResponse | null>(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                const apiPeriod: any = selectedPeriod === 'all' ? 'total' : selectedPeriod;
                const data = await getRevenueReport(apiPeriod);
                setReport(data);
            } catch (error) {
                console.error('Error fetching revenue report:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchReport();
        }
    }, [user, selectedPeriod]);

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>รายได้ของคุณ</Text>
            <View style={{ width: 40 }} />
        </View>
    );

    if (loading && !report) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#1A5F2A" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {renderHeader()}
                
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Period Filter Tabs */}
                    <View style={styles.periodTabsWrapper}>
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
                    </View>

                    {/* Main Progress/Circle */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressCircle}>
                            {report?.total_revenue === 0 ? (
                                <Text style={styles.noRevenueText}>ยังไม่มีรายได้</Text>
                            ) : (
                                <View style={styles.revenueValueBox}>
                                    <Text style={styles.revenueCurrency}>฿</Text>
                                    <Text style={styles.revenueValue}>
                                        {report?.total_revenue.toLocaleString()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Breakdown by Field */}
                    <View style={styles.breakdownSection}>
                        <Text style={styles.sectionTitle}>🏟️ รายได้แยกตามสนาม</Text>
                        {report?.by_field.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>ยังไม่มีข้อมูลสนาม</Text>
                            </View>
                        ) : (
                            report?.by_field.map((f, idx) => (
                                <View key={f.field_id} style={styles.breakdownRow}>
                                    <View style={styles.rowLeft}>
                                        <View style={[styles.dot, { backgroundColor: ['#1A5F2A', '#C5A021', '#4CAF50', '#FF9800'][idx % 4] }]} />
                                        <Text style={styles.fieldName}>{f.field_name}</Text>
                                    </View>
                                    <Text style={styles.fieldRevenue}>฿{f.revenue.toLocaleString()}</Text>
                                </View>
                            ))
                        )}
                    </View>

                    {/* Breakdown by Sport Type */}
                    <View style={[styles.breakdownSection, { marginTop: 0 }]}>
                        <Text style={styles.sectionTitle}>⚽ รายได้แยกตามประเภทกีฬา</Text>
                        {report?.by_sport_type.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>ยังไม่มีข้อมูลกีฬา</Text>
                            </View>
                        ) : (
                            report?.by_sport_type.map((st, idx) => (
                                <View key={idx} style={styles.breakdownRow}>
                                    <View style={styles.rowLeft}>
                                        <View style={[styles.dot, { backgroundColor: ['#2196F3', '#9C27B0', '#E91E63', '#00BCD4'][idx % 4] }]} />
                                        <Text style={styles.fieldName}>{st.sport_type}</Text>
                                    </View>
                                    <Text style={styles.fieldRevenue}>฿{st.revenue.toLocaleString()}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 24,
        color: '#333',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1a1a1a',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    periodTabsWrapper: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 20,
    },
    periodTabsRow: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        padding: 4,
    },
    periodTab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    periodTabActive: {
        backgroundColor: '#1A5F2A',
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    periodTabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#888',
    },
    periodTabTextActive: {
        color: '#fff',
    },
    progressSection: {
        alignItems: 'center',
        marginVertical: 40,
    },
    progressCircle: {
        width: 240,
        height: 240,
        borderRadius: 120,
        borderWidth: 12,
        borderColor: '#f8f8f8',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    noRevenueText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#ccc',
    },
    revenueValueBox: {
        alignItems: 'center',
    },
    revenueCurrency: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A5F2A',
        marginBottom: 4,
    },
    revenueValue: {
        fontSize: 36,
        fontWeight: '900',
        color: '#1a1a1a',
    },
    breakdownSection: {
        paddingHorizontal: 24,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1a1a1a',
        marginBottom: 20,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 14,
    },
    fieldName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    fieldRevenue: {
        fontSize: 17,
        fontWeight: '900',
        color: '#1A5F2A',
    },
    emptyBox: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 15,
        color: '#bbb',
        fontWeight: '600',
    },
});
