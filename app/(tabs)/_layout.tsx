/**
 * Tab Layout — Thanh điều hướng dưới cùng.
 * 3 tab: Trang chủ, Lịch, Môn học.
 * Nút FAB (+) để thêm bài tập mới (mở modal).
 */
import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { minTouchSize, spacing, hitSlop, radii } from '@/constants/tokens';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { useAppStore } from '@/store/appStore';

export default function TabLayout() {
  const theme = useTheme();
  const router = useRouter();
  const { isOnline, lastOnlineAt } = useNetworkStatus();
  const setIsOffline = useAppStore((s) => s.setIsOffline);

  // Cập nhật trạng thái offline vào store
  React.useEffect(() => {
    setIsOffline(!isOnline);
  }, [isOnline, setIsOffline]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Banner offline */}
      {!isOnline ? <OfflineBanner lastSyncAt={lastOnlineAt} /> : null}

      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.textPrimary,
          headerTitleStyle: { fontWeight: '600' },
          tabBarStyle: {
            backgroundColor: theme.tabBarBackground,
            borderTopColor: theme.tabBarBorder,
            height: 60,
            paddingBottom: spacing.sm,
          },
          tabBarActiveTintColor: theme.tabBarActive,
          tabBarInactiveTintColor: theme.tabBarInactive,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Trang chủ',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22, color }}>🏠</Text>
            ),
            tabBarAccessibilityLabel: 'Trang chủ',
            headerRight: () => (
              <Pressable
                onPress={() => router.push('/modal/new-assignment')}
                style={({ pressed }) => [
                  styles.addButton,
                  {
                    backgroundColor: theme.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Thêm bài tập mới"
                hitSlop={hitSlop.minimum}
              >
                <Text style={[styles.addIcon, { color: theme.onPrimary }]}>
                  +
                </Text>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Lịch học',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22, color }}>📅</Text>
            ),
            tabBarAccessibilityLabel: 'Xem lịch học và bài tập',
            headerRight: () => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/modal/new-assignment',
                    params: { type: 'schedule' },
                  })
                }
                style={({ pressed }) => [
                  styles.addButton,
                  {
                    backgroundColor: theme.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Thêm lịch học hoặc bài tập"
                hitSlop={hitSlop.minimum}
              >
                <Text style={[styles.addIcon, { color: theme.onPrimary }]}>
                  +
                </Text>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="courses"
          options={{
            title: 'Môn học',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22, color }}>📊</Text>
            ),
            tabBarAccessibilityLabel: 'Quản lý môn học',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Cá nhân',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22, color }}>👤</Text>
            ),
            tabBarAccessibilityLabel: 'Thông tin cá nhân và cài đặt',
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: minTouchSize - 8,
    height: minTouchSize - 8,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  addIcon: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 26,
  },
});
