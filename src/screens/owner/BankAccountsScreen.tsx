import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getBankAccounts, setDefaultBankAccount, deleteBankAccount, BankAccountsResponse } from '../../services/profileService';

const { width } = Dimensions.get('window');

export default function BankAccountsScreen() {
    const navigation = useNavigation<any>();
    const [bankData, setBankData] = useState<BankAccountsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        // Only show loading indicator on first load
        if (!bankData) setLoading(true);
        try {
            const data = await getBankAccounts();
            setBankData(data);
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
    );

    const handleSetDefault = async (id: string) => {
        try {
            setLoading(true);
            await setDefaultBankAccount(id);
            Alert.alert('✅ สำเร็จ', 'ตั้งค่าเป็นบัญชีหลักเรียบร้อยแล้ว');
            await fetchData();
        } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด', error instanceof Error ? error.message : 'ไม่สามารถเปลี่ยนบัญชีหลักได้');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            'ยืนยันการลบ',
            'คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีนี้?',
            [
                { text: 'ยกเลิก', style: 'cancel' },
                { 
                    text: 'ลบ', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await deleteBankAccount(id);
                            Alert.alert('✅ สำเร็จ', 'ลบบัญชีเรียบร้อยแล้ว');
                            await fetchData();
                        } catch (error) {
                            Alert.alert('เกิดข้อผิดพลาด', error instanceof Error ? error.message : 'ไม่สามารถลบบัญชีได้');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading && !bankData) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#1A5F2A" />
            </View>
        );
    }

    const hasBankAccount = bankData?.has_bank_account;
    const accounts = Array.isArray(bankData?.data) ? bankData.data : (bankData?.data ? [bankData.data] : []);
    const mainAccount = accounts.find((acc: any) => acc.is_default) || accounts[0];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>บัญชีรับเงิน</Text>
                <Text style={styles.headerSubtitle}>จัดการบัญชีธนาคารสำหรับรับรายได้ของคุณ</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>🟡 บัญชีหลัก (สำคัญสุด)</Text>
                </View>

                {hasBankAccount && mainAccount ? (
                    <View style={styles.mainAccountCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.cardIcon}>💳</Text>
                            </View>
                            <Text style={styles.cardTitle}>บัญชีหลักของคุณ</Text>
                        </View>
                        
                        <View style={styles.accountDetails}>
                            <Text style={styles.bankName}>{mainAccount.bank_name || mainAccount.bank_code}</Text>
                            <Text style={styles.accountHolder}>{mainAccount.account_name}</Text>
                            <Text style={styles.accountNumber}>{mainAccount.account_number}</Text>
                        </View>

                        <View style={styles.statusRow}>
                            {mainAccount.verification_status === 'verified' || mainAccount.status === 'verified' ? (
                                <View style={styles.verifiedBadge}>
                                    <Text style={styles.verifiedText}>✅ ยืนยันแล้ว</Text>
                                </View>
                            ) : (
                                <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(255, 152, 0, 0.1)', borderColor: 'rgba(255, 152, 0, 0.2)' }]}>
                                    <Text style={[styles.verifiedText, { color: '#EF6C00' }]}>⏳ รอตรวจสอบ</Text>
                                </View>
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyCard}>
                        <Text style={styles.warningIcon}>⚠️</Text>
                        <Text style={styles.emptyText}>ยังไม่ได้ตั้งค่าบัญชีรับเงิน</Text>
                    </View>
                )}
            </View>

            {/* All Accounts Section */}
            {hasBankAccount && accounts.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>🟢 รายการบัญชีทั้งหมด</Text>
                    </View>

                    {accounts.map((acc: any, index: number) => (
                        <View key={index} style={styles.accountItemCard}>
                            <View style={styles.accountItemHeader}>
                                <TouchableOpacity 
                                    onPress={() => !acc.is_default && handleSetDefault(acc.id)}
                                    style={styles.checkIconWrapper}
                                >
                                    <Text style={[styles.checkIcon, acc.is_default && styles.checkIconActive]}>
                                        {acc.is_default ? '[✓]' : '[ ]'}
                                    </Text>
                                </TouchableOpacity>
                                <Text style={styles.accountItemTitle}>{acc.bank_code} - {acc.account_number}</Text>
                            </View>
                            <View style={styles.accountItemBody}>
                                <Text style={styles.accountItemLabel}>ชื่อ: <Text style={styles.accountItemValue}>{acc.account_name}</Text></Text>
                                <Text style={styles.accountItemLabel}>สถานะ: <Text style={[styles.accountItemValue, (acc.verification_status === 'verified' || acc.status === 'verified') ? {color: '#2E7D32'} : {color: '#EF6C00'}]}>
                                    {(acc.verification_status === 'verified' || acc.status === 'verified') ? 'ยืนยันแล้ว' : 'รอตรวจสอบ'}
                                </Text></Text>
                            </View>
                            <View style={styles.accountItemActions}>
                                {!acc.is_default && (
                                    <>
                                        <TouchableOpacity 
                                            style={styles.actionLink}
                                            onPress={() => handleSetDefault(acc.id)}
                                        >
                                            <Text style={styles.actionLinkText}>[ ตั้งเป็นบัญชีหลัก ]</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={styles.actionLink}
                                            onPress={() => handleDelete(acc.id)}
                                        >
                                            <Text style={[styles.actionLinkText, { color: '#D32F2F' }]}>[ ลบ ]</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                                <TouchableOpacity 
                                    style={styles.actionLink}
                                    onPress={() => navigation.navigate('EditBankAccount', { account: acc })}
                                >
                                    <Text style={styles.actionLinkText}>[ แก้ไข ]</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Add Account CTA */}
            <View style={styles.ctaContainer}>
                <TouchableOpacity 
                    style={styles.primaryAddButton}
                    onPress={() => navigation.navigate('AddBankAccount')}
                >
                    <Text style={styles.primaryAddButtonText}>+ เพิ่มบัญชีรับเงิน</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                    * โปรดตรวจสอบความถูกต้องของข้อมูลบัญชีธนาคารเพื่อให้การถอนเงินเป็นไปอย่างรวดเร็วและปลอดภัย
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FBF9',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1A5F2A',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeaderRow: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#333',
    },
    mainAccountCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(26, 95, 42, 0.1)',
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(197, 160, 33, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardIcon: {
        fontSize: 22,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#C5A021',
    },
    accountDetails: {
        marginBottom: 20,
    },
    bankName: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1A5F2A',
        marginBottom: 4,
    },
    accountHolder: {
        fontSize: 16,
        color: '#444',
        fontWeight: '600',
        marginBottom: 4,
    },
    accountNumber: {
        fontSize: 18,
        color: '#777',
        letterSpacing: 1.5,
        fontWeight: '700',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    verifiedBadge: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.2)',
    },
    verifiedText: {
        fontSize: 13,
        color: '#2E7D32',
        fontWeight: '800',
    },
    changeButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    changeButtonText: {
        fontSize: 15,
        color: '#C5A021',
        fontWeight: '800',
    },
    emptyCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderStyle: 'dashed',
    },
    warningIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '700',
        marginBottom: 24,
    },
    addButton: {
        backgroundColor: '#1A5F2A',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
    },
    infoBox: {
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 16,
    },
    infoText: {
        fontSize: 12,
        color: '#888',
        lineHeight: 18,
        textAlign: 'center',
    },

    // New Styles
    accountItemCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    accountItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    checkIcon: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A5F2A',
        marginRight: 8,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    accountItemTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#333',
    },
    accountItemBody: {
        marginLeft: 28,
        marginBottom: 12,
    },
    accountItemLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    accountItemValue: {
        fontWeight: '700',
        color: '#444',
    },
    accountItemActions: {
        flexDirection: 'row',
        marginLeft: 24,
    },
    actionLink: {
        marginRight: 16,
    },
    actionLinkText: {
        fontSize: 14,
        color: '#C5A021',
        fontWeight: '800',
    },
    ctaContainer: {
        marginTop: 12,
        marginBottom: 20,
    },
    primaryAddButton: {
        backgroundColor: '#1A5F2A',
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    primaryAddButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
    checkIconWrapper: {
        paddingRight: 10,
    },
    checkIconActive: {
        color: '#1A5F2A',
        fontWeight: '900',
    },
});
