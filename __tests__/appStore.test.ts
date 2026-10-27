/**
 * Unit tests cho Zustand appStore (store/appStore.ts)
 */
import { useAppStore } from '@/store/appStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset state trước mỗi test case
    useAppStore.setState({
      filters: { courseId: undefined, status: 'all' },
      viewMode: 'weekly',
      selectedDate: '2026-10-28',
      themePreference: 'system',
      isOffline: false,
      lastSyncAt: null,
    });
  });

  it('khởi tạo với các giá trị mặc định chính xác', () => {
    const state = useAppStore.getState();
    expect(state.viewMode).toBe('weekly');
    expect(state.filters.status).toBe('all');
    expect(state.themePreference).toBe('system');
    expect(state.isOffline).toBe(false);
  });

  it('cập nhật bộ lọc bài tập (setFilters)', () => {
    useAppStore.getState().setFilters({ status: 'pending', courseId: 'course_123' });
    const state = useAppStore.getState();
    expect(state.filters.status).toBe('pending');
    expect(state.filters.courseId).toBe('course_123');
  });

  it('reset bộ lọc về mặc định (resetFilters)', () => {
    useAppStore.getState().setFilters({ status: 'completed' });
    expect(useAppStore.getState().filters.status).toBe('completed');

    useAppStore.getState().resetFilters();
    expect(useAppStore.getState().filters.status).toBe('all');
    expect(useAppStore.getState().filters.courseId).toBeUndefined();
  });

  it('chuyển đổi chế độ xem lịch (setViewMode)', () => {
    useAppStore.getState().setViewMode('list');
    expect(useAppStore.getState().viewMode).toBe('list');

    useAppStore.getState().setViewMode('weekly');
    expect(useAppStore.getState().viewMode).toBe('weekly');
  });

  it('cập nhật tùy chọn giao diện (setThemePreference)', () => {
    useAppStore.getState().setThemePreference('dark');
    expect(useAppStore.getState().themePreference).toBe('dark');

    useAppStore.getState().setThemePreference('light');
    expect(useAppStore.getState().themePreference).toBe('light');
  });

  it('cập nhật trạng thái ngoại tuyến và thời gian đồng bộ', () => {
    useAppStore.getState().setIsOffline(true);
    expect(useAppStore.getState().isOffline).toBe(true);

    const timestamp = '2026-10-28T10:30:00.000Z';
    useAppStore.getState().setLastSyncAt(timestamp);
    expect(useAppStore.getState().lastSyncAt).toBe(timestamp);
  });
});
