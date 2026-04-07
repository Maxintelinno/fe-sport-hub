import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import CustomerTabs from './CustomerTabs';
import OwnerTabs from './OwnerTabs';
import SplashScreen from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoggedIn, user } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  // If not logged in, we default to CustomerTabs (Home Screen) as requested
  // If logged in as customer, we also show CustomerTabs
  // If logged in as owner, we show OwnerTabs
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // Logged in state
          // Direct owner, staff, manager, and accountant to OwnerTabs
          (user?.role === 'owner' || user?.role === 'staff' || user?.role === 'manager' || user?.role === 'accountant') ? (
            <Stack.Screen name="OwnerMain" component={OwnerTabs} />
          ) : (
            <Stack.Screen name="CustomerMain" component={CustomerTabs} />
          )
        ) : (
          // Guest state
          <>
            <Stack.Screen name="CustomerMain" component={CustomerTabs} />
            <Stack.Screen name="Auth" component={AuthStack} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
