/**
 * AssignmentCard — Thẻ hiển thị bài tập trong danh sách.
 * Nhấn vào mở trang chi tiết bài tập (dynamic route).
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography, radii, minTouchSize, hitSlop } from '@/constants/tokens';
import { getDeadlineLabel, isOverdue, isDueSoon } from '@/utils/dates';
import type { Assignment, Course } from '@/types';

interface AssignmentCardProps {
  assignment: Assignment;
  course?: Course;
}

export function AssignmentCard({ assignment, course }: AssignmentCardProps) {
  const theme = useTheme();
  const router = useRouter();

  const deadlineLabel = getDeadlineLabel(assignment.dueAt);
  const overdue = assignment.status === 'pending' && isOverdue(assignment.dueAt);
  const dueSoon = assignment.status === 'pending' && isDueSoon(assignment.dueAt);
  const isCompleted = assignment.status === 'completed';

  const deadlineColor = overdue
    ? theme.error
    : dueSoon
    ? theme.warning
    : theme.textSecondary;

  return (
    <Pressable
      onPress={() => router.push(`/assignment/${assignment.id}`)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.borderLight,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Bài tập: ${assignment.title}. Môn: ${course?.name ?? 'Không rõ'}. Hạn nộp: ${deadlineLabel}. Trạng thái: ${isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}`}
      accessibilityHint="Nhấn để xem chi tiết"
      hitSlop={hitSlop.minimum}
    >
      {/* Dải màu môn học bên trái */}
      <View
        style={[
          styles.colorStripe,
          { backgroundColor: course?.colour ?? theme.primary },
        ]}
      />

      <View style={styles.content}>
        {/* Dòng trên: Tên bài tập */}
        <Text
          style={[
            styles.title,
            {
              color: theme.textPrimary,
              textDecorationLine: isCompleted ? 'line-through' : 'none',
            },
          ]}
          numberOfLines={2}
        >
          {assignment.title}
        </Text>

        {/* Dòng dưới: Môn học + Loại + Deadline */}
        <View style={styles.metaRow}>
          <View style={styles.tagGroup}>
            {assignment.type === 'schedule' ? (
              <View
                style={[
                  styles.scheduleBadge,
                  { backgroundColor: theme.primaryLight },
                ]}
              >
                <Text style={[styles.scheduleBadgeText, { color: theme.primary }]}>
                  📅 Lịch học
                </Text>
              </View>
            ) : null}
            {course ? (
              <Text style={[styles.courseLabel, { color: theme.textTertiary }]}>
                {course.code}
              </Text>
            ) : null}
          </View>
          <Text style={[styles.deadline, { color: deadlineColor }]}>
            {isCompleted ? '✅ Đã hoàn thành' : `⏰ ${deadlineLabel}`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    minHeight: minTouchSize,
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
    width: 5,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    ...typography.bodyBold,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseLabel: {
    ...typography.caption,
  },
  deadline: {
    ...typography.captionBold,
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  scheduleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  scheduleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
