/**
 * api/queryClient.ts — Singleton QueryClient cho TanStack Query.
 * Được dùng trên toàn ứng dụng để quản lý cache và xóa cache khi đăng xuất/đăng nhập tài khoản khác.
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 2 * 60 * 1000, // 2 phút
    },
  },
});
