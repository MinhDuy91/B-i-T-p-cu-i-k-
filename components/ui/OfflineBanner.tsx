/**
 * OfflineBanner — Banner cảnh báo mất kết nối.
 * Hiển thị thời gian đồng bộ thành công cuối cùng.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/constants/tokens';

interface OfflineBannerProps {
  /** Thời điểm tải thành công lần cuối */
  lastSyncAt?: Date | null;
}

export function OfflineBanner({ lastSyncAt }: OfflineBannerProps) {
  const theme = useTheme();

  const timeLabel = lastSyncAt
    ? `Lần cuối đồng bộ: ${lastSyncAt.toLocaleTimeString('vi-VN')}`
    : 'Chưa từng đồng bộ';

  return (
    <View
      style={[styles.banner, { backgroundColor: theme.offlineBanner }]}
      accessibilityRole="alert"
      accessibilityLabel={`Mất kết nối mạng. ${timeLabel}`}
    >
      <Text style={[styles.text, { color: theme.offlineBannerText }]}>
        📡 Đang ngoại tuyến — {timeLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  text: {
    ...typography.caption,
  },
});
