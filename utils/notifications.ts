/**
 * Quản lý thông báo cục bộ (Local Notifications)
 * - Yêu cầu quyền thông báo
 * - Lên lịch nhắc nhở deadline bài tập trước 24 giờ và 2 giờ
 * - Hủy thông báo khi bài tập hoàn thành hoặc bị xóa
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Assignment } from '@/types';

// Cấu hình hiển thị thông báo khi ứng dụng đang mở (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

/**
 * Yêu cầu quyền gửi thông báo từ người dùng
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return true;
  }
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('deadlines', {
        name: 'Nhắc nhở Deadline',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
      });
    }

    return true;
  } catch (err) {
    console.warn('Lỗi khi yêu cầu quyền thông báo:', err);
    return false;
  }
}

/**
 * Lên lịch nhắc deadline trước 24 giờ và 2 giờ
 */
export async function scheduleAssignmentReminder(assignment: Assignment): Promise<string[]> {
  if (Platform.OS === 'web') {
    return [];
  }
  try {
    const permissions = await Notifications.getPermissionsAsync();
    if (permissions.status !== 'granted') {
      return [];
    }

    const dueDate = new Date(assignment.dueAt);
    const now = new Date();
    const scheduledIds: string[] = [];

    // Nhắc trước 24 giờ
    const trigger24h = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
    if (trigger24h > now) {
      const id24h = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Nhắc nhở: Deadline ngày mai!',
          body: `Bài tập "${assignment.title}" sẽ đến hạn vào ngày mai.`,
          data: { assignmentId: assignment.id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: trigger24h,
        },
      });
      scheduledIds.push(id24h);
    }

    // Nhắc trước 2 giờ
    const trigger2h = new Date(dueDate.getTime() - 2 * 60 * 60 * 1000);
    if (trigger2h > now) {
      const id2h = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Khẩn cấp: Sắp hết hạn!',
          body: `Bài tập "${assignment.title}" sẽ hết hạn sau 2 giờ nữa!`,
          data: { assignmentId: assignment.id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: trigger2h,
        },
      });
      scheduledIds.push(id2h);
    }

    return scheduledIds;
  } catch (err) {
    console.warn('Lỗi lên lịch thông báo:', err);
    return [];
  }
}

/**
 * Hủy thông báo theo assignment ID
 */
export async function cancelAssignmentReminder(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.warn('Lỗi khi hủy thông báo:', err);
  }
}
