/**
 * Màn hình 404 — Không tìm thấy trang
 * Bắt buộc theo yêu cầu đề bài: app/+not-found.tsx
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography, radii, minTouchSize } from '@/constants/tokens';

export default function NotFoundScreen() {
  const theme = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Không tìm thấy!' }} />
      <View
        style={[styles.container, { backgroundColor: theme.background }]}
        accessibilityRole="alert"
        accessibilityLabel="Trang không tìm thấy"
      >
        <Text style={styles.emoji}>🔍</Text>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Trang không tồn tại
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Đường dẫn bạn truy cập không có trong ứng dụng.
        </Text>
        <Link href="/" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.homeButton,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Quay về trang chủ"
          >
            <Text style={[styles.homeButtonText, { color: theme.onPrimary }]}>
              🏠 Về trang chủ
            </Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
    gap: spacing.md,
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  homeButton: {
    minHeight: minTouchSize,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    ...typography.bodyBold,
  },
});
