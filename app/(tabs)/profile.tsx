/**
 * Màn hình Cá nhân & Cài đặt — Profile Screen
 * - Thông tin nhóm sinh viên thực hiện (3 MSSV: 1923050269, 1923050154, 1923050091)
 * - Thông tin tài khoản người dùng & phiên đăng nhập
 * - Cài đặt giao diện (Sáng / Tối)
 * - Trạng thái kết nối mạng & bộ nhớ tạm offline
 * - Đăng xuất tài khoản an toàn (xóa token SecureStore)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { requestNotificationPermissions } from '@/utils/notifications';
import {
  spacing,
  typography,
  radii,
  minTouchSize,
  hitSlop,
} from '@/constants/tokens';

// Danh sách sinh viên thực hiện đề tài
const GROUP_MEMBERS = [
  { mssv: '1923050269', role: 'Trưởng nhóm - Frontend & UI/UX' },
  { mssv: '1923050154', role: 'Thành viên - API & State Management' },
  { mssv: '1923050091', role: 'Thành viên - Database & Testing' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const themePreference = useAppStore((s) => s.themePreference);
  const setThemePreference = useAppStore((s) => s.setThemePreference);
  const { isOnline, lastOnlineAt } = useNetworkStatus();

  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const handleToggleTheme = () => {
    const nextTheme = themePreference === 'dark' ? 'light' : 'dark';
    setThemePreference(nextTheme);
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Thông báo',
          'Vui lòng cấp quyền thông báo trong Cài đặt hệ thống để nhận thông báo deadline.'
        );
        return;
      }
    }
    setNotificationEnabled(value);
  };

  const handleSignOut = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Thông tin tài khoản */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.borderLight,
          },
        ]}
      >
        <View style={styles.avatarRow}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <Text style={[styles.avatarText, { color: theme.primary }]}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>
              {user?.name ?? 'Sinh viên'}
            </Text>
            <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
              {user?.email ?? 'sinhvien@hutech.edu.vn'}
            </Text>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? theme.success : theme.warning },
                ]}
              />
              <Text style={[styles.statusText, { color: theme.textMuted }]}>
                {isOnline ? 'Đang trực tuyến' : 'Chế độ ngoại tuyến'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Thông tin nhóm sinh viên thực hiện */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        👥 Nhóm sinh viên thực hiện (Topic 01)
      </Text>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.borderLight,
          },
        ]}
      >
        <Text style={[styles.projectTitle, { color: theme.primary }]}>
          Study Planner — Quản lý Lịch học & Deadline
        </Text>
        <Text style={[styles.projectSub, { color: theme.textSecondary }]}>
          Đồ án Chuyên đề Lập trình Mobile (Năm 4)
        </Text>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {GROUP_MEMBERS.map((member, index) => (
          <View key={member.mssv} style={styles.memberRow}>
            <View
              style={[
                styles.memberBadge,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <Text style={[styles.memberIndex, { color: theme.primary }]}>
                0{index + 1}
              </Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={[styles.memberMssv, { color: theme.textPrimary }]}>
                MSSV: {member.mssv}
              </Text>
              <Text
                style={[styles.memberRole, { color: theme.textSecondary }]}
              >
                {member.role}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Cài đặt ứng dụng */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        ⚙️ Cài đặt hệ thống
      </Text>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.borderLight,
          },
        ]}
      >
        {/* Chế độ tối */}
        <View style={styles.settingItem}>
          <View style={styles.settingTextGroup}>
            <Text
              style={[styles.settingLabel, { color: theme.textPrimary }]}
            >
              Giao diện tối (Dark Mode)
            </Text>
            <Text
              style={[styles.settingDesc, { color: theme.textSecondary }]}
            >
              {themePreference === 'dark' ? 'Đang bật' : 'Đang tắt'}
            </Text>
          </View>
          <Switch
            value={themePreference === 'dark'}
            onValueChange={handleToggleTheme}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Bật hoặc tắt giao diện tối"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {/* Thông báo nhắc deadline */}
        <View style={styles.settingItem}>
          <View style={styles.settingTextGroup}>
            <Text
              style={[styles.settingLabel, { color: theme.textPrimary }]}
            >
              Nhắc nhở Deadline
            </Text>
            <Text
              style={[styles.settingDesc, { color: theme.textSecondary }]}
            >
              Thông báo trước 24h và 2h khi có bài tập
            </Text>
          </View>
          <Switch
            value={notificationEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Bật hoặc tắt thông báo nhắc nhở"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {/* Trạng thái đồng bộ */}
        <View style={styles.settingItem}>
          <View style={styles.settingTextGroup}>
            <Text
              style={[styles.settingLabel, { color: theme.textPrimary }]}
            >
              Đồng bộ dữ liệu ngoại tuyến
            </Text>
            <Text
              style={[styles.settingDesc, { color: theme.textSecondary }]}
            >
              {isOnline
                ? 'Đã đồng bộ đầy đủ'
                : `Lần cuối: ${
                    lastOnlineAt
                      ? new Date(lastOnlineAt).toLocaleTimeString('vi-VN')
                      : 'Chưa có'
                  }`}
            </Text>
          </View>
          <Text style={[styles.syncStatus, { color: theme.primary }]}>
            {isOnline ? '✓ Tự động' : 'Đang chờ'}
          </Text>
        </View>
      </View>

      {/* Nút đăng xuất */}
      <Pressable
        onPress={handleSignOut}
        style={({ pressed }) => [
          styles.signOutButton,
          {
            backgroundColor: theme.errorLight,
            borderColor: theme.error,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Đăng xuất khỏi tài khoản"
        hitSlop={hitSlop.minimum}
      >
        <Text style={[styles.signOutButtonText, { color: theme.error }]}>
          🚪 Đăng xuất tài khoản
        </Text>
      </Pressable>

      <Text style={[styles.appVersion, { color: theme.textMuted }]}>
        Study Planner v1.0.0 • Expo SDK 58 • React Native 0.88
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.md,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    ...typography.h3,
  },
  userEmail: {
    ...typography.caption,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.small,
  },
  sectionTitle: {
    ...typography.captionBold,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  projectTitle: {
    ...typography.bodyBold,
    marginBottom: 2,
  },
  projectSub: {
    ...typography.caption,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: 4,
  },
  memberBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberIndex: {
    fontSize: 12,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberMssv: {
    ...typography.bodyBold,
    fontSize: 14,
  },
  memberRole: {
    ...typography.small,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: minTouchSize,
  },
  settingTextGroup: {
    flex: 1,
    paddingRight: spacing.md,
  },
  settingLabel: {
    ...typography.bodyBold,
    fontSize: 15,
  },
  settingDesc: {
    ...typography.small,
    marginTop: 2,
  },
  syncStatus: {
    ...typography.captionBold,
  },
  signOutButton: {
    minHeight: minTouchSize,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  signOutButtonText: {
    ...typography.bodyBold,
  },
  appVersion: {
    ...typography.small,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
