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
        {(!isLoggedIn || (user && user.role === 'customer')) ? (
          <Stack.Screen name="CustomerMain" component={CustomerTabs} />
        ) : (
          <Stack.Screen name="OwnerMain" component={OwnerTabs} />
        )}
        {/* We keep AuthStack registered so we can navigate to it if needed */}
        {!isLoggedIn && (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
