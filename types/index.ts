/**
 * Định nghĩa kiểu dữ liệu toàn cục — Study Planner
 */

// ─── Người dùng ──────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
}

// ─── Môn học ─────────────────────────────────────────────────
export interface Course {
  id: string;
  code: string;
  name: string;
  colour: string; // index tham chiếu đến courseColors trong tokens
}

// ─── Bài tập & Lịch học ─────────────────────────────────────
export type AssignmentStatus = 'pending' | 'completed';
export type AssignmentType = 'assignment' | 'schedule';

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueAt: string; // ISO 8601 string
  status: AssignmentStatus;
  type?: AssignmentType; // 'assignment' (Bài tập) | 'schedule' (Lịch học)
  notes?: string;
  photoUri?: string;
}

// ─── Tham số tạo / cập nhật ─────────────────────────────────
export type CreateCourseInput = Omit<Course, 'id'>;
export type UpdateCourseInput = Partial<CreateCourseInput>;

export type CreateAssignmentInput = Omit<Assignment, 'id'>;
export type UpdateAssignmentInput = Partial<CreateAssignmentInput>;

// ─── Bộ lọc ─────────────────────────────────────────────────
export type FilterStatus = 'all' | 'pending' | 'completed';

export interface AssignmentFilters {
  courseId?: string;
  status: FilterStatus;
}

// ─── Thống kê tiến độ ────────────────────────────────────────
export interface CourseProgress {
  courseId: string;
  courseName: string;
  courseCode: string;
  courseColour: string;
  total: number;
  completed: number;
  outstanding: number;
}

// ─── Phản hồi API ────────────────────────────────────────────
export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
