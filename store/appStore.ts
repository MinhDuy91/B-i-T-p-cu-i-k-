/**
 * appStore — Zustand store quản lý trạng thái ứng dụng.
 * Bao gồm: bộ lọc, chế độ xem, trạng thái offline.
 */
import { create } from 'zustand';
import type { AssignmentFilters } from '@/types';

type ViewMode = 'weekly' | 'list';

interface AppState {
  // Bộ lọc bài tập
  filters: AssignmentFilters;
  setFilters: (filters: Partial<AssignmentFilters>) => void;
  resetFilters: () => void;

  // Chế độ xem lịch
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Ngày đang chọn
  selectedDate: string; // ISO date string (YYYY-MM-DD)
  setSelectedDate: (date: string) => void;

  // Giao diện (Theme)
  themePreference: 'light' | 'dark' | 'system';
  setThemePreference: (theme: 'light' | 'dark' | 'system') => void;

  // Trạng thái offline
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  lastSyncAt: string | null;
  setLastSyncAt: (date: string) => void;
}

const defaultFilters: AssignmentFilters = {
  courseId: undefined,
  status: 'all',
};

export const useAppStore = create<AppState>((set) => ({
  // Bộ lọc
  filters: defaultFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: defaultFilters }),

  // Chế độ xem
  viewMode: 'weekly',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Ngày chọn
  selectedDate: new Date().toISOString().split('T')[0] ?? new Date().toISOString(),
  setSelectedDate: (date) => set({ selectedDate: date }),

  // Theme
  themePreference: 'system',
  setThemePreference: (themePreference) => set({ themePreference }),

  // Offline
  isOffline: false,
  setIsOffline: (offline) => set({ isOffline: offline }),
  lastSyncAt: null,
  setLastSyncAt: (date) => set({ lastSyncAt: date }),
}));

// ─── Selectors ───────────────────────────────────────────────
export const selectFilters = (state: AppState) => state.filters;
export const selectViewMode = (state: AppState) => state.viewMode;
export const selectSelectedDate = (state: AppState) => state.selectedDate;
export const selectIsOffline = (state: AppState) => state.isOffline;
