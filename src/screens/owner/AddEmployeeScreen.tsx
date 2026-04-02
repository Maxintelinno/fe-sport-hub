import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AddEmployeeScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Staff');

  const handleSave = () => {
    if (!name || !username || !phone) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง');
      return;
    }
    Alert.alert('สำเร็จ', 'เพิ่มพนักงานเรียบร้อยแล้ว', [
      { text: 'ตกลง', onPress: () => navigation.goBack() }
    ]);
  };

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    if (limited.length > 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
    } else if (limited.length > 3) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    }
    return limited;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>👤+ เพิ่มพนักงาน</Text>
          <Text style={styles.subtitle}>กรอกข้อมูลพื้นฐานของพนักงานใหม่</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ชื่อ-นามสกุล *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="ระบุชื่อพนักงาน" 
              value={name} 
              onChangeText={setName} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="ระบุ username" 
              value={username} 
              onChangeText={setUsername} 
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>เบอร์โทรศัพท์ *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="08x-xxx-xxxx" 
              keyboardType="phone-pad"
              value={phone} 
              onChangeText={(text) => setPhone(formatPhone(text))} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>บทบาท/ตำแหน่ง</Text>
            <View style={styles.roleGrid}>
                {['Staff', 'Manager', 'Accountant'].map((r) => (
                    <TouchableOpacity 
                        key={r}
                        style={[styles.roleChip, role === r && styles.roleChipActive]}
                        onPress={() => setRole(r)}
                    >
                        <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{r}</Text>
                    </TouchableOpacity>
                ))}
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
            <Text style={styles.submitBtnText}>บันทึกข้อมูลพนักงาน</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBF9' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: '900', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 32, fontWeight: '600' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '800', color: '#444', marginBottom: 8 },
  input: { 
    height: 55, 
    backgroundColor: '#fff', 
    borderRadius: 14, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#eee',
    color: '#1a1a1a',
    fontWeight: '600',
  },
  roleGrid: { flexDirection: 'row', gap: 10 },
  roleChip: { 
    flex: 1, 
    paddingVertical: 12, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#eee' 
  },
  roleChipActive: { backgroundColor: '#1A5F2A', borderColor: '#1A5F2A' },
  roleChipText: { fontSize: 14, fontWeight: '800', color: '#666' },
  roleChipTextActive: { color: '#fff' },
  submitBtn: { 
    backgroundColor: '#1A5F2A', 
    paddingVertical: 18, 
    borderRadius: 18, 
    alignItems: 'center', 
    marginTop: 20,
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
