/**
 * CourseCard — Thẻ hiển thị môn học + thống kê tiến độ.
 * Tiến độ được TÍNH TOÁN (computed), không lưu trữ.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography, radii, minTouchSize, hitSlop } from '@/constants/tokens';
import type { CourseProgress } from '@/types';

interface CourseCardProps {
  progress: CourseProgress;
  onPress?: () => void;
}

export function CourseCard({ progress, onPress }: CourseCardProps) {
  const theme = useTheme();
  const percentage =
    progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.borderLight,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Môn ${progress.courseName}. ${progress.completed} trên ${progress.total} bài tập đã hoàn thành. Tiến độ ${percentage} phần trăm`}
      hitSlop={hitSlop.minimum}
    >
      {/* Dải màu */}
      <View
        style={[styles.colorStripe, { backgroundColor: progress.courseColour }]}
      />

      <View style={styles.content}>
        {/* Tiêu đề */}
        <View style={styles.header}>
          <Text style={[styles.code, { color: theme.textTertiary }]}>
            {progress.courseCode}
          </Text>
          <Text style={[styles.percentage, { color: theme.primary }]}>
            {percentage}%
          </Text>
        </View>

        <Text
          style={[styles.name, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {progress.courseName}
        </Text>

        {/* Thanh tiến độ */}
        <View
          style={[styles.progressTrack, { backgroundColor: theme.backgroundTertiary }]}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: progress.total,
            now: progress.completed,
          }}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: progress.courseColour,
                width: `${percentage}%`,
              },
            ]}
          />
        </View>

        {/* Thống kê */}
        <View style={styles.stats}>
          <Text style={[styles.statText, { color: theme.success }]}>
            ✅ {progress.completed} hoàn thành
          </Text>
          <Text style={[styles.statText, { color: theme.warning }]}>
            📋 {progress.outstanding} còn lại
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    minHeight: minTouchSize * 2,
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  colorStripe: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  code: {
    ...typography.caption,
  },
  percentage: {
    ...typography.captionBold,
  },
  name: {
    ...typography.bodyBold,
  },
  progressTrack: {
    height: 8,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    ...typography.small,
  },
});
