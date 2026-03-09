import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
  route: RouteProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation, route }: Props) {
  const { role } = route.params;
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser({
        username: username.trim(),
        password: password.trim(),
      });

      const userData = response?.data;
      const userRole = (userData?.role || role) as any;

      Alert.alert('สำเร็จ', 'เข้าสู่ระบบเรียบร้อยแล้ว', [
        {
          text: 'ตกลง',
          onPress: () => {
            login({
              id: userData?.id || '1',
              phone: userData?.phone || username.trim(),
              name: userData?.fullname || userData?.username || username.trim(),
              role: userRole,
            });
          }
        }
      ]);
    } catch (error) {
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.header}>
            <Text style={styles.crown}>👑</Text>
            <Text style={styles.title}>ROYAL LOGIN</Text>
            <View style={styles.goldLine} />
            <Text style={styles.subtitle}>ยินดีต้อนรับสู่ประสบการณ์ระดับพรีเมียม</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>ชื่อผู้ใช้งาน</Text>
              <TextInput
                style={styles.input}
                placeholder="กรอกชื่อผู้ใช้งานของคุณ"
                placeholderTextColor="rgba(26, 95, 42, 0.3)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>รหัสผ่าน</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="rgba(26, 95, 42, 0.3)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('PhoneVerify')}
            >
              <Text style={styles.registerLinkText}>
                ยังไม่มีบัญชี? <Text style={styles.registerLinkHighlight}>สมัครสมาชิก</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
      <View style={styles.bottomGlow} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9', // Pearl Base
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  crown: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    color: '#1A5F2A', // Deep Royal Emerald
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 8,
  },
  goldLine: {
    width: 40,
    height: 2,
    backgroundColor: '#C5A021', // Rich Gold
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 22,
    color: '#1A5F2A',
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
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
    padding: 16,
    fontSize: 16,
    color: '#333',
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButton: {
    backgroundColor: '#1A5F2A', // Deep Royal Emerald
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  registerLink: {
    marginTop: 32,
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  registerLinkHighlight: {
    color: '#1A5F2A',
    fontWeight: '800',
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
