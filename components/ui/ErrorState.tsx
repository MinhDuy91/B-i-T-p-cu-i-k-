/**
 * ErrorState — Component hiển thị lỗi kèm nút Thử lại.
 * Nút Thử lại phải hoạt động (gọi refetch).
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography, radii, minTouchSize } from '@/constants/tokens';

interface ErrorStateProps {
  /** Tin nhắn lỗi hiển thị */
  message?: string;
  /** Hàm gọi khi nhấn Thử lại */
  onRetry: () => void;
}

export function ErrorState({
  message = 'Đã xảy ra lỗi. Vui lòng thử lại.',
  onRetry,
}: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.message, { color: theme.textPrimary }]}>
        {message}
      </Text>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [
          styles.retryButton,
          { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Thử lại"
        accessibilityHint="Nhấn để tải lại dữ liệu"
      >
        <Text style={[styles.retryText, { color: theme.onPrimary }]}>
          🔄 Thử lại
        </Text>
      </Pressable>
    </View>
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
  icon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    minWidth: minTouchSize * 3,
    minHeight: minTouchSize,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    ...typography.bodyBold,
  },
});
