import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';
import PhoneVerifyScreen from '../screens/auth/PhoneVerifyScreen';
import OTPVerifyScreen from '../screens/auth/OTPVerifyScreen';

export type AuthStackParamList = {
  Welcome: undefined;
  RoleSelect: undefined;
  Login: { role: 'customer' | 'owner' };
  Register: { role: 'customer' | 'owner'; phoneNumber: string };
  PhoneVerify: { role: 'customer' | 'owner' };
  OTPVerify: { role: 'customer' | 'owner'; phoneNumber: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#F9FBF9' },
        headerTintColor: '#1A5F2A',
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} options={{ title: 'เลือกบทบาท' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'เข้าสู่ระบบ' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'สมัครสมาชิก' }} />
      <Stack.Screen name="PhoneVerify" component={PhoneVerifyScreen} options={{ title: 'ยืนยันเบอร์โทรศัพท์' }} />
      <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} options={{ title: 'ยืนยัน OTP' }} />
    </Stack.Navigator>
  );
}
