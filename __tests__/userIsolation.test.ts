/**
 * Unit tests kiểm tra tính phân tách dữ liệu đa người dùng (User Data Isolation)
 * - Tài khoản A đăng nhập, thêm Lịch học mới.
 * - Đăng xuất khỏi tài khoản A.
 * - Tài khoản B đăng nhập vào: đảm bảo KHÔNG thấy dữ liệu Lịch học của tài khoản A.
 * - Tài khoản A đăng nhập lại: dữ liệu Lịch học của A vẫn được bảo toàn.
 */
import { useAuthStore } from '@/store/authStore';
import {
  fetchAssignments,
  createAssignment,
  clearUserCacheInMemory,
} from '@/api/client';
import { appStorage } from '@/utils/storage';
import { queryClient } from '@/api/queryClient';

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

describe('User Data Isolation (Phân tách dữ liệu giữa Tài khoản A và B)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    clearUserCacheInMemory();
    await appStorage.clear();
    queryClient.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  });

  it('đảm bảo Tài khoản B không thấy lịch học do Tài khoản A vừa thêm vào', async () => {
    // 1. Tài khoản A đăng nhập
    await useAuthStore.getState().signIn('sinhvien@hutech.edu.vn', '123456');
    const userA = useAuthStore.getState().user;
    expect(userA).not.toBeNull();
    expect(userA?.email).toBe('sinhvien@hutech.edu.vn');
    const userAId = userA!.id;

    // 2. Tài khoản A lấy danh sách ban đầu
    const initialListA = await fetchAssignments(userAId);
    const initialCountA = initialListA.length;

    // 3. Tài khoản A thêm một Lịch học mới
    const newScheduleTitle = 'Lịch học Thực hành Chuyên đề Mobile (Phòng A1-203)';
    const createdByA = await createAssignment(
      {
        courseId: '1',
        title: newScheduleTitle,
        dueAt: '2026-11-01T08:00:00.000Z',
        status: 'pending',
        type: 'schedule',
        notes: 'Tiết 1-3 sáng thứ 2',
      },
      userAId
    );

    expect(createdByA.id).toBeTruthy();
    expect(createdByA.title).toBe(newScheduleTitle);
    expect(createdByA.type).toBe('schedule');

    // Kiểm tra danh sách của A đã có Lịch học mới
    const updatedListA = await fetchAssignments(userAId);
    expect(updatedListA.length).toBe(initialCountA + 1);
    expect(updatedListA.some((item) => item.title === newScheduleTitle)).toBe(true);

    // 4. Tài khoản A đăng xuất
    await useAuthStore.getState().signOut();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();

    // 5. Tài khoản B đăng nhập vào
    await useAuthStore.getState().signIn('minhduy@student.edu.vn', '123456');
    const userB = useAuthStore.getState().user;
    expect(userB).not.toBeNull();
    expect(userB?.email).toBe('minhduy@student.edu.vn');
    const userBId = userB!.id;
    expect(userBId).not.toBe(userAId);

    // 6. Tài khoản B lấy danh sách Lịch học / Bài tập
    const listB = await fetchAssignments(userBId);

    // ĐẢM BẢO: Tài khoản B KHÔNG có Lịch học của Tài khoản A vừa thêm
    const hasUserADataInB = listB.some((item) => item.title === newScheduleTitle);
    expect(hasUserADataInB).toBe(false);
    expect(listB.length).toBe(initialCountA); // Giữ nguyên số lượng gốc của B

    // 7. Tài khoản B đăng xuất và Tài khoản A đăng nhập lại
    await useAuthStore.getState().signOut();
    await useAuthStore.getState().signIn('sinhvien@hutech.edu.vn', '123456');

    // 8. Dữ liệu của Tài khoản A vẫn được bảo toàn
    const reloadedListA = await fetchAssignments(userAId);
    expect(reloadedListA.some((item) => item.title === newScheduleTitle)).toBe(true);
    expect(reloadedListA.length).toBe(initialCountA + 1);
  });
});
