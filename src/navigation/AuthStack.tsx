import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';
import PhoneVerifyScreen from '../screens/auth/PhoneVerifyScreen';
import OTPVerifyScreen from '../screens/auth/OTPVerifyScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ForgotPasswordOTPScreen from '../screens/auth/ForgotPasswordOTPScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import UpdatePasswordScreen from '../screens/auth/UpdatePasswordScreen';

export type AuthStackParamList = {
  Welcome: undefined;
  RoleSelect: { phoneNumber: string };
  Login: { role: 'cust' | 'owner' };
  Register: { role: 'cust' | 'owner'; phoneNumber: string };
  PhoneVerify: undefined;
  OTPVerify: { phoneNumber: string };
  ForgotPassword: undefined;
  ForgotPasswordOTP: { phoneNumber: string };
  ResetPassword: { phoneNumber: string };
  UpdatePassword: { userData: any; accessToken: string };
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
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'ลืมรหัสผ่าน' }} />
      <Stack.Screen name="ForgotPasswordOTP" component={ForgotPasswordOTPScreen} options={{ title: 'ยืนยัน OTP' }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'ตั้งรหัสผ่านใหม่' }} />
      <Stack.Screen name="UpdatePassword" component={UpdatePasswordScreen} options={{ title: 'อัปเดตรหัสผ่านใหม่' }} />
    </Stack.Navigator>
  );
}
