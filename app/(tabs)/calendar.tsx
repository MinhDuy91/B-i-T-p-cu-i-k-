/**
 * Màn hình Lịch — Calendar
 * - Chế độ xem tuần (Weekly) & danh sách (List)
 * - Lọc theo môn học và trạng thái
 * - 4 trạng thái: loading, empty, error, content
 */
import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/appStore';
import { useAssignments } from '@/api/assignments';
import { useCourses } from '@/api/courses';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { AssignmentCard } from '@/components/AssignmentCard';
import { isSameDay } from '@/utils/dates';
import { spacing, typography, radii, minTouchSize, hitSlop } from '@/constants/tokens';
import type { Assignment, FilterStatus } from '@/types';

const STATUS_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chưa xong' },
  { value: 'completed', label: 'Hoàn thành' },
];

export default function CalendarScreen() {
  const theme = useTheme();

  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);

  const {
    data: assignments,
    isLoading: loadingAssignments,
    isError: errorAssignments,
    refetch: refetchAssignments,
  } = useAssignments();

  const {
    data: courses,
    isLoading: loadingCourses,
    isError: errorCourses,
    refetch: refetchCourses,
  } = useCourses();

  const isLoading = loadingAssignments || loadingCourses;
  const isError = errorAssignments || errorCourses;

  const handleRefresh = useCallback(() => {
    void refetchAssignments();
    void refetchCourses();
  }, [refetchAssignments, refetchCourses]);

  // Danh sách ngày có bài tập (cho dấu chấm trên lịch)
  const assignmentDates = useMemo(
    () => (assignments ?? []).map((a) => a.dueAt),
    [assignments]
  );

  // Lọc bài tập
  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];
    let result = [...assignments];

    // Lọc theo ngày (chỉ trong chế độ weekly)
    if (viewMode === 'weekly') {
      result = result.filter((a) => isSameDay(a.dueAt, selectedDate));
    }

    // Lọc theo môn
    if (filters.courseId) {
      result = result.filter((a) => a.courseId === filters.courseId);
    }

    // Lọc theo trạng thái
    if (filters.status !== 'all') {
      result = result.filter((a) => a.status === filters.status);
    }

    // Sắp xếp theo deadline
    result.sort(
      (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
    );

    return result;
  }, [assignments, viewMode, selectedDate, filters]);

  const getCourse = (courseId: string) =>
    courses?.find((c) => c.id === courseId);

  // ─── Loading ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LoadingState lines={5} message="Đang tải lịch" />
      </View>
    );
  }

  // ─── Error ───────────────────────────────────────────────
  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ErrorState
          message="Không thể tải lịch bài tập"
          onRetry={handleRefresh}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Toggle chế độ xem */}
      <View style={[styles.toggleRow, { borderBottomColor: theme.divider }]}>
        <Pressable
          onPress={() => setViewMode('weekly')}
          style={[
            styles.toggleBtn,
            viewMode === 'weekly' && {
              backgroundColor: theme.primary,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Xem theo tuần"
          accessibilityState={{ selected: viewMode === 'weekly' }}
        >
          <Text
            style={[
              styles.toggleText,
              {
                color:
                  viewMode === 'weekly'
                    ? theme.onPrimary
                    : theme.textSecondary,
              },
            ]}
          >
            📅 Tuần
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode('list')}
          style={[
            styles.toggleBtn,
            viewMode === 'list' && {
              backgroundColor: theme.primary,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Xem danh sách"
          accessibilityState={{ selected: viewMode === 'list' }}
        >
          <Text
            style={[
              styles.toggleText,
              {
                color:
                  viewMode === 'list'
                    ? theme.onPrimary
                    : theme.textSecondary,
              },
            ]}
          >
            📋 Danh sách
          </Text>
        </Pressable>
      </View>

      {/* Lịch tuần (chỉ hiện khi ở chế độ weekly) */}
      {viewMode === 'weekly' ? (
        <WeeklyCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          assignmentDates={assignmentDates}
        />
      ) : null}

      {/* Bộ lọc */}
      <View style={styles.filterSection}>
        {/* Lọc theo môn */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <Pressable
            onPress={() => setFilters({ courseId: undefined })}
            style={[
              styles.filterChip,
              {
                backgroundColor: !filters.courseId
                  ? theme.primary
                  : theme.backgroundTertiary,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Tất cả môn"
            accessibilityState={{ selected: !filters.courseId }}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color: !filters.courseId
                    ? theme.onPrimary
                    : theme.textSecondary,
                },
              ]}
            >
              Tất cả
            </Text>
          </Pressable>
          {(courses ?? []).map((course) => (
            <Pressable
              key={course.id}
              onPress={() => setFilters({ courseId: course.id })}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    filters.courseId === course.id
                      ? theme.primary
                      : theme.backgroundTertiary,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Lọc theo ${course.name}`}
              accessibilityState={{ selected: filters.courseId === course.id }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color:
                      filters.courseId === course.id
                        ? theme.onPrimary
                        : theme.textSecondary,
                  },
                ]}
              >
                {course.code}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Lọc theo trạng thái */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {STATUS_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setFilters({ status: opt.value })}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    filters.status === opt.value
                      ? theme.primary
                      : theme.backgroundTertiary,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Trạng thái: ${opt.label}`}
              accessibilityState={{ selected: filters.status === opt.value }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color:
                      filters.status === opt.value
                        ? theme.onPrimary
                        : theme.textSecondary,
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Danh sách bài tập & lịch học */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Chưa có lịch học hoặc bài tập"
          subtitle={
            viewMode === 'weekly'
              ? 'Không có lịch học hoặc bài tập nào vào ngày này'
              : 'Thử thay đổi bộ lọc hoặc nhấn nút + để thêm mới'
          }
        />
      ) : (
        <FlatList<Assignment>
          data={filteredAssignments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AssignmentCard
              assignment={item}
              course={getCourse(item.courseId)}
            />
          )}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  toggleBtn: {
    minHeight: minTouchSize,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    ...typography.captionBold,
  },
  filterSection: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipText: {
    ...typography.small,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: spacing.huge,
  },
});
