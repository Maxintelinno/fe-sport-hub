import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getWithdrawalBalance, getBankAccounts, requestWithdrawal } from '../../services/profileService';

export default function WithdrawScreen() {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [balance, setBalance] = useState(0);
    const [mainAccount, setMainAccount] = useState<any>(null);
    const [amount, setAmount] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const FEE = 10;
    const MIN_WITHDRAW = 100;

    const fetchData = async () => {
        setLoading(true);
        
        // Fetch balance independently
        try {
            const balanceData = await getWithdrawalBalance();
            setBalance(balanceData.available_balance);
        } catch (error) {
            console.error('Error fetching balance:', error);
            setBalance(0);
        }

        // Fetch bank accounts independently
        try {
            const bankData = await getBankAccounts();
            const accounts = Array.isArray(bankData?.data) ? bankData.data : (bankData?.data ? [bankData.data] : []);
            
            // Filter according to user criteria:
            // verification_status = "verified", is_verified = true, is_default = true, status = "active"
            const primary = accounts.find((acc: any) => 
                (acc.verification_status === 'verified' || acc.status === 'verified') && 
                (acc.is_verified === true) && 
                (acc.is_default === true) &&
                (acc.status === 'active' || acc.account_status === 'active')
            );

            // Fallback if strict criteria not met, for showing something or the empty state
            setMainAccount(primary || null);
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
            setMainAccount(null);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
    );

    const handleWithdrawAll = () => {
        if (balance > 0) {
            setAmount(balance.toString());
        }
    };

    const validateWithdrawal = () => {
        const numAmount = parseFloat(amount);
        if (!amount || isNaN(numAmount)) {
            Alert.alert('กรุณากรอกจำนวนเงิน', 'โปรดระบุจำนวนเงินที่ต้องการถอน');
            return false;
        }
        if (numAmount < MIN_WITHDRAW) {
            Alert.alert('จำนวนเงินไม่ถูกต้อง', `ถอนขั้นต่ำคือ ฿${MIN_WITHDRAW}`);
            return false;
        }
        if (numAmount > balance) {
            Alert.alert('ยอดเงินไม่เพียงพอ', 'ยอดเงินที่ถอนได้ไม่เพียงพอ');
            return false;
        }
        if (!mainAccount) {
            Alert.alert('ไม่พบข้อมูลบัญชี', 'กรุณาเพิ่มบัญชีรับเงินก่อนทำการถอน');
            return false;
        }
        return true;
    };

    const onWithdrawPress = () => {
        if (validateWithdrawal()) {
            setShowConfirm(true);
        }
    };

    const handleConfirm = async () => {
        setShowConfirm(false);
        setSubmitting(true);
        try {
            const numAmount = parseFloat(amount);
            await requestWithdrawal({
                amount: numAmount,
                bank_account_id: mainAccount.id
            });
            
            navigation.navigate('WithdrawSuccess', {
                amount: numAmount,
                netAmount: numAmount - FEE,
                bankName: mainAccount.bank_name || mainAccount.bank_code,
                accountNumber: mainAccount.account_number
            });
        } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด', error instanceof Error ? error.message : 'ไม่สามารถส่งคำขอถอนเงินได้');
        } finally {
            setSubmitting(false);
        }
    };

    const netAmount = parseFloat(amount) ? Math.max(0, parseFloat(amount) - FEE) : 0;

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#1A5F2A" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
        >
            <ScrollView contentContainerStyle={styles.content}>
                {/* Available Balance Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💰 ยอดเงินที่ถอนออกได้</Text>
                    <View style={styles.balanceCard}>
                        <Text style={styles.balanceAmount}>฿{balance.toLocaleString()}</Text>
                        <Text style={styles.updateTime}>(อัปเดตล่าสุด: วันนี้ {new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')})</Text>
                    </View>
                </View>

                {/* Bank Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🏦 บัญชีรับเงิน</Text>
                    {mainAccount ? (
                        <View style={styles.bankCard}>
                            <View style={styles.bankInfo}>
                                <Text style={styles.bankName}>{mainAccount.bank_name || mainAccount.bank_code}</Text>
                                <Text style={styles.accountHolder}>{mainAccount.account_name}</Text>
                                <Text style={styles.accountNumber}>{mainAccount.account_number}</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.changeLink}
                                onPress={() => navigation.navigate('BankAccounts')}
                            >
                                <Text style={styles.changeLinkText}>[ เปลี่ยนบัญชี ]</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={styles.warningText}>⚠️ ยังไม่มีบัญชีรับเงิน</Text>
                            <TouchableOpacity 
                                style={styles.addLink}
                                onPress={() => navigation.navigate('AddBankAccount')}
                            >
                                <Text style={styles.addLinkText}>[ เพิ่มบัญชี ]</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Amount Input Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>จำนวนเงินที่ต้องการถอน</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput 
                            style={styles.amountInput}
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />
                        <TouchableOpacity style={styles.allButton} onPress={handleWithdrawAll}>
                            <Text style={styles.allButtonText}>ถอนทั้งหมด</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.feeInfoRow}>
                        <Text style={styles.feeLabel}>ถอนขั้นต่ำ: ฿{MIN_WITHDRAW}</Text>
                        <Text style={styles.feeLabel}>ค่าธรรมเนียม: ฿{FEE}</Text>
                    </View>
                </View>

                {/* Summary Section */}
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>คุณจะได้รับ:</Text>
                    <Text style={styles.summaryAmount}>฿{netAmount.toLocaleString()}</Text>
                    <Text style={styles.summaryNote}>(หลังหักค่าธรรมเนียม)</Text>
                </View>

                <TouchableOpacity 
                    style={[styles.withdrawButton, (!amount || submitting) && styles.disabledButton]}
                    onPress={onWithdrawPress}
                    disabled={!amount || submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.withdrawButtonText}>ถอนเงิน</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Confirmation Modal */}
            <Modal
                visible={showConfirm}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>ยืนยันการถอนเงิน</Text>
                        
                        <View style={styles.confirmDetails}>
                            <View style={styles.confirmRow}>
                                <Text style={styles.confirmLabel}>จำนวนเงิน:</Text>
                                <Text style={styles.confirmValue}>฿{parseFloat(amount).toLocaleString()}</Text>
                            </View>
                            <View style={styles.confirmRow}>
                                <Text style={styles.confirmLabel}>ค่าธรรมเนียม:</Text>
                                <Text style={styles.confirmValue}>฿{FEE}</Text>
                            </View>
                            <View style={[styles.confirmRow, styles.netRow]}>
                                <Text style={styles.confirmLabelPrimary}>รับสุทธิ:</Text>
                                <Text style={styles.confirmValuePrimary}>฿{netAmount.toLocaleString()}</Text>
                            </View>
                        </View>

                        <View style={styles.destInfo}>
                            <Text style={styles.destLabel}>ไปยัง:</Text>
                            <Text style={styles.destBank}>{mainAccount?.bank_name || mainAccount?.bank_code}</Text>
                            <Text style={styles.destNumber}>{mainAccount?.account_number}</Text>
                        </View>

                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                            <Text style={styles.confirmButtonText}>ยืนยันถอนเงิน</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowConfirm(false)}>
                            <Text style={styles.cancelButtonText}>ยกเลิก</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FBF9',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FBF9',
    },
    content: {
        padding: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#444',
        marginBottom: 16,
    },
    balanceCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(26, 95, 42, 0.1)',
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: '900',
        color: '#1A5F2A',
        marginBottom: 8,
    },
    updateTime: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
    },
    bankCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    bankInfo: {
        flex: 1,
    },
    bankName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A5F2A',
        marginBottom: 4,
    },
    accountHolder: {
        fontSize: 14,
        color: '#444',
        fontWeight: '600',
    },
    accountNumber: {
        fontSize: 14,
        color: '#777',
        fontWeight: '500',
    },
    changeLink: {
        padding: 8,
    },
    changeLinkText: {
        color: '#C5A021',
        fontWeight: '800',
        fontSize: 14,
    },
    emptyCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderStyle: 'dashed',
    },
    warningText: {
        fontSize: 15,
        color: '#666',
        fontWeight: '700',
        marginBottom: 12,
    },
    addLinkText: {
        color: '#1A5F2A',
        fontWeight: '800',
        fontSize: 15,
    },
    addLink: {
        padding: 8,
    },
    inputWrapper: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(26, 95, 42, 0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    amountInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: '800',
        color: '#333',
    },
    allButton: {
        backgroundColor: 'rgba(197, 160, 33, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    allButtonText: {
        color: '#C5A021',
        fontWeight: '800',
        fontSize: 13,
    },
    feeInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingHorizontal: 4,
    },
    feeLabel: {
        fontSize: 13,
        color: '#888',
        fontWeight: '600',
    },
    summaryBox: {
        backgroundColor: 'rgba(26, 95, 42, 0.03)',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 32,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '700',
        marginBottom: 8,
    },
    summaryAmount: {
        fontSize: 32,
        fontWeight: '900',
        color: '#C5A021',
        marginBottom: 4,
    },
    summaryNote: {
        fontSize: 12,
        color: '#999',
        fontWeight: '600',
    },
    withdrawButton: {
        backgroundColor: '#1A5F2A',
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    disabledButton: {
        backgroundColor: '#AAA',
        shadowOpacity: 0,
    },
    withdrawButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 32,
        alignItems: 'stretch',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1A5F2A',
        textAlign: 'center',
        marginBottom: 32,
    },
    confirmDetails: {
        backgroundColor: '#F9FBF9',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
    },
    confirmRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    confirmLabel: {
        fontSize: 15,
        color: '#666',
        fontWeight: '600',
    },
    confirmValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '700',
    },
    netRow: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        marginBottom: 0,
    },
    confirmLabelPrimary: {
        fontSize: 16,
        color: '#1A5F2A',
        fontWeight: '800',
    },
    confirmValuePrimary: {
        fontSize: 20,
        color: '#C5A021',
        fontWeight: '900',
    },
    destInfo: {
        marginBottom: 32,
        alignItems: 'center',
    },
    destLabel: {
        fontSize: 14,
        color: '#888',
        fontWeight: '700',
        marginBottom: 4,
    },
    destBank: {
        fontSize: 16,
        fontWeight: '800',
        color: '#333',
    },
    destNumber: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: '#1A5F2A',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    cancelButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#999',
        fontSize: 15,
        fontWeight: '700',
    },
});
