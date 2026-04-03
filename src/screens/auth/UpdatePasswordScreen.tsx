import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { resetPassword, updatePassword, updatePin } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'UpdatePassword'>;
  route: RouteProp<AuthStackParamList, 'UpdatePassword'>;
};

export default function UpdatePasswordScreen({ navigation, route }: Props) {
  const { userData, accessToken } = route.params;
  const { login } = useAuth();
  const [step, setStep] = useState<'password' | 'pin'>('password');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('รหัสผ่านไม่ตรงกัน', 'กรุณาตรวจสอบรหัสผ่านใหม่อีกครั้ง');
      return;
    }

    if (password.length < 6) {
      Alert.alert('รหัสผ่านสั้นเกินไป', 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      setLoading(true);
      await updatePassword({
        phone: userData.phone,
        password: password.trim(),
      });
      setStep('pin');
      Alert.alert('สำเร็จ', 'อัปเดตรหัสผ่านใหม่เรียบร้อยแล้ว กรุณาตั้งค่า PIN 6 หลัก');
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', error instanceof Error ? error.message : 'ไม่สามารถอัปเดตรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePin = async () => {
    if (pin.length !== 6) {
      Alert.alert('PIN ไม่ครบถ้วน', 'กรุณาระบุ PIN 6 หลัก');
      return;
    }

    try {
      setLoading(true);
      await updatePin({
        phone: userData.phone,
        pin: pin,
      });

      // Final Login after both updates
      login({
        id: userData.id,
        phone: userData.phone,
        name: userData.fullname || userData.username,
        role: userData.role,
        accessToken: accessToken,
        subscription: userData.subscription,
      });

      Alert.alert('สำเร็จ', 'ตั้งค่า PIN และเข้าสู่ระบบเรียบร้อยแล้ว');
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', error instanceof Error ? error.message : 'ไม่สามารถตั้งค่า PIN ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const renderPasswordForm = () => (
    <View style={styles.form}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>รหัสผ่านใหม่</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="rgba(26, 95, 42, 0.3)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>ยืนยันรหัสผ่านใหม่</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="rgba(26, 95, 42, 0.3)"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.actionButton, loading && styles.actionButtonDisabled]}
        onPress={handleUpdatePassword}
        disabled={loading}
      >
        <Text style={styles.actionButtonText}>
          {loading ? 'กำลังบันทึก...' : 'อัปเดตรหัสผ่าน'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPinIndicators = () => {
    const dots = [];
    for (let i = 0; i < 6; i++) {
      dots.push(
        <View 
          key={i} 
          style={[
            styles.pinDot,
            pin.length > i && styles.pinDotFilled
          ]}
        />
      );
    }
    return <View style={styles.pinDotsArea}>{dots}</View>;
  };

  const renderKeypad = () => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];
    return (
      <View style={styles.keypad}>
        {keys.map((key, index) => {
          if (key === '') return <View key={`empty-${index}`} style={styles.keyButtonEmpty} />;
          
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.keyButton,
                key === 'delete' && styles.keyButtonDelete
              ]}
              onPress={() => (key === 'delete' ? handleDelete() : handleKeyPress(key))}
            >
              {key === 'delete' ? (
                <Text style={styles.keyTextDelete}>⌫</Text>
              ) : (
                <Text style={styles.keyText}>{key}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderPinForm = () => (
    <View style={styles.pinStepContent}>
      {renderPinIndicators()}
      
      <View style={styles.keypadContainer}>
        {renderKeypad()}
      </View>

      <TouchableOpacity
        style={[
          styles.actionButton, 
          (loading || pin.length !== 6) && styles.actionButtonDisabled,
          { marginTop: 40 }
        ]}
        onPress={handleUpdatePin}
        disabled={loading || pin.length !== 6}
      >
        <Text style={styles.actionButtonText}>
          {loading ? 'กำลังบันทึก...' : 'บันทึก PIN และเข้าสู่ระบบ'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.title}>
            {step === 'password' ? 'อัปเดตรหัสผ่านใหม่' : 'ตั้งค่า PIN 6 หลัก'}
          </Text>
          <View style={styles.goldLine} />
          <Text style={styles.subtitle}>
            {step === 'password' 
              ? 'กรุณากำหนดรหัสผ่านใหม่เพื่อความปลอดภัยของบัญชี'
              : 'กรุณากำหนด PIN เพื่อใช้สำหรับการทำธุรกรรมและความปลอดภัย'}
          </Text>
          
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>บทบาทผู้ใช้ของคุณ:</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userData.role?.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {step === 'password' ? renderPasswordForm() : renderPinForm()}
      </ScrollView>
      <View style={styles.bottomGlow} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  crown: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A5F2A',
    marginBottom: 8,
    textAlign: 'center',
  },
  goldLine: {
    width: 40,
    height: 3,
    backgroundColor: '#C5A021',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 95, 42, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 42, 0.1)',
  },
  roleLabel: {
    fontSize: 14,
    color: '#1A5F2A',
    fontWeight: '700',
    marginRight: 10,
  },
  roleBadge: {
    backgroundColor: '#1A5F2A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  form: {
    width: '100%',
  },
  pinStepContent: {
    width: '100%',
    alignItems: 'center',
  },
  pinDotsArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 50,
    width: '100%',
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(26, 95, 42, 0.2)',
    marginHorizontal: 12,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#1A5F2A',
    borderColor: '#1A5F2A',
    transform: [{ scale: 1.1 }],
  },
  keypadContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  keyButton: {
    width: (width - 48 - 40 - 60) / 3, // ScreenWidth - Screen Padding - Keypad Container Padding - Internal Gap
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 42, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  keyButtonEmpty: {
    width: (width - 48 - 40 - 60) / 3,
    height: 70,
  },
  keyButtonDelete: {
    backgroundColor: 'rgba(26, 95, 42, 0.02)',
    borderColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  keyText: {
    fontSize: 28,
    color: '#1A5F2A',
    fontWeight: '700',
  },
  keyTextDelete: {
    fontSize: 26,
    color: '#1A5F2A',
    fontWeight: '300',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#1A5F2A',
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 42, 0.1)',
    borderRadius: 16,
    padding: 18,
    fontSize: 18,
    color: '#333',
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButton: {
    backgroundColor: '#1A5F2A',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -150,
    width: width,
    height: 300,
    backgroundColor: '#1A5F2A',
    opacity: 0.05,
    borderRadius: width / 2,
    transform: [{ scaleX: 2 }],
    zIndex: -1,
  },
});
