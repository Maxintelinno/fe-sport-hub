import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import {
  VenueListScreen,
  VenueDetailScreen,
  BookingFormScreen,
  PaymentScreen,
  SportsInsightsScreen,
  PaymentSuccessScreen
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
} from '../screens/owner';
import { OwnerStackParamList } from './types';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<OwnerStackParamList>();

function PublicVenueStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a5f2a' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="VenueList"
        component={VenueListScreen}
        options={{ title: 'หน้าหลัก' }}
      />
      <Stack.Screen name="VenueDetail" component={VenueDetailScreen} options={{ title: 'รายละเอียดสนาม' }} />
      <Stack.Screen name="BookingForm" component={BookingFormScreen} options={{ title: 'จองสนาม' }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'ชำระเงิน' }} />
      <Stack.Screen name="SportsInsights" component={SportsInsightsScreen} options={{ title: 'สาระน่ารู้ & เทคนิคกีฬา' }} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ headerShown: false }} />
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
      <Stack.Screen name="RevenueDetail" component={RevenueDetailScreen} options={{ title: 'รายละเอียดรายได้' }} />
      <Stack.Screen name="UpgradePlan" component={UpgradePlanScreen} options={{ title: 'อัปเกรดแพ็กเกจ' }} />
      <Stack.Screen name="UpgradePayment" component={UpgradePaymentScreen} options={{ title: 'ชำระเงินอัปเกรด' }} />
      <Stack.Screen name="UpgradeSuccess" component={UpgradeSuccessScreen} options={{ headerShown: false }} />
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
        name="PublicHome"
        component={PublicVenueStack}
        options={{
          tabBarLabel: 'สนาม',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏟️</Text>,
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
      />
    </Tab.Navigator>
  );
}
