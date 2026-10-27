/**
 * Root Layout — Điểm vào chính của ứng dụng.
 * - Kiểm tra session khi khởi động (SecureStore / localStorage)
 * - Tự động ẩn Splash Screen ngay khi nạp xong
 * - Bọc toàn app trong QueryClientProvider (TanStack Query)
 */
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { queryClient } from '@/api/queryClient';

// Giữ splash screen cho tới khi app sẵn sàng
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutContent() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const restoreSession = useAuthStore((s) => s.restoreSession);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    void restoreSession().finally(() => {
      SplashScreen.hideAsync().catch(() => {});
    });
    // Đảm bảo splash screen luôn được tắt sau tối đa 200ms
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 200);
    return () => clearTimeout(timer);
  }, [restoreSession]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'sign-in';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/sign-in');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.textPrimary,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen
          name="sign-in"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="assignment/[id]"
          options={{
            title: 'Chi tiết bài tập',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="modal/new-assignment"
          options={{
            title: 'Thêm / Sửa bài tập',
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="+not-found"
          options={{ title: 'Không tìm thấy' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutContent />
    </QueryClientProvider>
  );
}
