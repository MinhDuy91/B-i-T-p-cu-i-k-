/**
 * Chi tiết bài tập — Dynamic Route [id]
 * - Hiển thị thông tin đầy đủ bài tập
 * - Đánh dấu hoàn thành / chưa hoàn thành (optimistic update)
 * - Hiển thị ảnh ghi chú đính kèm (Should Have > 8 điểm)
 * - Nút sửa (mở modal), nút xóa
 * - 4 trạng thái: loading, empty, error, content
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAssignment, useUpdateAssignment, useDeleteAssignment } from '@/api/assignments';
import { useCourse } from '@/api/courses';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  formatDateVN,
  formatTime,
  getDeadlineLabel,
  isOverdue,
  isDueSoon,
} from '@/utils/dates';
import { spacing, typography, radii, minTouchSize, hitSlop } from '@/constants/tokens';

export default function AssignmentDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: assignment,
    isLoading,
    isError,
    refetch,
  } = useAssignment(id ?? '');

  const { data: course } = useCourse(assignment?.courseId ?? '');
  const updateMutation = useUpdateAssignment();
  const deleteMutation = useDeleteAssignment();

  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Đánh dấu hoàn thành / bỏ đánh dấu
  const handleToggleStatus = async () => {
    if (!assignment) return;
    setIsTogglingStatus(true);
    try {
      const newStatus = assignment.status === 'completed' ? 'pending' : 'completed';
      await updateMutation.mutateAsync({
        id: assignment.id,
        input: { status: newStatus },
      });
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái. Vui lòng thử lại.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Xóa bài tập / lịch học
  const executeDelete = async () => {
    if (!assignment?.id) return;
    try {
      await deleteMutation.mutateAsync(assignment.id);
      if (Platform.OS === 'web') {
        router.replace(assignment.type === 'schedule' ? '/(tabs)/calendar' : '/(tabs)');
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Lỗi khi xóa:', err);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Không thể xóa bài tập / lịch học.');
      } else {
        Alert.alert('Lỗi', 'Không thể xóa bài tập / lịch học.');
      }
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  // Sửa bài tập (mở modal)
  const handleEdit = () => {
    if (assignment) {
      router.push({
        pathname: '/modal/new-assignment',
        params: { editId: assignment.id },
      });
    }
  };

  // ─── Loading ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LoadingState lines={6} message="Đang tải chi tiết bài tập" />
      </View>
    );
  }

  // ─── Error ───────────────────────────────────────────────
  if (isError || !assignment) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ErrorState
          message="Không thể tải chi tiết bài tập"
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  // ─── Content ─────────────────────────────────────────────
  const isCompleted = assignment.status === 'completed';
  const overdue = !isCompleted && isOverdue(assignment.dueAt);
  const dueSoon = !isCompleted && isDueSoon(assignment.dueAt);

  const statusColor = isCompleted
    ? theme.success
    : overdue
    ? theme.error
    : dueSoon
    ? theme.warning
    : theme.primary;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Trạng thái + Môn học */}
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: isCompleted ? theme.successLight : overdue ? theme.errorLight : theme.infoLight },
        ]}
      >
        <Text style={[styles.statusText, { color: statusColor }]}>
          {isCompleted ? '✅ Đã hoàn thành' : overdue ? '🚨 Quá hạn' : dueSoon ? '⏰ Sắp đến hạn' : '📝 Đang thực hiện'}
        </Text>
      </View>

      {/* Tiêu đề */}
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        {assignment.title}
      </Text>

      {/* Thông tin môn học */}
      {course ? (
        <View style={styles.infoRow}>
          <View
            style={[styles.courseDot, { backgroundColor: course.colour }]}
          />
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
            {course.code} — {course.name}
          </Text>
        </View>
      ) : null}

      {/* Thông tin deadline */}
      <View
        style={[
          styles.infoCard,
          { backgroundColor: theme.surface, borderColor: theme.borderLight },
        ]}
      >
        <View style={styles.infoItem}>
          <Text style={[styles.infoItemLabel, { color: theme.textTertiary }]}>
            📅 Ngày nộp
          </Text>
          <Text style={[styles.infoItemValue, { color: theme.textPrimary }]}>
            {formatDateVN(assignment.dueAt)}
          </Text>
        </View>
        <View
          style={[styles.infoDivider, { backgroundColor: theme.divider }]}
        />
        <View style={styles.infoItem}>
          <Text style={[styles.infoItemLabel, { color: theme.textTertiary }]}>
            ⏰ Giờ nộp
          </Text>
          <Text style={[styles.infoItemValue, { color: theme.textPrimary }]}>
            {formatTime(assignment.dueAt)}
          </Text>
        </View>
        <View
          style={[styles.infoDivider, { backgroundColor: theme.divider }]}
        />
        <View style={styles.infoItem}>
          <Text style={[styles.infoItemLabel, { color: theme.textTertiary }]}>
            ⏳ Còn lại
          </Text>
          <Text style={[styles.infoItemValue, { color: statusColor }]}>
            {getDeadlineLabel(assignment.dueAt)}
          </Text>
        </View>
      </View>

      {/* Ghi chú */}
      {assignment.notes ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            📝 Ghi chú
          </Text>
          <Text style={[styles.notes, { color: theme.textSecondary }]}>
            {assignment.notes}
          </Text>
        </View>
      ) : null}

      {/* Ảnh đính kèm (Should Have) */}
      {assignment.photoUri ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            📸 Ảnh đính kèm
          </Text>
          <Image
            source={{ uri: assignment.photoUri }}
            style={styles.photo}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Ảnh ghi chú đính kèm"
          />
        </View>
      ) : null}

      {/* Nút hành động hoặc Hộp xác nhận xóa */}
      {showDeleteConfirm ? (
        <View
          style={[
            styles.confirmContainer,
            { backgroundColor: theme.errorLight, borderColor: theme.error },
          ]}
        >
          <Text style={[styles.confirmTitle, { color: theme.error }]}>
            ⚠️ Xác nhận xóa {assignment.type === 'schedule' ? 'lịch học' : 'bài tập'}?
          </Text>
          <Text style={[styles.confirmDesc, { color: theme.textSecondary }]}>
            Bạn có chắc chắn muốn xóa "{assignment.title}" không? Hành động này không thể hoàn tác.
          </Text>
          <View style={styles.confirmButtonsRow}>
            <Pressable
              onPress={() => setShowDeleteConfirm(false)}
              disabled={deleteMutation.isPending}
              style={[
                styles.confirmCancelBtn,
                { backgroundColor: theme.surface, borderColor: theme.borderLight },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Hủy xóa"
            >
              <Text style={[styles.confirmCancelText, { color: theme.textPrimary }]}>
                Hủy bỏ
              </Text>
            </Pressable>
            <Pressable
              onPress={() => void executeDelete()}
              disabled={deleteMutation.isPending}
              style={[
                styles.confirmDeleteBtn,
                { backgroundColor: theme.error },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Xác nhận xóa ngay"
            >
              {deleteMutation.isPending ? (
                <ActivityIndicator color={theme.onPrimary} size="small" />
              ) : (
                <Text style={[styles.confirmDeleteText, { color: theme.onPrimary }]}>
                  🗑️ Đồng ý xóa ngay
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          {/* Đánh dấu hoàn thành */}
          <Pressable
            onPress={() => void handleToggleStatus()}
            disabled={isTogglingStatus}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: isCompleted ? theme.warningLight : theme.successLight,
                opacity: pressed || isTogglingStatus ? 0.7 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'
            }
          >
            {isTogglingStatus ? (
              <ActivityIndicator color={isCompleted ? theme.warning : theme.success} />
            ) : (
              <Text
                style={[
                  styles.actionText,
                  { color: isCompleted ? theme.warning : theme.success },
                ]}
              >
                {isCompleted ? '↩️ Mở lại' : '✅ Hoàn thành'}
              </Text>
            )}
          </Pressable>

          {/* Sửa */}
          <Pressable
            onPress={handleEdit}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: theme.infoLight,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Sửa bài tập"
            hitSlop={hitSlop.minimum}
          >
            <Text style={[styles.actionText, { color: theme.info }]}>
              ✏️ Sửa
            </Text>
          </Pressable>

          {/* Xóa */}
          <Pressable
            onPress={() => setShowDeleteConfirm(true)}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: theme.errorLight,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Xóa bài tập"
            hitSlop={hitSlop.minimum}
          >
            <Text style={[styles.actionText, { color: theme.error }]}>
              🗑️ Xóa
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.huge,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  statusText: {
    ...typography.captionBold,
  },
  title: {
    ...typography.h1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  courseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoLabel: {
    ...typography.body,
  },
  infoCard: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoItemLabel: {
    ...typography.small,
  },
  infoItemValue: {
    ...typography.captionBold,
    textAlign: 'center',
  },
  infoDivider: {
    width: 1,
    marginHorizontal: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
  },
  notes: {
    ...typography.body,
    lineHeight: 24,
  },
  photo: {
    width: '100%',
    height: 250,
    borderRadius: radii.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    minHeight: minTouchSize,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  actionText: {
    ...typography.captionBold,
  },
  confirmContainer: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  confirmTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  confirmDesc: {
    fontSize: typography.caption.fontSize,
    lineHeight: 18,
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
  },
  confirmCancelText: {
    fontWeight: '600',
    fontSize: typography.body.fontSize,
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  confirmDeleteText: {
    fontWeight: '700',
    fontSize: typography.body.fontSize,
  },
});
