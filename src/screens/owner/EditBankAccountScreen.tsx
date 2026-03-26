import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updateBankAccount } from '../../services/profileService';

const BANKS = [
    { code: 'KBANK', name: 'ธนาคารกสิกรไทย (KBANK)', display: 'Kasikornbank' },
    { code: 'SCB', name: 'ธนาคารไทยพาณิชย์ (SCB)', display: 'SCB' },
    { code: 'BBL', name: 'ธนาคารกรุงเทพ (BBL)', display: 'Bangkok Bank' },
    { code: 'KTB', name: 'ธนาคารกรุงไทย (KTB)', display: 'Krung Thai Bank' },
    { code: 'BAY', name: 'ธนาคารกรุงศรีอยุธยา (BAY)', display: 'Krungsri' },
    { code: 'TTB', name: 'ธนาคารทีทีบี (TTB)', display: 'ttb' },
    { code: 'GSB', name: 'ธนาคารออมสิน (GSB)', display: 'Government Savings Bank' },
];

export default function EditBankAccountScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { account } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [promptPay, setPromptPay] = useState('');
    const [showBankSelector, setShowBankSelector] = useState(false);

    useEffect(() => {
        if (account) {
            const bank = BANKS.find(b => b.code === account.bank_code) || BANKS.find(b => b.display === account.bank_name);
            setSelectedBank(bank || { code: account.bank_code, name: account.bank_name, display: account.bank_name });
            setAccountName(account.account_name);
            setAccountNumber(account.account_number);
            setPromptPay(account.prompt_pay || '');
        }
    }, [account]);

    const handleSave = async () => {
        if (!selectedBank || !accountName || !accountNumber) {
            Alert.alert('กรุณากรอกข้อมูล', 'โปรดกรอกข้อมูลธนาคาร ชื่อบัญชี และเลขที่บัญชีให้ครบถ้วน');
            return;
        }

        setLoading(true);
        try {
            await updateBankAccount(account.id, {
                bank_code: selectedBank.code,
                bank_name: selectedBank.display || selectedBank.name,
                account_name: accountName,
                account_number: accountNumber,
                is_default: account.is_default,
                prompt_pay: promptPay || undefined,
            });
            
            Alert.alert(
                '✅ แก้ไขบัญชีสำเร็จ',
                'ข้อมูลบัญชีของคุณถูกอัปเดตเรียบร้อยแล้ว',
                [
                    {
                        text: 'ตกลง',
                        onPress: () => navigation.goBack(),
                    }
                ]
            );
        } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด', error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>แก้ไขบัญชีรับเงิน</Text>
                    <Text style={styles.headerSubtitle}>ตรวจสอบและแก้ไขข้อมูลบัญชีธนาคารของคุณ</Text>
                </View>

                <View style={styles.form}>
                    {/* Bank Selection */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>เลือกธนาคาร</Text>
                        <TouchableOpacity 
                            style={styles.selector}
                            onPress={() => setShowBankSelector(!showBankSelector)}
                        >
                            <Text style={[styles.selectorText, !selectedBank && styles.placeholder]}>
                                {selectedBank ? selectedBank.name : 'คลิกเพื่อเลือกธนาคาร'}
                            </Text>
                            <Text style={styles.chevron}>{showBankSelector ? '▲' : '▼'}</Text>
                        </TouchableOpacity>
                        
                        {showBankSelector && (
                            <View style={styles.bankDropdown}>
                                {BANKS.map((bank) => (
                                    <TouchableOpacity 
                                        key={bank.code}
                                        style={styles.bankItem}
                                        onPress={() => {
                                            setSelectedBank(bank);
                                            setShowBankSelector(false);
                                        }}
                                    >
                                        <Text style={styles.bankItemText}>{bank.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Account Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ชื่อบัญชี</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="ระบุชื่อ-นามสกุล เจ้าของบัญชี"
                            value={accountName}
                            onChangeText={setAccountName}
                        />
                    </View>

                    {/* Account Number */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>เลขบัญชี</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="ระบุเลขที่บัญชีธนาคาร"
                            value={accountNumber}
                            onChangeText={setAccountNumber}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* PromptPay */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>PromptPay (ถ้ามี)</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="เบอร์โทรศัพท์ หรือ เลขบัตรประชาชน"
                            value={promptPay}
                            onChangeText={setPromptPay}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.saveButton, loading && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>บันทึกการแก้ไข</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FBF9',
    },
    content: {
        padding: 24,
    },
    header: {
        marginBottom: 32,
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
        lineHeight: 20,
    },
    form: {
        marginBottom: 40,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '800',
        color: '#444',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        borderWidth: 1,
        borderColor: 'rgba(26, 95, 42, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    selector: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(26, 95, 42, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    selectorText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    placeholder: {
        color: '#AAA',
    },
    chevron: {
        color: '#1A5F2A',
        fontSize: 12,
        fontWeight: '900',
    },
    bankDropdown: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        maxHeight: 250,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
    },
    bankItem: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    bankItemText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
    },
    saveButton: {
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
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
});
