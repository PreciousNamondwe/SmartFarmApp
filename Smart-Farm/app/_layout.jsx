import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Layout() {
  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          // Ensure clean navigation to tabs/index
          router.replace('/tabs');
        }
      } catch (error) {
        console.error('Error checking user data:', error);
      }
    };
    checkUser();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="tabs" /> {/* Explicitly define the tabs/index route */}
    </Stack>
  );
}