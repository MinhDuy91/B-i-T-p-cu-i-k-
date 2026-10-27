/**
 * authStore — Zustand store quản lý xác thực người dùng.
 * - Hỗ trợ cả Đăng nhập (Sign In) và Đăng ký (Sign Up)
 * - Ràng buộc: Email bắt buộc phải có đuôi .edu hoặc .edu.vn
 * - Kiểm tra mật khẩu đúng/sai với thông báo lỗi chi tiết
 * - Session lưu trong SecureStore (Mobile) hoặc localStorage (Web)
 */
import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@/types';
import { queryClient } from '@/api/queryClient';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const USERS_LIST_KEY = 'registered_users_database';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
}

// Danh sách tài khoản mẫu mặc định
export const DEFAULT_USERS: UserAccount[] = [
  {
    id: '1',
    name: 'Sinh viên (Nhóm 1923050269)',
    email: 'sinhvien@hutech.edu.vn',
    password: '123456',
  },
  {
    id: '2',
    name: 'Nguyễn Minh Duy',
    email: 'minhduy@student.edu.vn',
    password: '123456',
  },
  {
    id: '3',
    name: 'Nguyễn Văn Hiếu',
    email: 'hieu@student.edu.vn',
    password: '123456',
  },
];

/**
 * Kiểm tra định dạng email sinh viên / giáo dục (đuôi .edu, .edu.vn hoặc @gmail.com)
 */
export function isEduEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes('@')) return false;

  const isEdu =
    normalized.endsWith('.edu.vn') ||
    normalized.endsWith('.edu') ||
    normalized.includes('.edu.') ||
    normalized.includes('@edu.');
  const isGmail = normalized.endsWith('@gmail.com');

  return isEdu || isGmail;
}

// Lưu trữ an toàn tương thích đa nền tảng
export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch {}
      return null;
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch {}
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch {}
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

/**
 * Lấy danh sách toàn bộ tài khoản (bao gồm cả tài khoản người dùng tự đăng ký)
 */
export async function getRegisteredUsers(): Promise<UserAccount[]> {
  try {
    const json = await storage.getItem(USERS_LIST_KEY);
    if (!json) return [...DEFAULT_USERS];
    const stored = JSON.parse(json) as UserAccount[];
    // Hợp nhất tránh trùng lặp email
    const merged = [...DEFAULT_USERS];
    for (const u of stored) {
      if (!merged.some((m) => m.email.toLowerCase() === u.email.toLowerCase())) {
        merged.push(u);
      }
    }
    return merged;
  } catch {
    return [...DEFAULT_USERS];
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Hành động
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  /**
   * ĐĂNG NHẬP (Sign In)
   * - Bắt buộc email có đuôi edu / edu.vn
   * - Kiểm tra mật khẩu đúng/sai
   */
  signIn: async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Kiểm tra đuôi email edu / gmail
    if (!isEduEmail(normalizedEmail)) {
      throw new Error(
        'Email không hợp lệ! Bắt buộc phải sử dụng email sinh viên có đuôi .edu / .edu.vn hoặc @gmail.com.'
      );
    }

    if (!password) {
      throw new Error('Vui lòng nhập mật khẩu.');
    }

    // 2. Tìm tài khoản trong cơ sở dữ liệu
    const users = await getRegisteredUsers();
    const account = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!account) {
      throw new Error(
        'Tài khoản này chưa tồn tại trong hệ thống! Vui lòng chuyển sang tab Đăng ký để tạo tài khoản mới.'
      );
    }

    // 3. Kiểm tra mật khẩu
    if (account.password !== password) {
      throw new Error('Mật khẩu không chính xác! Vui lòng kiểm tra lại mật khẩu.');
    }

    // Đăng nhập thành công
    const loggedInUser: User = {
      id: account.id,
      name: account.name,
      email: account.email,
    };
    const mockToken = `token_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    await storage.setItem(TOKEN_KEY, mockToken);
    await storage.setItem(USER_KEY, JSON.stringify(loggedInUser));

    // Xóa sạch cache queries cũ để dữ liệu người dùng trước không bị rò rỉ
    queryClient.clear();

    set({
      user: loggedInUser,
      token: mockToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  /**
   * ĐĂNG KÝ (Sign Up)
   * - Nhập tên, email đuôi edu / gmail, mật khẩu
   * - Kiểm tra tính hợp lệ và trùng lặp
   * - Lưu vào storage và tự động đăng nhập
   */
  signUp: async (name: string, email: string, password: string) => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Kiểm tra họ tên
    if (!trimmedName || trimmedName.length < 2) {
      throw new Error('Vui lòng nhập đầy đủ họ và tên sinh viên.');
    }

    // 2. Kiểm tra đuôi email edu / gmail
    if (!isEduEmail(normalizedEmail)) {
      throw new Error(
        'Email đăng ký không hợp lệ! Bắt buộc phải có đuôi .edu / .edu.vn hoặc @gmail.com (Ví dụ: ten@student.edu.vn hoặc ten@gmail.com).'
      );
    }

    // 3. Kiểm tra độ dài mật khẩu
    if (!password || password.length < 6) {
      throw new Error('Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên.');
    }

    // 4. Kiểm tra tài khoản đã tồn tại chưa
    const users = await getRegisteredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error(
        'Email này đã được đăng ký tài khoản! Vui lòng chuyển sang tab Đăng nhập để vào app.'
      );
    }

    // 5. Thêm tài khoản mới và lưu vào storage
    const newAccount: UserAccount = {
      id: String(Date.now()),
      name: trimmedName,
      email: normalizedEmail,
      password,
    };
    users.push(newAccount);
    await storage.setItem(USERS_LIST_KEY, JSON.stringify(users));

    // 6. Đăng nhập trực tiếp với tài khoản mới tạo
    const newUser: User = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
    };
    const mockToken = `token_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    await storage.setItem(TOKEN_KEY, mockToken);
    await storage.setItem(USER_KEY, JSON.stringify(newUser));

    // Xóa sạch cache queries cũ
    queryClient.clear();

    set({
      user: newUser,
      token: mockToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  /**
   * Đăng xuất — xóa hoàn toàn session khỏi storage và xóa cache query.
   */
  signOut: async () => {
    try {
      await storage.deleteItem(TOKEN_KEY);
      await storage.deleteItem(USER_KEY);
    } catch (error) {
      console.error('Lỗi khi xóa session:', error);
    }

    // Xóa sạch dữ liệu query cache trong bộ nhớ
    queryClient.clear();

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  /**
   * Khởi động app — luôn yêu cầu đăng nhập trước khi vào app.
   */
  restoreSession: async () => {
    try {
      await storage.deleteItem(TOKEN_KEY);
      await storage.deleteItem(USER_KEY);
    } catch {}

    queryClient.clear();

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));

// ─── Selectors ───────────────────────────────────────────────
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
