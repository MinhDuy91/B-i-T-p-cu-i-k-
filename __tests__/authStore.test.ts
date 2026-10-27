/**
 * Unit tests cho Zustand authStore (store/authStore.ts)
 */
import { useAuthStore, isEduEmail } from '@/store/authStore';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    __store: store,
  };
});

describe('useAuthStore & isEduEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  });

  describe('isEduEmail', () => {
    it('chấp nhận email đuôi .edu.vn, .edu và @gmail.com', () => {
      expect(isEduEmail('sinhvien@hutech.edu.vn')).toBe(true);
      expect(isEduEmail('student@mit.edu')).toBe(true);
      expect(isEduEmail('nguyenvana@gmail.com')).toBe(true);
      expect(isEduEmail('duy.cntt@student.edu.vn')).toBe(true);
    });

    it('từ chối email không hợp lệ hoặc không có đuôi edu/gmail', () => {
      expect(isEduEmail('test@yahoo.com')).toBe(false);
      expect(isEduEmail('user@hotmail.com')).toBe(false);
      expect(isEduEmail('invalid-email')).toBe(false);
      expect(isEduEmail('')).toBe(false);
    });
  });

  describe('signIn', () => {
    it('đăng nhập thành công và lưu token vào SecureStore', async () => {
      await useAuthStore.getState().signIn('sinhvien@hutech.edu.vn', '123456');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).not.toBeNull();
      expect(state.user?.email).toBe('sinhvien@hutech.edu.vn');
      expect(state.token).toBeTruthy();

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', expect.any(String));
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_user', expect.any(String));
    });

    it('báo lỗi khi nhập sai mật khẩu', async () => {
      await expect(
        useAuthStore.getState().signIn('sinhvien@hutech.edu.vn', 'sai_mat_khau')
      ).rejects.toThrow('Mật khẩu không chính xác! Vui lòng kiểm tra lại mật khẩu.');

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('từ chối đăng nhập với email không có đuôi edu hoặc gmail', async () => {
      await expect(
        useAuthStore.getState().signIn('user@yahoo.com', '123456')
      ).rejects.toThrow('Email không hợp lệ!');
    });
  });

  describe('signUp', () => {
    it('đăng ký tài khoản mới thành công và tự động đăng nhập', async () => {
      const uniqueEmail = `test_${Date.now()}@student.edu.vn`;
      await useAuthStore.getState().signUp('Nguyễn Sinh Viên Mới', uniqueEmail, 'password123');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.name).toBe('Nguyễn Sinh Viên Mới');
      expect(state.user?.email).toBe(uniqueEmail);
    });

    it('từ chối đăng ký nếu mật khẩu ngắn hơn 6 ký tự', async () => {
      await expect(
        useAuthStore.getState().signUp('Tên Test', 'test@student.edu.vn', '123')
      ).rejects.toThrow('Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên.');
    });
  });

  describe('signOut & restoreSession', () => {
    it('đăng xuất xóa toàn bộ session khỏi store và SecureStore', async () => {
      // Đăng nhập trước
      await useAuthStore.getState().signIn('sinhvien@hutech.edu.vn', '123456');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Đăng xuất
      await useAuthStore.getState().signOut();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_user');
    });

    it('luôn bắt đầu ở trạng thái chưa đăng nhập khi restoreSession', async () => {
      await useAuthStore.getState().restoreSession();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
    });
  });
});
