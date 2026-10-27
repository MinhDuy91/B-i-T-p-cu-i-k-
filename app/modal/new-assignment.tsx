/**
 * Modal thêm/sửa bài tập — Modal Route
 * - Chọn môn học, nhập tiêu đề, chọn deadline
 * - Đính kèm ảnh ghi chú (Should Have > 8 điểm)
 * - Hỗ trợ cả tạo mới và chỉnh sửa
 * - 4 trạng thái: loading, empty (form mới), error, content (form chỉnh sửa)
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/hooks/useTheme';
import { useCourses } from '@/api/courses';
import {
  useAssignment,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
} from '@/api/assignments';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { spacing, typography, radii, minTouchSize, hitSlop } from '@/constants/tokens';
import { scheduleAssignmentReminder } from '@/utils/notifications';

import type { AssignmentType } from '@/types';

export default function NewAssignmentModal() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string; type?: AssignmentType }>();
  const isEditing = !!params.editId;

  // Dữ liệu
  const { data: courses, isLoading: loadingCourses } = useCourses();
  const {
    data: editingAssignment,
    isLoading: loadingEdit,
  } = useAssignment(params.editId ?? '');

  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();
  const deleteMutation = useDeleteAssignment();

  const getTodayString = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Form state
  const [itemType, setItemType] = useState<AssignmentType>(
    params.type === 'schedule' ? 'schedule' : 'assignment'
  );
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState(getTodayString());
  const [dueTime, setDueTime] = useState('08:00');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Tự động chọn môn học đầu tiên khi danh sách môn nạp xong
  useEffect(() => {
    if (!courseId && courses && courses.length > 0) {
      setCourseId(courses[0].id);
    }
  }, [courses, courseId]);

  // Điền sẵn khi chỉnh sửa
  useEffect(() => {
    if (isEditing && editingAssignment) {
      if (editingAssignment.type) {
        setItemType(editingAssignment.type);
      }
      setCourseId(editingAssignment.courseId);
      setTitle(editingAssignment.title);
      setNotes(editingAssignment.notes ?? '');
      setPhotoUri(editingAssignment.photoUri);

      const dateObj = new Date(editingAssignment.dueAt);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      setDueDate(`${year}-${month}-${day}`);

      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      setDueTime(`${hours}:${minutes}`);
    }
  }, [isEditing, editingAssignment]);

  // Chọn ảnh từ thư viện
  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để đính kèm.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // Chụp ảnh
  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập camera để chụp ảnh.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // Gửi form
  const handleSubmit = async () => {
    setFormError(null);
    const selectedCourseId = courseId || courses?.[0]?.id;

    if (!selectedCourseId) {
      const msg = 'Vui lòng chọn môn học';
      setFormError(msg);
      if (Platform.OS === 'web' && typeof window !== 'undefined') window.alert(msg);
      else Alert.alert('Thiếu thông tin', msg);
      return;
    }

    if (!title.trim()) {
      const msg = `Vui lòng nhập tiêu đề ${itemType === 'schedule' ? 'lịch học' : 'bài tập'}`;
      setFormError(msg);
      if (Platform.OS === 'web' && typeof window !== 'undefined') window.alert(msg);
      else Alert.alert('Thiếu thông tin', msg);
      return;
    }

    const finalDate = dueDate.trim() || getTodayString();
    const finalTime = dueTime.trim() || '08:00';

    // Parse date
    const dueDateTimeStr = `${finalDate}T${finalTime}:00`;
    const dueAt = new Date(dueDateTimeStr);
    if (isNaN(dueAt.getTime())) {
      const msg = 'Định dạng ngày giờ không hợp lệ. Vui lòng dùng YYYY-MM-DD (Ví dụ: 2026-10-30)';
      setFormError(msg);
      if (Platform.OS === 'web' && typeof window !== 'undefined') window.alert(msg);
      else Alert.alert('Lỗi', msg);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && params.editId) {
        const updated = await updateMutation.mutateAsync({
          id: params.editId,
          input: {
            courseId: selectedCourseId,
            title: title.trim(),
            notes: notes.trim() || undefined,
            dueAt: dueAt.toISOString(),
            photoUri,
            type: itemType,
          },
        });
        void scheduleAssignmentReminder(updated);
      } else {
        const created = await createMutation.mutateAsync({
          courseId: selectedCourseId,
          title: title.trim(),
          notes: notes.trim() || undefined,
          dueAt: dueAt.toISOString(),
          status: 'pending',
          photoUri,
          type: itemType,
        });
        void scheduleAssignmentReminder(created);
      }

      // Đóng modal và chuyển trang an toàn trên cả Web và Mobile
      if (Platform.OS === 'web') {
        router.replace('/(tabs)/calendar');
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Lỗi khi lưu:', err);
      const msg = err instanceof Error ? err.message : `Không thể lưu ${itemType === 'schedule' ? 'lịch học' : 'bài tập'}.`;
      setFormError(msg);
      if (Platform.OS === 'web' && typeof window !== 'undefined') window.alert(msg);
      else Alert.alert('Lỗi', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa mục khi đang ở chế độ chỉnh sửa (isEditing)
  const executeDelete = async () => {
    if (!params.editId) return;

    try {
      setIsSubmitting(true);
      await deleteMutation.mutateAsync(params.editId);
      if (Platform.OS === 'web') {
        router.replace(itemType === 'schedule' ? '/(tabs)/calendar' : '/(tabs)');
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Lỗi khi xóa:', err);
      const msg = 'Không thể xóa mục này.';
      setFormError(msg);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(msg);
      } else {
        Alert.alert('Lỗi', msg);
      }
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────
  if (loadingCourses || (isEditing && loadingEdit)) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LoadingState lines={4} message="Đang tải form" />
      </View>
    );
  }

  // ─── Error ───────────────────────────────────────────────
  if (!courses?.length) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ErrorState
          message="Không thể tải danh sách môn học"
          onRetry={() => router.back()}
        />
      </View>
    );
  }

  const isSchedule = itemType === 'schedule';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Hủy"
          hitSlop={hitSlop.minimum}
        >
          <Text style={[styles.cancelText, { color: theme.error }]}>Hủy</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {isEditing
            ? isSchedule
              ? 'Sửa lịch học'
              : 'Sửa bài tập'
            : isSchedule
            ? 'Thêm lịch học mới'
            : 'Thêm bài tập mới'}
        </Text>
        <Pressable
          onPress={() => void handleSubmit()}
          disabled={isSubmitting}
          style={[styles.headerBtn, { opacity: isSubmitting ? 0.5 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Lưu"
          hitSlop={hitSlop.minimum}
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <Text style={[styles.saveText, { color: theme.primary }]}>Lưu</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        {/* Toggle chọn: Bài tập / Deadline vs Lịch học */}
        <View
          style={[
            styles.typeSelectorContainer,
            { backgroundColor: theme.backgroundSecondary, borderColor: theme.borderLight },
          ]}
        >
          <Pressable
            onPress={() => setItemType('assignment')}
            style={[
              styles.typeButton,
              !isSchedule && {
                backgroundColor: theme.surface,
                elevation: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                { color: !isSchedule ? theme.primary : theme.textSecondary },
                !isSchedule && { fontWeight: '700' },
              ]}
            >
              📝 Bài tập / Deadline
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setItemType('schedule')}
            style={[
              styles.typeButton,
              isSchedule && {
                backgroundColor: theme.surface,
                elevation: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                { color: isSchedule ? theme.primary : theme.textSecondary },
                isSchedule && { fontWeight: '700' },
              ]}
            >
              📅 Lịch học / Tiết học
            </Text>
          </Pressable>
        </View>

        {/* Thông báo lỗi trực quan */}
        {formError ? (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: theme.errorLight, borderColor: theme.error },
            ]}
          >
            <Text style={[styles.errorBannerText, { color: theme.error }]}>
              ⚠️ {formError}
            </Text>
          </View>
        ) : null}

        {/* Chọn môn học */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            📚 Môn học *
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.courseList}
          >
            {courses.map((course) => (
              <Pressable
                key={course.id}
                onPress={() => setCourseId(course.id)}
                style={[
                  styles.courseChip,
                  {
                    backgroundColor:
                      courseId === course.id
                        ? course.colour
                        : theme.backgroundTertiary,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Chọn môn ${course.name}`}
                accessibilityState={{ selected: courseId === course.id }}
              >
                <Text
                  style={[
                    styles.courseChipText,
                    {
                      color:
                        courseId === course.id
                          ? theme.textInverse
                          : theme.textSecondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {course.code}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Tiêu đề */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {isSchedule ? '📅 Tiêu đề lịch học / Buổi học *' : '📝 Tiêu đề bài tập *'}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.textPrimary,
                borderColor: theme.border,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder={
              isSchedule
                ? 'Ví dụ: Lịch học Thực hành Lập trình Mobile (Phòng A1-203)'
                : 'Ví dụ: Bài tập chương 5 - Quản lý State'
            }
            placeholderTextColor={theme.textTertiary}
            accessibilityLabel={isSchedule ? 'Tiêu đề lịch học' : 'Tiêu đề bài tập'}
          />
        </View>

        {/* Ngày nộp / Ngày học */}
        <View style={styles.dateRow}>
          <View style={[styles.inputGroup, { flex: 2 }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {isSchedule ? '📅 Ngày học * (YYYY-MM-DD)' : '📅 Ngày nộp * (YYYY-MM-DD)'}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="2026-10-30"
              placeholderTextColor={theme.textTertiary}
              keyboardType="default"
              accessibilityLabel={isSchedule ? 'Ngày học' : 'Ngày nộp'}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {isSchedule ? '⏰ Giờ bắt đầu' : '⏰ Giờ (HH:MM)'}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
              value={dueTime}
              onChangeText={setDueTime}
              placeholder="08:00"
              placeholderTextColor={theme.textTertiary}
              keyboardType="default"
              accessibilityLabel={isSchedule ? 'Giờ học' : 'Giờ nộp'}
            />
          </View>
        </View>

        {/* Ghi chú */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            📋 Ghi chú (tùy chọn)
          </Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.textPrimary,
                borderColor: theme.border,
              },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Thêm ghi chú, yêu cầu..."
            placeholderTextColor={theme.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            accessibilityLabel="Ghi chú"
          />
        </View>

        {/* Ảnh đính kèm (Should Have) */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            📸 Ảnh ghi chú / bảng trắng (tùy chọn)
          </Text>

          {photoUri ? (
            <View style={styles.photoPreview}>
              <Image
                source={{ uri: photoUri }}
                style={styles.previewImage}
                resizeMode="cover"
                accessibilityRole="image"
                accessibilityLabel="Ảnh đính kèm đã chọn"
              />
              <Pressable
                onPress={() => setPhotoUri(undefined)}
                style={[
                  styles.removePhotoBtn,
                  { backgroundColor: theme.errorLight },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Xóa ảnh đính kèm"
                hitSlop={hitSlop.minimum}
              >
                <Text style={[styles.removePhotoText, { color: theme.error }]}>
                  ✕ Xóa ảnh
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <Pressable
                onPress={() => void handlePickImage()}
                style={[
                  styles.photoBtn,
                  { backgroundColor: theme.backgroundTertiary },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Chọn ảnh từ thư viện"
              >
                <Text style={[styles.photoBtnText, { color: theme.textSecondary }]}>
                  🖼️ Thư viện
                </Text>
              </Pressable>
              <Pressable
                onPress={() => void handleTakePhoto()}
                style={[
                  styles.photoBtn,
                  { backgroundColor: theme.backgroundTertiary },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Chụp ảnh từ camera"
              >
                <Text style={[styles.photoBtnText, { color: theme.textSecondary }]}>
                  📷 Camera
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Nút Lưu to, rõ ràng ở cuối biểu mẫu (tiện lợi trên cả Web và Mobile) */}
        <Pressable
          onPress={() => void handleSubmit()}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.bottomSubmitBtn,
            {
              backgroundColor: theme.primary,
              opacity: pressed || isSubmitting ? 0.75 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Lưu"
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.onPrimary} />
          ) : (
            <Text style={[styles.bottomSubmitBtnText, { color: theme.onPrimary }]}>
              {isEditing
                ? isSchedule
                  ? '💾 Cập nhật Lịch học'
                  : '💾 Cập nhật Bài tập'
                : isSchedule
                ? '➕ Lưu Lịch học mới'
                : '➕ Lưu Bài tập mới'}
            </Text>
          )}
        </Pressable>

        {/* Nút Xóa (chỉ hiển thị khi đang sửa bài tập / lịch học) */}
        {isEditing ? (
          showDeleteConfirm ? (
            <View
              style={[
                styles.confirmContainer,
                { backgroundColor: theme.errorLight, borderColor: theme.error },
              ]}
            >
              <Text style={[styles.confirmTitle, { color: theme.error }]}>
                ⚠️ Xác nhận xóa {isSchedule ? 'lịch học' : 'bài tập'}?
              </Text>
              <Text style={[styles.confirmDesc, { color: theme.textSecondary }]}>
                Bạn có chắc chắn muốn xóa vĩnh viễn mục này không? Thao tác này không thể hoàn tác.
              </Text>
              <View style={styles.confirmButtonsRow}>
                <Pressable
                  onPress={() => setShowDeleteConfirm(false)}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  style={[
                    styles.confirmDeleteBtn,
                    { backgroundColor: theme.error },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Xác nhận xóa ngay"
                >
                  {isSubmitting ? (
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
            <Pressable
              onPress={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.deleteBtn,
                {
                  borderColor: theme.error,
                  backgroundColor: theme.errorLight,
                  opacity: pressed || isSubmitting ? 0.7 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Xóa"
            >
              <Text style={[styles.deleteBtnText, { color: theme.error }]}>
                {isSchedule ? '🗑️ Xóa lịch học này' : '🗑️ Xóa bài tập này'}
              </Text>
            </Pressable>
          )
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? spacing.huge : spacing.md,
  },
  headerBtn: {
    minHeight: minTouchSize,
    minWidth: minTouchSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
  },
  cancelText: {
    ...typography.bodyBold,
  },
  saveText: {
    ...typography.bodyBold,
  },
  form: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.huge * 2,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    ...typography.captionBold,
  },
  input: {
    ...typography.body,
    height: minTouchSize,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  textArea: {
    ...typography.body,
    minHeight: 100,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  courseList: {
    gap: spacing.sm,
  },
  courseChip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseChipText: {
    ...typography.captionBold,
  },
  photoPreview: {
    gap: spacing.sm,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: radii.md,
  },
  removePhotoBtn: {
    minHeight: minTouchSize,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    ...typography.captionBold,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoBtn: {
    flex: 1,
    minHeight: minTouchSize + 16,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoBtnText: {
    ...typography.captionBold,
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  typeButton: {
    flex: 1,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  typeButtonText: {
    ...typography.caption,
  },
  errorBanner: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  errorBannerText: {
    ...typography.captionBold,
    lineHeight: 18,
  },
  bottomSubmitBtn: {
    minHeight: minTouchSize + 6,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomSubmitBtnText: {
    ...typography.bodyBold,
    fontSize: 16,
  },
  deleteBtn: {
    minHeight: minTouchSize + 4,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  deleteBtnText: {
    ...typography.bodyBold,
    fontSize: 15,
  },
  confirmContainer: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
    marginTop: spacing.sm,
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
