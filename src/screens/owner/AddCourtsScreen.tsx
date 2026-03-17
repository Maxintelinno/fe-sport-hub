import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { OwnerStackParamList } from '../../navigation/types';
import { createCourtsBulk } from '../../services/bookingService';

import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<OwnerStackParamList, 'AddCourts'>;
  route: RouteProp<OwnerStackParamList, 'AddCourts'>;
};

interface CourtForm {
  id: string; // local id for list rendering
  name: string;
  capacity: string;
  price_per_hour: string;
  court_type: string;
}

export default function AddCourtsScreen({ navigation, route }: Props) {
  const { fieldId, fieldName } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Initialize with one empty court form
  const [courts, setCourts] = useState<CourtForm[]>([
    { id: Date.now().toString(), name: '', capacity: '', price_per_hour: '', court_type: '' },
  ]);

  const handleAddCourtForm = () => {
    setCourts(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', capacity: '', price_per_hour: '', court_type: '' },
    ]);
  };

  const handleRemoveCourtForm = (id: string) => {
    if (courts.length === 1) {
      Alert.alert('แจ้งเตือน', 'คุณต้องมีสนามย่อยอย่างน้อย 1 สนาม');
      return;
    }
    setCourts(prev => prev.filter(court => court.id !== id));
  };

  const handleCourtChange = (id: string, field: keyof CourtForm, value: string) => {
    setCourts(prev =>
      prev.map(court => (court.id === id ? { ...court, [field]: value } : court))
    );
  };

  const handleSubmit = async () => {
    // Validate empty fields
    const hasEmptyFields = courts.some(
      c => !c.name.trim() || !c.capacity.trim() || !c.price_per_hour.trim() || !c.court_type.trim()
    );

    if (hasEmptyFields) {
      Alert.alert('กรุณากรอกข้อมูลให้ครบถ้วน', 'ต้องระบุชื่อ ความจุ และราคาทุกสนาม');
      return;
    }

    setLoading(true);
    try {
      if (!user) {
        Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      const payload = {
        field_id: fieldId,
        courts: courts.map(court => ({
          name: court.name.trim(),
          price_per_hour: Number(court.price_per_hour),
          capacity: Number(court.capacity),
          court_type: court.court_type.trim(),
        }))
      };

      await createCourtsBulk(payload);

      Alert.alert('สำเร็จ', 'เพิ่มสนามย่อยเรียบร้อยแล้ว', [
        { text: 'ตกลง', onPress: () => (navigation as any).navigate('ManagementTab', { screen: 'MyVenues' }) },
      ]);
    } catch (error: any) {
      console.error('Error creating courts:', error);
      Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถเพิ่มสนามได้ในขณะนี้');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }: any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerDecoration} />

        <View style={styles.headerSection}>
          <Text style={styles.title}>🏟️ จัดการสนามย่อย</Text>
          <Text style={styles.subtitle}>เพิ่มพื้นที่ให้บริการสำหรับ <Text style={styles.highlightText}>{fieldName}</Text></Text>
        </View>

        {courts.map((court, index) => (
          <View key={court.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>💎 สนามย่อยที่ {index + 1}</Text>
              {courts.length > 1 && (
                <TouchableOpacity onPress={() => handleRemoveCourtForm(court.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>🗑️ ลบสนามนี้</Text>
                </TouchableOpacity>
              )}
            </View>

            <InputField
              label="ชื่อสนามย่อย *"
              value={court.name}
              onChangeText={(val: string) => handleCourtChange(court.id, 'name', val)}
              placeholder="เช่น สนาม A, พรีเมียม B"
            />

            <InputField
              label="ประเภทกีฬา *"
              value={court.court_type}
              onChangeText={(val: string) => handleCourtChange(court.id, 'court_type', val)}
              placeholder="เช่น ฟุตบอล, แบดมินตัน"
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <InputField
                  label="ความจุ (คน) *"
                  value={court.capacity}
                  onChangeText={(val: string) => handleCourtChange(court.id, 'capacity', val)}
                  placeholder="เช่น 10"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <InputField
                  label="ราคา/ชั่วโมง *"
                  value={court.price_per_hour}
                  onChangeText={(val: string) => handleCourtChange(court.id, 'price_per_hour', val)}
                  placeholder="เช่น 500"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addMoreBtn} onPress={handleAddCourtForm}>
          <Text style={styles.addMoreText}>+ เพิ่มสนามย่อยอีก</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>✨ บันทึกข้อมูลคอร์ททั้งหมด</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F4',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerDecoration: {
    position: 'absolute',
    top: -width * 0.2,
    right: -width * 0.1,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(202, 160, 33, 0.08)', // Gold tint
  },
  headerSection: {
    marginBottom: 24,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1A5F2A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
    lineHeight: 22,
  },
  highlightText: {
    color: '#C5A021',
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(202, 160, 33, 0.2)', // Subtle gold border
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#C5A021',
  },
  deleteBtn: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteBtnText: {
    color: '#E02020',
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F9FBF9',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#E8EBE8',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  addMoreBtn: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#1A5F2A',
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 10,
  },
  addMoreText: {
    color: '#1A5F2A',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  submitBtn: {
    backgroundColor: '#1A5F2A',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnDisabled: {
    backgroundColor: '#A8BFA8',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
