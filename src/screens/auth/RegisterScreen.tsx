import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuth } from '../../context/AuthContext';
import { registerUser, getAuthToken } from '../../services/authService';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
  route: RouteProp<AuthStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation, route }: Props) {
  const { role, phoneNumber } = route.params;
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !name.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      setLoading(true);
      const response = await registerUser({
        phone: phoneNumber,
        username: username.trim(),
        fullname: name.trim(),
        password: password.trim(),
        role: role,
      });

      Alert.alert('สำเร็จ', 'สมัครสมาชิกเรียบร้อยแล้ว', [
        {
          text: 'ตกลง',
          onPress: async () => {
            // Fetch JWT Token from middleware
            let accessToken = '';
            try {
              const tokenResponse = await getAuthToken({
                id: response?.id || `user-${Date.now()}`,
                phone: phoneNumber,
                username: username.trim()
              });
              accessToken = tokenResponse?.access_token;
            } catch (tokenError) {
              console.error('Token fetch failed:', tokenError);
            }

            // Auto-login and let AppNavigator handle redirection to Home
            await register({
              id: response?.id || `user-${Date.now()}`,
              phone: phoneNumber,
              name: name.trim(),
              role: role,
              accessToken: accessToken,
            });
          }
        }
      ]);
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const SocialButton = ({ title, icon, color }: { title: string, icon: string, color: string }) => (
    <TouchableOpacity style={[styles.socialButton, { borderColor: color }]}>
      <Text style={styles.socialIcon}>{icon}</Text>
      <Text style={[styles.socialText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>ตั้งค่าโปรไฟล์ของคุณ</Text>
          <Text style={styles.subtitle}>กรอกข้อมูลส่วนตัวเพื่อเริ่มต้นประสบการณ์พรีเมียม</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>ชื่อผู้ใช้งาน</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกชื่อผู้ใช้งาน"
              placeholderTextColor="rgba(0,0,0,0.3)"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>ชื่อ-นามสกุล</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกชื่อของคุณ"
              placeholderTextColor="rgba(0,0,0,0.3)"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>รหัสผ่าน</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="rgba(0,0,0,0.3)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="rgba(0,0,0,0.3)"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login', { role })}
          >
            <Text style={styles.loginLinkText}>
              มีบัญชีอยู่แล้ว? <Text style={styles.loginLinkHighlight}>เข้าสู่ระบบ</Text>
            </Text>
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
    backgroundColor: '#F9FBF9', // Pearl Base
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
    color: '#1A5F2A', // Deep Royal Emerald
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
  registerButtonDisabled: {
    opacity: 0.6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 42, 0.1)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#333',
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  registerButton: {
    backgroundColor: '#C5A021', // Rich Gold
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#C5A021',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(26, 95, 42, 0.1)',
  },
  separatorText: {
    color: '#888',
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  socialContainer: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  socialIcon: {
    width: 24,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    marginRight: 12,
  },
  socialText: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginRight: 24,
  },
  loginLink: {
    marginTop: 32,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  loginLinkHighlight: {
    color: '#1A5F2A',
    fontWeight: '800',
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
