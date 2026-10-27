/**
 * WidgetSummary — Widget tóm tắt deadline trong 48 giờ tới.
 * Hiển thị trên màn hình chính (Home Dashboard).
 * Yêu cầu "Should Have" cho điểm > 8.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography, radii } from '@/constants/tokens';
import { isDueSoon, getDeadlineLabel, isOverdue } from '@/utils/dates';
import type { Assignment, Course } from '@/types';

interface WidgetSummaryProps {
  assignments: Assignment[];
  courses: Course[];
}

export function WidgetSummary({ assignments, courses }: WidgetSummaryProps) {
  const theme = useTheme();

  // Lọc bài tập sắp đến hạn trong 48h
  const urgentAssignments = assignments.filter(
    (a) => a.status === 'pending' && isDueSoon(a.dueAt)
  );

  // Bài tập quá hạn
  const overdueAssignments = assignments.filter(
    (a) => a.status === 'pending' && isOverdue(a.dueAt)
  );

  const getCourseByID = (id: string) => courses.find((c) => c.id === id);

  if (urgentAssignments.length === 0 && overdueAssignments.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.successLight },
        ]}
        accessibilityRole="summary"
        accessibilityLabel="Không có bài tập nào cần nộp gấp"
      >
        <Text style={styles.icon}>🎉</Text>
        <View style={styles.textContent}>
          <Text style={[styles.title, { color: theme.success }]}>
            Tạm thời rảnh!
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Không có bài tập nào trong 48 giờ tới
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: overdueAssignments.length > 0
            ? theme.errorLight
            : theme.warningLight,
        },
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`${overdueAssignments.length} bài tập quá hạn, ${urgentAssignments.length} bài tập sắp đến hạn trong 48 giờ`}
    >
      <Text style={styles.icon}>
        {overdueAssignments.length > 0 ? '🚨' : '⏰'}
      </Text>
      <View style={styles.textContent}>
        {overdueAssignments.length > 0 ? (
          <Text style={[styles.title, { color: theme.error }]}>
            {overdueAssignments.length} bài tập quá hạn!
          </Text>
        ) : null}
        {urgentAssignments.length > 0 ? (
          <Text
            style={[
              styles.title,
              { color: theme.warning },
            ]}
          >
            {urgentAssignments.length} bài tập cần nộp trong 48h
          </Text>
        ) : null}

        {/* Liệt kê chi tiết */}
        {[...overdueAssignments, ...urgentAssignments].slice(0, 3).map((a) => {
          const course = getCourseByID(a.courseId);
          return (
            <Text
              key={a.id}
              style={[styles.detail, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              • {course?.code ?? ''} — {a.title} ({getDeadlineLabel(a.dueAt)})
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: radii.lg,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 32,
    marginTop: spacing.xs,
  },
  textContent: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.bodyBold,
  },
  subtitle: {
    ...typography.caption,
  },
  detail: {
    ...typography.caption,
  },
});
