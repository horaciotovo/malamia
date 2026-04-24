import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { Colors } from './src/theme/colors';
import { syncPushToken, addNotificationReceivedListener } from './src/services/notificationService';

export default function App() {
  const { loadStoredSession, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadStoredSession();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    syncPushToken();
    const sub = addNotificationReceivedListener(() => {
      // Optionally update notification badge count here
    });
    return () => sub.remove();
  }, [isAuthenticated]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: Colors.primary,
              background: Colors.background,
              card: Colors.surface,
              text: Colors.textPrimary,
              border: Colors.border,
              notification: Colors.primary,
            },
          }}
        >
          <StatusBar style="light" backgroundColor={Colors.background} />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
