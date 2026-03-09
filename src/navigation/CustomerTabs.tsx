import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  VenueListScreen,
  VenueDetailScreen,
  BookingFormScreen,
  PaymentScreen,
  MyBookingsScreen,
  SportsInsightsScreen,
  AdsScreen
} from '../screens/customer';
import { Text as RNText, TouchableOpacity, View } from 'react-native';
import { CustomerStackParamList } from './types';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<CustomerStackParamList>();

function HomeHeaderRight() {
  return null;
}

function VenueStack() {
  const { isLoggedIn } = useAuth();
  const navigation = useNavigation<any>();

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
        options={{
          title: 'หน้าหลัก',
          headerRight: () => <HomeHeaderRight />,
        }}
      />
      <Stack.Screen name="VenueDetail" component={VenueDetailScreen} options={{ title: 'รายละเอียดสนาม' }} />
      <Stack.Screen name="BookingForm" component={BookingFormScreen} options={{ title: 'จองสนาม' }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'ชำระเงิน' }} />
      <Stack.Screen name="SportsInsights" component={SportsInsightsScreen} options={{ title: 'สาระน่ารู้ & เทคนิคกีฬา' }} />
      <Stack.Screen name="Ads" component={AdsScreen} options={{ title: 'โฆษณา' }} />
    </Stack.Navigator>
  );
}

export default function CustomerTabs() {
  const { isLoggedIn } = useAuth();
  const navigation = useNavigation<any>();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1a5f2a',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Browse"
        component={VenueStack}
        options={{
          tabBarLabel: 'สนาม',
          tabBarIcon: () => <RNText style={{ fontSize: 20 }}>🏟️</RNText>,
        }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          tabBarLabel: 'การจองของฉัน',
          tabBarIcon: () => <RNText style={{ fontSize: 20 }}>📋</RNText>,
          headerShown: true,
          headerTitle: 'การจองของฉัน',
          headerStyle: { backgroundColor: '#1a5f2a' },
          headerTintColor: '#fff',
        }}
        listeners={{
          tabPress: (e) => {
            if (!isLoggedIn) {
              e.preventDefault();
              navigation.navigate('Auth', {
                screen: 'Login',
                params: { role: 'cust' }
              });
            }
          },
        }}
      />
    </Tab.Navigator>
  );
}
