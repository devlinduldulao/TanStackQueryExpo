import '../global.css';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Drawer } from 'expo-router/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReactQueryDevTools from '@/components/providers/ReactQueryDevTools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSyncQueriesExternal } from 'react-query-external-sync';
import { Platform } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Custom retry logic that handles streaming queries
      retry: (failureCount, error) => {
        // Don't retry streaming queries or network errors
        if (error?.message?.includes('stream') || error?.name === 'AbortError') {
          return false;
        }
        // Only retry up to 2 times for other queries
        return failureCount < 2;
      },
      // 0s -> 1s, 1s → 5s. Little resiliency 😁
      retryDelay: (attemptIndex) => Math.min(1000 * 5 ** attemptIndex, 10000),
    },
  },
});

const codemotionColors = {
  navy: '#0e1e30',
  orange: '#ff5c00',
  blue: '#0555fa',
  darkBlue: '#044389',
  deepNavy: '#162f4b',
  yellow: '#f9dc5c',
  white: '#ffffff',
  gray50: '#e0e0e0',
  gray100: '#9e9e9e',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function QuerySyncExternal() {
  useSyncQueriesExternal({
    queryClient,
    socketURL: 'http://localhost:42831',
    deviceName: Platform?.OS || 'web',
    platform: Platform?.OS || 'web',
    deviceId: Platform?.OS || 'web',
    extraDeviceInfo: {
      appVersion: '1.0.0',
    },
    enableLogs: false,
  });

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {Platform.OS === 'web' ? <QuerySyncExternal /> : null}
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Drawer
            screenOptions={{
              headerTintColor: codemotionColors.white,
              headerStyle: {
                backgroundColor: codemotionColors.navy,
                borderBottomWidth: 1,
                borderBottomColor: codemotionColors.darkBlue,
              },
              drawerActiveTintColor: codemotionColors.orange,
              drawerInactiveTintColor: codemotionColors.gray50,
              drawerActiveBackgroundColor: codemotionColors.darkBlue,
              drawerStyle: {
                backgroundColor: codemotionColors.deepNavy,
                borderRightColor: codemotionColors.blue,
                borderRightWidth: 2,
              },
              // Dark overlay to match the theme
              overlayColor: 'rgba(14, 30, 48, 0.5)',
            }}
            // Set default state to closed to avoid overlay issues
            initialRouteName="index"
            defaultStatus="closed">
            <Drawer.Screen
              name="index"
              options={{
                drawerLabel: 'Home',
                headerShown: false,
                drawerIcon: ({ size, color }) => <Ionicons name="home" size={size} color={color} />,
              }}
            />
            <Drawer.Screen
              name="prefetching"
              options={{
                drawerLabel: 'Prefetching',
                title: 'Prefetching',
                drawerIcon: ({ color, size }) => (
                  <Ionicons name="trail-sign-outline" size={size} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="deduping"
              options={{
                drawerLabel: 'Deduping',
                title: 'Deduping',
                drawerIcon: ({ color, size }) => (
                  <Ionicons name="cut-outline" size={size} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="polling"
              options={{
                drawerLabel: 'Polling',
                title: 'Polling',
                drawerIcon: ({ color, size }) => (
                  <Ionicons name="arrow-down-outline" size={size} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="pagination"
              options={{
                drawerLabel: 'Pagination',
                title: 'Pagination',
                drawerIcon: ({ color, size }) => (
                  <Ionicons name="book-outline" size={size} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="infinite-scrolling"
              options={{
                drawerLabel: 'Infinite Scrolling',
                title: 'Infinite Scrolling',
                drawerIcon: ({ color, size }) => (
                  <Ionicons name="infinite-outline" size={size} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="optimistic-update-cache"
              options={{
                drawerLabel: 'Optimistic Update',
                title: 'Optimistic Update',
                drawerIcon: ({ color, size }) => (
                  <Ionicons name="flash-outline" size={size} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="streamed-query"
              options={{
                drawerLabel: 'Streamed Query',
                title: 'Streamed Query',
                drawerIcon: ({ color, size }) => (
                  <Ionicons name="radio-outline" size={size} color={color} />
                ),
              }}
            />
          </Drawer>
        </GestureHandlerRootView>
        <StatusBar style="light" />
      </ThemeProvider>
      <ReactQueryDevTools />
    </QueryClientProvider>
  );
}
