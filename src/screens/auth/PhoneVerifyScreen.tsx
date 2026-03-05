import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { requestOTP, RateLimitError } from '../../services/authService';

const COUNTDOWN_SECONDS = 60;

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'PhoneVerify'>;
  route: RouteProp<AuthStackParamList, 'PhoneVerify'>;
};

export default function PhoneVerifyScreen({ navigation, route }: Props) {
  const { role } = route.params;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (countdown <= 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [countdown]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(COUNTDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestOTP = async () => {
    const phone = phoneNumber.replace(/\D/g, '');
    if (phone.length < 10) {
      Alert.alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
      return;
    }

    if (loading || countdown > 0) return;

    try {
      setLoading(true);
      await requestOTP(phone);
      startCountdown();
      navigation.navigate('OTPVerify', { role, phoneNumber: phone });
    } catch (error) {
      if (error instanceof RateLimitError) {
        Alert.alert('กรุณารอสักครู่', error.message);
      } else {
        Alert.alert('เกิดข้อผิดพลาด', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || countdown > 0;
  const buttonLabel = loading
    ? 'กำลังส่ง...'
    : countdown > 0
      ? `ส่งอีกครั้งได้ใน ${countdown} วินาที`
      : 'ยืนยันเบอร์โทรศัพท์';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>ยืนยันตัวตน</Text>
          <Text style={styles.subtitle}>กรุณากรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>เบอร์โทรศัพท์</Text>
            <TextInput
              style={styles.input}
              placeholder="08X-XXX-XXXX"
              placeholderTextColor="rgba(0,0,0,0.3)"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.actionButton, isDisabled && styles.actionButtonDisabled]}
            onPress={handleRequestOTP}
            disabled={isDisabled}
          >
            <Text style={styles.actionButtonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.topGlow} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A5F2A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    fontWeight: '600',
  },
  form: {
    width: '100%',
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
    padding: 20,
    fontSize: 20,
    color: '#333',
    fontWeight: '700',
    letterSpacing: 2,
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButton: {
    backgroundColor: '#C5A021',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#C5A021',
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
  topGlow: {
    position: 'absolute',
    top: -150,
    right: -100,
    width: 300,
    height: 300,
    backgroundColor: '#1A5F2A',
    opacity: 0.03,
    borderRadius: 150,
  },
});
