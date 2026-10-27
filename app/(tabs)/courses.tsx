/**
 * Màn hình Môn học — Courses & Progress Statistics
 * - Hiển thị danh sách môn học với thống kê tiến độ
 * - Tiến độ được TÍNH TOÁN (computed), không lưu trữ
 * - 4 trạng thái: loading, empty, error, content
 */
import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useCourses } from '@/api/courses';
import { useAssignments } from '@/api/assignments';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CourseCard } from '@/components/CourseCard';
import { spacing, typography } from '@/constants/tokens';
import type { CourseProgress } from '@/types';

export default function CoursesScreen() {
  const theme = useTheme();

  const {
    data: courses,
    isLoading: loadingCourses,
    isError: errorCourses,
    refetch: refetchCourses,
  } = useCourses();

  const {
    data: assignments,
    isLoading: loadingAssignments,
    isError: errorAssignments,
    refetch: refetchAssignments,
  } = useAssignments();

  const isLoading = loadingCourses || loadingAssignments;
  const isError = errorCourses || errorAssignments;

  const handleRefresh = () => {
    void refetchCourses();
    void refetchAssignments();
  };

  // Tính toán tiến độ cho mỗi môn (COMPUTED, không lưu)
  const courseProgress: CourseProgress[] = useMemo(() => {
    if (!courses || !assignments) return [];

    return courses.map((course) => {
      const courseAssignments = assignments.filter(
        (a) => a.courseId === course.id
      );
      const completed = courseAssignments.filter(
        (a) => a.status === 'completed'
      ).length;
      const total = courseAssignments.length;

      return {
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        courseColour: course.colour,
        total,
        completed,
        outstanding: total - completed,
      };
    });
  }, [courses, assignments]);

  // Thống kê tổng
  const totalStats = useMemo(() => {
    const total = courseProgress.reduce((sum, cp) => sum + cp.total, 0);
    const completed = courseProgress.reduce((sum, cp) => sum + cp.completed, 0);
    return { total, completed, outstanding: total - completed };
  }, [courseProgress]);

  // ─── Loading ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LoadingState lines={4} message="Đang tải môn học" />
      </View>
    );
  }

  // ─── Error ───────────────────────────────────────────────
  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ErrorState
          message="Không thể tải danh sách môn học"
          onRetry={handleRefresh}
        />
      </View>
    );
  }

  // ─── Empty ───────────────────────────────────────────────
  if (!courses?.length) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <EmptyState
          icon="📚"
          title="Chưa có môn học nào"
          subtitle="Dữ liệu môn học sẽ được tải từ server"
        />
      </View>
    );
  }

  // ─── Content ─────────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        📊 Thống kê tổng quan
      </Text>
      <View
        style={[
          styles.statsCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.borderLight,
          },
        ]}
      >
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>
            {totalStats.total}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Tổng bài tập
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: theme.divider }]}
        />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.success }]}>
            {totalStats.completed}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Hoàn thành
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: theme.divider }]}
        />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.warning }]}>
            {totalStats.outstanding}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Còn lại
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        📚 Tiến độ theo môn
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList<CourseProgress>
        data={courseProgress}
        keyExtractor={(item) => item.courseId}
        renderItem={({ item }) => <CourseCard progress={item} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNumber: {
    ...typography.h1,
  },
  statLabel: {
    ...typography.small,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    marginVertical: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.huge,
  },
});
