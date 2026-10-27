/**
 * TanStack Query hooks cho Assignments & Lịch học.
 * Hỗ trợ optimistic updates khi đánh dấu hoàn thành và cách ly cache theo userId.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAssignments,
  fetchAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '@/api/client';
import type {
  Assignment,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from '@/types';
import { useAuthStore } from '@/store/authStore';

export const assignmentKeys = {
  all: (userId?: string) => ['assignments', userId ?? 'current'] as const,
  detail: (id: string, userId?: string) => ['assignments', id, userId ?? 'current'] as const,
};

/** Lấy tất cả bài tập & lịch học của user hiện tại */
export function useAssignments() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: assignmentKeys.all(userId),
    queryFn: () => fetchAssignments(userId),
    staleTime: 2 * 60 * 1000, // 2 phút
  });
}

/** Lấy chi tiết một bài tập / lịch học */
export function useAssignment(id: string) {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: assignmentKeys.detail(id, userId),
    queryFn: () => fetchAssignmentById(id, userId),
    enabled: !!id,
  });
}

/** Thêm bài tập / lịch học mới */
export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (input: CreateAssignmentInput) => createAssignment(input, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.all(userId) });
    },
  });
}

/** Cập nhật bài tập / lịch học — có optimistic update */
export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAssignmentInput }) =>
      updateAssignment(id, input, userId),

    // Optimistic update: cập nhật UI trước khi server phản hồi
    onMutate: async ({ id, input }) => {
      // Hủy các query đang chạy
      await queryClient.cancelQueries({ queryKey: assignmentKeys.all(userId) });

      // Lưu snapshot để rollback nếu thất bại
      const previousAssignments = queryClient.getQueryData<Assignment[]>(
        assignmentKeys.all(userId)
      );

      // Cập nhật cache ngay lập tức
      queryClient.setQueryData<Assignment[]>(assignmentKeys.all(userId), (old) =>
        old?.map((a) => (a.id === id ? { ...a, ...input } : a)) ?? []
      );

      return { previousAssignments };
    },

    // Rollback nếu server trả lỗi
    onError: (_err, _variables, context) => {
      if (context?.previousAssignments) {
        queryClient.setQueryData(assignmentKeys.all(userId), context.previousAssignments);
      }
    },

    // Đồng bộ lại dữ liệu từ server
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.all(userId) });
    },
  });
}

/** Xóa bài tập / lịch học */
export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (id: string) => deleteAssignment(id, userId),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.all(userId) });
      queryClient.removeQueries({ queryKey: assignmentKeys.detail(id, userId) });
    },
  });
}
