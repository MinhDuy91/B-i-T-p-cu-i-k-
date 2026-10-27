/**
 * EmptyState — Component hiển thị khi không có dữ liệu.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography, radii } from '@/constants/tokens';

interface EmptyStateProps {
  /** Biểu tượng emoji */
  icon?: string;
  /** Tiêu đề */
  title: string;
  /** Mô tả phụ */
  subtitle?: string;
}

export function EmptyState({
  icon = '📭',
  title,
  subtitle,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${subtitle ?? ''}`}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
