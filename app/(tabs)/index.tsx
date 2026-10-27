/**
 * Trang chủ — Home Dashboard
 * - Widget tóm tắt deadline 48h (Should Have > 8 điểm)
 * - Danh sách bài tập sắp đến hạn
 * - Nút đăng xuất
 * - 4 trạng thái: loading, empty, error, content
 */
import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useAssignments } from '@/api/assignments';
import { useCourses } from '@/api/courses';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { WidgetSummary } from '@/components/WidgetSummary';
import { AssignmentCard } from '@/components/AssignmentCard';
import { spacing, typography, minTouchSize, hitSlop, radii } from '@/constants/tokens';
import type { Assignment } from '@/types';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const {
    data: assignments,
    isLoading: loadingAssignments,
    isError: errorAssignments,
    error: assignmentError,
    refetch: refetchAssignments,
  } = useAssignments();

  const {
    data: courses,
    isLoading: loadingCourses,
    isError: errorCourses,
    error: courseError,
    refetch: refetchCourses,
  } = useCourses();

  const isLoading = loadingAssignments || loadingCourses;
  const isError = errorAssignments || errorCourses;

  const handleRefresh = () => {
    void refetchAssignments();
    void refetchCourses();
  };

  const handleSignOut = () => {
    void signOut();
  };

  // Sắp xếp: bài tập pending trước, theo deadline gần nhất
  const sortedAssignments = React.useMemo(() => {
    if (!assignments) return [];
    return [...assignments]
      .filter((a) => a.status === 'pending')
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }, [assignments]);

  const getCourse = (courseId: string) =>
    courses?.find((c) => c.id === courseId);

  // ─── Trạng thái Loading ──────────────────────────────────
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LoadingState lines={5} message="Đang tải trang chủ" />
      </View>
    );
  }

  // ─── Trạng thái Error ────────────────────────────────────
  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ErrorState
          message={
            assignmentError?.message ??
            courseError?.message ??
            'Không thể tải dữ liệu'
          }
          onRetry={handleRefresh}
        />
      </View>
    );
  }

  // ─── Trạng thái Empty ────────────────────────────────────
  if (!assignments?.length) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.greeting, { color: theme.textPrimary }]}>
            Xin chào, {user?.name ?? 'bạn'} 👋
          </Text>
          <Pressable
            onPress={handleSignOut}
            style={styles.signOutBtn}
            accessibilityRole="button"
            accessibilityLabel="Đăng xuất"
            hitSlop={hitSlop.minimum}
          >
            <Text style={[styles.signOutText, { color: theme.error }]}>
              Đăng xuất
            </Text>
          </Pressable>
        </View>
        <EmptyState
          icon="📝"
          title="Chưa có bài tập nào"
          subtitle="Nhấn nút + phía trên để thêm bài tập đầu tiên"
        />
      </View>
    );
  }

  // ─── Trạng thái Content ──────────────────────────────────
  const renderHeader = () => (
    <View>
      {/* Header + Đăng xuất */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: theme.textPrimary }]}>
            Xin chào, {user?.name ?? 'bạn'} 👋
          </Text>
          <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>
            {sortedAssignments.length} bài tập cần hoàn thành
          </Text>
        </View>
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất"
          hitSlop={hitSlop.minimum}
        >
          <Text style={[styles.signOutText, { color: theme.error }]}>
            Đăng xuất
          </Text>
        </Pressable>
      </View>

      {/* Widget 48h */}
      <WidgetSummary
        assignments={assignments ?? []}
        courses={courses ?? []}
      />

      {/* Tiêu đề danh sách */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        📋 Bài tập sắp tới
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList<Assignment>
        data={sortedAssignments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AssignmentCard
            assignment={item}
            course={getCourse(item.courseId)}
          />
        )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  greeting: {
    ...typography.h2,
  },
  subGreeting: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  signOutBtn: {
    minHeight: minTouchSize,
    minWidth: minTouchSize,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  signOutText: {
    ...typography.captionBold,
  },
  sectionTitle: {
    ...typography.h3,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.huge,
  },
});
