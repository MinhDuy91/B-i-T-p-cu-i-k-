/**
 * TanStack Query hooks cho Courses.
 * Quản lý cache, refetch, và optimistic updates phân tách theo userId.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCourses,
  fetchCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '@/api/client';
import type { CreateCourseInput, UpdateCourseInput, Course } from '@/types';
import { useAuthStore } from '@/store/authStore';

export const courseKeys = {
  all: (userId?: string) => ['courses', userId ?? 'current'] as const,
  detail: (id: string, userId?: string) => ['courses', id, userId ?? 'current'] as const,
};

/** Lấy danh sách tất cả môn học */
export function useCourses() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: courseKeys.all(userId),
    queryFn: () => fetchCourses(userId),
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}

/** Lấy chi tiết một môn học */
export function useCourse(id: string) {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: courseKeys.detail(id, userId),
    queryFn: () => fetchCourseById(id, userId),
    enabled: !!id,
  });
}

/** Thêm môn học mới */
export function useCreateCourse() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (input: CreateCourseInput) => createCourse(input, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all(userId) });
    },
  });
}

/** Cập nhật môn học */
export function useUpdateCourse() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCourseInput }) =>
      updateCourse(id, input, userId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all(userId) });
      void queryClient.invalidateQueries({
        queryKey: courseKeys.detail(variables.id, userId),
      });
    },
  });
}

/** Xóa môn học */
export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (id: string) => deleteCourse(id, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all(userId) });
    },
  });
}
