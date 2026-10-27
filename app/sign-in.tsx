/**
 * Màn hình Đăng nhập & Đăng ký — Sign In / Sign Up
 * - Chuyển đổi linh hoạt giữa tab Đăng nhập và Đăng ký
 * - Ràng buộc: Email bắt buộc phải có đuôi .edu hoặc .edu.vn
 * - Báo lỗi chi tiết khi nhập sai mật khẩu hoặc tài khoản chưa tồn tại
 * - Nút Đăng nhập nhanh tài khoản mẫu sinh viên
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography, radii, minTouchSize } from '@/constants/tokens';

type AuthMode = 'signin' | 'signup';

export default function SignInScreen() {
  const theme = useTheme();
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);

  const [mode, setMode] = useState<AuthMode>('signin');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Chuyển chế độ Đăng nhập / Đăng ký
  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
  };

  // Xử lý Đăng nhập
  const handleSignIn = async () => {
    if (!email.trim()) {
      const msg = 'Vui lòng nhập email của bạn.';
      setError(msg);
      if (Platform.OS !== 'web') Alert.alert('Thông báo', msg);
      return;
    }
    if (!password) {
      const msg = 'Vui lòng nhập mật khẩu.';
      setError(msg);
      if (Platform.OS !== 'web') Alert.alert('Thông báo', msg);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await signIn(email.trim(), password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(message);
      if (Platform.OS !== 'web') {
        Alert.alert('Đăng nhập không thành công', message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý Đăng ký tài khoản mới
  const handleSignUp = async () => {
    if (!name.trim()) {
      const msg = 'Vui lòng nhập họ và tên của bạn.';
      setError(msg);
      if (Platform.OS !== 'web') Alert.alert('Thông báo', msg);
      return;
    }
    if (!email.trim()) {
      const msg = 'Vui lòng nhập email sinh viên (.edu / .edu.vn hoặc @gmail.com).';
      setError(msg);
      if (Platform.OS !== 'web') Alert.alert('Thông báo', msg);
      return;
    }
    if (!password) {
      const msg = 'Vui lòng nhập mật khẩu.';
      setError(msg);
      if (Platform.OS !== 'web') Alert.alert('Thông báo', msg);
      return;
    }
    if (password.length < 6) {
      const msg = 'Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên.';
      setError(msg);
      if (Platform.OS !== 'web') Alert.alert('Thông báo', msg);
      return;
    }
    if (password !== confirmPassword) {
      const msg = 'Mật khẩu xác nhận không khớp! Vui lòng nhập lại.';
      setError(msg);
      if (Platform.OS !== 'web') Alert.alert('Thông báo', msg);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại';
      setError(message);
      if (Platform.OS !== 'web') {
        Alert.alert('Đăng ký không thành công', message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Đăng nhập nhanh tài khoản mẫu (Tài khoản A hoặc B)
  const handleQuickSignIn = async (
    targetEmail: string = 'sinhvien@hutech.edu.vn',
    targetPass: string = '123456'
  ) => {
    setEmail(targetEmail);
    setPassword(targetPass);
    setIsSubmitting(true);
    setError(null);
    try {
      await signIn(targetEmail, targetPass);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header App */}
        <View style={styles.header}>
          <Text style={styles.emoji}>📚</Text>
          <Text style={[styles.appName, { color: theme.primary }]}>
            Study Planner
          </Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Quản lý Lịch học & Deadline Sinh viên
          </Text>
        </View>

        {/* Tab chuyển đổi Đăng nhập / Đăng ký */}
        <View
          style={[
            styles.tabSwitchContainer,
            { backgroundColor: theme.backgroundSecondary, borderColor: theme.borderLight },
          ]}
        >
          <Pressable
            onPress={() => handleSwitchMode('signin')}
            style={[
              styles.tabSwitchButton,
              mode === 'signin' && {
                backgroundColor: theme.surface,
                shadowColor: theme.shadowColor,
                elevation: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.tabSwitchText,
                { color: mode === 'signin' ? theme.primary : theme.textSecondary },
                mode === 'signin' && { fontWeight: '700' },
              ]}
            >
              🔐 Đăng nhập
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleSwitchMode('signup')}
            style={[
              styles.tabSwitchButton,
              mode === 'signup' && {
                backgroundColor: theme.surface,
                shadowColor: theme.shadowColor,
                elevation: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.tabSwitchText,
                { color: mode === 'signup' ? theme.primary : theme.textSecondary },
                mode === 'signup' && { fontWeight: '700' },
              ]}
            >
              📝 Đăng ký mới
            </Text>
          </Pressable>
        </View>

        {/* Form Card */}
        <View
          style={[
            styles.form,
            { backgroundColor: theme.surface, borderColor: theme.borderLight },
          ]}
        >
          {/* Ô Họ tên (Chỉ hiện khi Đăng ký) */}
          {mode === 'signup' ? (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                👤 Họ và tên sinh viên
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
                value={name}
                onChangeText={setName}
                placeholder="Ví dụ: Nguyễn Văn A"
                placeholderTextColor={theme.textTertiary}
                editable={!isSubmitting}
              />
            </View>
          ) : null}

          {/* Ô Email */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                📧 Email sinh viên
              </Text>
              <Text style={[styles.eduTag, { color: theme.primary, backgroundColor: theme.primaryLight }]}>
                .edu / .edu.vn / @gmail.com
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.textPrimary,
                  borderColor: error && !email ? theme.error : theme.border,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder={mode === 'signin' ? 'sinhvien@hutech.edu.vn hoặc ten@gmail.com' : 'ten@student.edu.vn hoặc ten@gmail.com'}
              placeholderTextColor={theme.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
            />
          </View>

          {/* Ô Mật khẩu */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              🔒 Mật khẩu
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.textPrimary,
                  borderColor: error && !password ? theme.error : theme.border,
                },
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              placeholderTextColor={theme.textTertiary}
              secureTextEntry
              editable={!isSubmitting}
            />
          </View>

          {/* Ô Xác nhận mật khẩu (Chỉ hiện khi Đăng ký) */}
          {mode === 'signup' ? (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                🔐 Xác nhận mật khẩu
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
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu ở trên"
                placeholderTextColor={theme.textTertiary}
                secureTextEntry
                editable={!isSubmitting}
              />
            </View>
          ) : null}

          {/* Thông báo Lỗi */}
          {error ? (
            <View
              style={[styles.errorBox, { backgroundColor: theme.errorLight, borderColor: theme.error }]}
              accessibilityRole="alert"
            >
              <Text style={[styles.errorText, { color: theme.error }]}>
                ⚠️ {error}
              </Text>
            </View>
          ) : null}

          {/* Thông báo Thành công */}
          {successMsg ? (
            <View
              style={[styles.successBox, { backgroundColor: theme.successLight }]}
            >
              <Text style={[styles.successText, { color: theme.success }]}>
                ✓ {successMsg}
              </Text>
            </View>
          ) : null}

          {/* Nút hành động chính (Đăng nhập / Đăng ký) */}
          <Pressable
            onPress={() => (mode === 'signin' ? void handleSignIn() : void handleSignUp())}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: theme.primary,
                opacity: pressed || isSubmitting ? 0.7 : 1,
              },
            ]}
            accessibilityRole="button"
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <Text style={[styles.primaryButtonText, { color: theme.onPrimary }]}>
                {mode === 'signin' ? 'Đăng nhập vào App' : 'Tạo tài khoản mới'}
              </Text>
            )}
          </Pressable>

          {/* Nút Đăng nhập nhanh demo (Chỉ hiện khi Đăng nhập) */}
          {mode === 'signin' ? (
            <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
              <Pressable
                onPress={() => void handleQuickSignIn('sinhvien@hutech.edu.vn', '123456')}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.quickSignInButton,
                  {
                    borderColor: theme.primary,
                    opacity: pressed || isSubmitting ? 0.7 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Đăng nhập tài khoản A"
              >
                <Text style={[styles.quickSignInText, { color: theme.primary }]}>
                  ⚡ Đăng nhập Tài khoản A (sinhvien@hutech.edu.vn)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => void handleQuickSignIn('minhduy@student.edu.vn', '123456')}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.quickSignInButton,
                  {
                    borderColor: theme.secondary ?? theme.primary,
                    opacity: pressed || isSubmitting ? 0.7 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Đăng nhập tài khoản B"
              >
                <Text style={[styles.quickSignInText, { color: theme.secondary ?? theme.primary }]}>
                  ⚡ Đăng nhập Tài khoản B (minhduy@student.edu.vn)
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* Chuyển đổi nhanh cuối trang */}
        <Pressable
          onPress={() => handleSwitchMode(mode === 'signin' ? 'signup' : 'signin')}
          style={styles.switchModeFooter}
        >
          <Text style={[styles.switchModeText, { color: theme.textSecondary }]}>
            {mode === 'signin'
              ? 'Chưa có tài khoản? '
              : 'Đã có tài khoản sinh viên? '}
            <Text style={{ color: theme.primary, fontWeight: '700' }}>
              {mode === 'signin' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </Text>
          </Text>
        </Pressable>

        {/* Ghi chú điều kiện */}
        <View style={styles.conditionNote}>
          <Text style={[styles.conditionTitle, { color: theme.textPrimary }]}>
            📋 Quy định tài khoản Study Planner:
          </Text>
          <Text style={[styles.conditionText, { color: theme.textSecondary }]}>
            • Email bắt buộc phải có đuôi trường học (.edu hoặc .edu.vn)
          </Text>
          <Text style={[styles.conditionText, { color: theme.textSecondary }]}>
            • Nhập sai mật khẩu hệ thống sẽ báo lỗi và chặn truy cập
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  emoji: {
    fontSize: 56,
  },
  appName: {
    ...typography.h1,
  },
  tagline: {
    ...typography.caption,
    textAlign: 'center',
  },
  tabSwitchContainer: {
    flexDirection: 'row',
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tabSwitchButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  tabSwitchText: {
    ...typography.caption,
  },
  form: {
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.captionBold,
  },
  eduTag: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  input: {
    ...typography.body,
    height: minTouchSize,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  errorBox: {
    padding: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  errorText: {
    ...typography.captionBold,
    lineHeight: 18,
  },
  successBox: {
    padding: spacing.md,
    borderRadius: radii.sm,
  },
  successText: {
    ...typography.captionBold,
  },
  primaryButton: {
    height: minTouchSize + 6,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  primaryButtonText: {
    ...typography.bodyBold,
  },
  quickSignInButton: {
    height: minTouchSize,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickSignInText: {
    ...typography.captionBold,
    fontSize: 12,
  },
  switchModeFooter: {
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  switchModeText: {
    ...typography.caption,
  },
  conditionNote: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radii.md,
    gap: 4,
    opacity: 0.85,
  },
  conditionTitle: {
    ...typography.captionBold,
    fontSize: 12,
  },
  conditionText: {
    ...typography.small,
    lineHeight: 16,
  },
});
