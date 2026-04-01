import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { Text } from 'react-native';
import {
  VenueListScreen,
  VenueDetailScreen,
  BookingFormScreen,
  PaymentScreen,
  SportsInsightsScreen,
  PaymentSuccessScreen,
  AllPromotionsScreen,
  InsightDetailScreen,
  AdsScreen,
} from '../screens/customer';
import {
  MyVenuesScreen,
  AddVenueScreen,
  OwnerProfileScreen,
  VenueBookingsScreen,
  RevenueDetailScreen,
  EditVenueScreen,
  AddCourtsScreen,
  UpgradePlanScreen,
  UpgradePaymentScreen,
  UpgradeSuccessScreen,
  ConfirmTrialScreen,
  TrialSuccessScreen,
  OwnerHomeScreen,
  BankAccountsScreen,
  AddBankAccountScreen,
  EditBankAccountScreen,
  AddOfflineBookingScreen,
} from '../screens/owner';
import WithdrawScreen from '../screens/owner/WithdrawScreen';
import WithdrawSuccessScreen from '../screens/owner/WithdrawSuccessScreen';
import { OwnerStackParamList } from './types';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<OwnerStackParamList>();

function OwnerHomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a5f2a' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="OwnerHome"
        component={OwnerHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VenueList"
        component={VenueListScreen}
        options={{ title: 'หน้าหลัก' }}
      />
      <Stack.Screen name="VenueDetail" component={VenueDetailScreen} options={{ title: 'รายละเอียดสนาม' }} />
      <Stack.Screen name="BookingForm" component={BookingFormScreen} options={{ title: 'จองสนาม' }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'ชำระเงิน' }} />
      <Stack.Screen name="SportsInsights" component={SportsInsightsScreen} options={{ title: 'สาระน่ารู้ & เทคนิคกีฬา' }} />
      <Stack.Screen name="InsightDetail" component={InsightDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Ads" component={AdsScreen} options={{ title: 'โฆษณา' }} />
      <Stack.Screen name="AllPromotions" component={AllPromotionsScreen} options={{ title: 'โปรโมชั่นพิเศษ' }} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ headerShown: false }} />
      
      {/* Business Screens access from Dashboard */}
      <Stack.Screen name="RevenueDetail" component={RevenueDetailScreen} options={{ title: 'รายละเอียดรายได้' }} />
      <Stack.Screen name="UpgradePlan" component={UpgradePlanScreen} options={{ title: 'อัปเกรดแพ็กเกจ' }} />
      <Stack.Screen name="UpgradePayment" component={UpgradePaymentScreen} options={{ title: 'ชำระเงินอัปเกรด' }} />
      <Stack.Screen name="UpgradeSuccess" component={UpgradeSuccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ConfirmTrial" component={ConfirmTrialScreen} options={{ title: 'เริ่มทดลองใช้' }} />
      <Stack.Screen name="TrialSuccess" component={TrialSuccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddOfflineBooking" component={AddOfflineBookingScreen} options={{ title: 'เพิ่มการจองออฟไลน์' }} />
    </Stack.Navigator>
  );
}

function ManagementStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a5f2a' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="MyVenues" component={MyVenuesScreen} options={{ title: 'สนามของฉัน' }} />
      <Stack.Screen name="VenueBookings" component={VenueBookingsScreen} options={{ title: 'การจอง' }} />
      <Stack.Screen name="EditVenue" component={EditVenueScreen} options={{ title: 'แก้ไขสนาม' }} />
    </Stack.Navigator>
  );
}

function AddVenueStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a5f2a' },
        headerTintColor: '#fff',
        title: 'เพิ่มสนาม',
      }}
    >
      <Stack.Screen name="AddVenue" component={AddVenueScreen} options={{ title: 'เพิ่มสนามหลัก' }} />
      <Stack.Screen name="AddCourts" component={AddCourtsScreen} options={{ title: 'เพิ่มสนามย่อย' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a5f2a' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="Profile" component={OwnerProfileScreen} options={{ title: 'โปรไฟล์ของฉัน' }} />
      <Stack.Screen name="BankAccounts" component={BankAccountsScreen} options={{ title: 'บัญชีรับเงิน' }} />
      <Stack.Screen name="AddBankAccount" component={AddBankAccountScreen} options={{ title: 'เพิ่มบัญชีรับเงิน' }} />
      <Stack.Screen name="EditBankAccount" component={EditBankAccountScreen} options={{ title: 'แก้ไขบัญชีรับเงิน' }} />
      <Stack.Screen name="Withdraw" component={WithdrawScreen} options={{ title: 'ถอนเงิน' }} />
      <Stack.Screen name="WithdrawSuccess" component={WithdrawSuccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RevenueDetail" component={RevenueDetailScreen} options={{ title: 'รายละเอียดรายได้' }} />
      <Stack.Screen name="UpgradePlan" component={UpgradePlanScreen} options={{ title: 'อัปเกรดแพ็กเกจ' }} />
      <Stack.Screen name="UpgradePayment" component={UpgradePaymentScreen} options={{ title: 'ชำระเงินอัปเกรด' }} />
      <Stack.Screen name="UpgradeSuccess" component={UpgradeSuccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ConfirmTrial" component={ConfirmTrialScreen} options={{ title: 'เริ่มทดลองใช้' }} />
      <Stack.Screen name="TrialSuccess" component={TrialSuccessScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function OwnerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1A5F2A',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
          height: 90,
          paddingBottom: 15,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={OwnerHomeStack}
        options={{
          tabBarLabel: 'หน้าหลัก',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="ManagementTab"
        component={ManagementStack}
        options={{
          tabBarLabel: 'สนามของฉัน',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="AddVenueTab"
        component={AddVenueStack}
        options={{
          tabBarLabel: 'เพิ่มสนาม',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>➕</Text>,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'โปรไฟล์',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text>,
          headerShown: false,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // By default, it will navigate to the tab. 
            // If the user clicks, we also want to pop other screens to top
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'ProfileTab', state: { routes: [{ name: 'Profile' }] } }],
              })
            );
          },
        })}
      />
    </Tab.Navigator>
  );
}
