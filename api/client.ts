/**
 * API Client — Wrapper cho fetch với xử lý lỗi, token và phân tách dữ liệu đa người dùng.
 * - Mỗi tài khoản (User A, User B,...) sở hữu bộ dữ liệu Lịch học & Bài tập độc lập (User Data Isolation).
 * - Dữ liệu được lưu trữ phân tách theo userId vào AsyncStorage/localStorage và đồng bộ vào bộ nhớ.
 * - Khi tài khoản A thêm lịch học, tài khoản B đăng nhập vào sẽ hoàn toàn không thấy dữ liệu của A.
 */
import type {
  Course,
  Assignment,
  CreateCourseInput,
  UpdateCourseInput,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from '@/types';
import { courseColors } from '@/constants/tokens';
import { appStorage } from '@/utils/storage';
import { useAuthStore } from '@/store/authStore';

// ─── Dữ liệu mẫu môn học mặc định ─────────────────────────────
export const DEFAULT_COURSES: Course[] = [
  { id: '1', code: 'TH7011101', name: 'Lập trình Mobile', colour: courseColors[0] },
  { id: '2', code: 'TH7021102', name: 'Trí tuệ nhân tạo', colour: courseColors[1] },
  { id: '3', code: 'TH7031103', name: 'An toàn thông tin', colour: courseColors[2] },
  { id: '4', code: 'TH7041104', name: 'Phát triển Web', colour: courseColors[3] },
  { id: '5', code: 'TH7051105', name: 'Cơ sở dữ liệu nâng cao', colour: courseColors[4] },
];

const now = new Date();
const makeDate = (daysOffset: number, hours: number = 23, minutes: number = 59): string => {
  const d = new Date(now);
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const DEFAULT_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    courseId: '1',
    title: 'Bài tập Expo Router & Navigation',
    dueAt: makeDate(1, 23, 59),
    status: 'pending',
    type: 'assignment',
    notes: 'Hoàn thành navigation giữa 5 màn hình, sử dụng dynamic route và modal.',
  },
  {
    id: '2',
    courseId: '1',
    title: 'Đồ án cuối kỳ - Study Planner',
    dueAt: makeDate(3, 23, 59),
    status: 'pending',
    type: 'assignment',
    notes: 'Nộp source code + video demo + AI_LOG.md',
  },
  {
    id: '3',
    courseId: '2',
    title: 'Báo cáo thuật toán tìm kiếm A*',
    dueAt: makeDate(0, 17, 0),
    status: 'pending',
    type: 'assignment',
    notes: 'Viết báo cáo kèm code minh hoạ bằng Python',
  },
  {
    id: '4',
    courseId: '2',
    title: 'Bài tập mạng neural nhân tạo',
    dueAt: makeDate(-1, 23, 59),
    status: 'completed',
    type: 'assignment',
  },
  {
    id: '5',
    courseId: '3',
    title: 'Lab: Mã hóa RSA',
    dueAt: makeDate(2, 14, 0),
    status: 'pending',
    type: 'assignment',
    notes: 'Cài đặt thuật toán RSA, chạy demo encrypt/decrypt.',
  },
  {
    id: '6',
    courseId: '3',
    title: 'Quiz: Giao thức SSL/TLS',
    dueAt: makeDate(-3, 10, 0),
    status: 'completed',
    type: 'assignment',
  },
  {
    id: '7',
    courseId: '4',
    title: 'Dự án React - Trang Portfolio',
    dueAt: makeDate(5, 23, 59),
    status: 'pending',
    type: 'assignment',
    notes: 'Tạo trang portfolio cá nhân responsive với React + Tailwind CSS',
  },
  {
    id: '8',
    courseId: '4',
    title: 'Bài tập REST API với Node.js',
    dueAt: makeDate(-2, 23, 59),
    status: 'completed',
    type: 'assignment',
  },
  {
    id: '9',
    courseId: '5',
    title: 'Thiết kế lược đồ CSDL bệnh viện',
    dueAt: makeDate(4, 23, 59),
    status: 'pending',
    type: 'assignment',
  },
  {
    id: '10',
    courseId: '5',
    title: 'Lab: Tối ưu truy vấn SQL',
    dueAt: makeDate(0, 20, 0),
    status: 'pending',
    type: 'assignment',
    notes: 'Sử dụng EXPLAIN ANALYZE để phân tích và cải thiện truy vấn.',
  },
];

// ─── Giả lập độ trễ mạng ────────────────────────────────────
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const NETWORK_DELAY = 150; // ms

const generateId = (): string => {
  return `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
};

/** Lấy UserId hiện tại từ tham số truyền vào hoặc từ authStore */
export function getActiveUserId(userId?: string): string {
  if (userId) return userId;
  try {
    const user = useAuthStore.getState().user;
    if (user?.id) return user.id;
  } catch {}
  return 'default_user';
}

// Bộ nhớ cache nhanh trong RAM theo userId
const userCoursesCache = new Map<string, Course[]>();
const userAssignmentsCache = new Map<string, Assignment[]>();

const STORAGE_KEY_COURSES = '@study_planner_courses_';
const STORAGE_KEY_ASSIGNMENTS = '@study_planner_assignments_';

// ─── API Courses ─────────────────────────────────────────────
export async function fetchCourses(userId?: string): Promise<Course[]> {
  await delay(NETWORK_DELAY);
  const uid = getActiveUserId(userId);

  if (userCoursesCache.has(uid)) {
    return [...userCoursesCache.get(uid)!];
  }

  try {
    const raw = await appStorage.getItem(`${STORAGE_KEY_COURSES}${uid}`);
    if (raw) {
      const parsed = JSON.parse(raw) as Course[];
      userCoursesCache.set(uid, parsed);
      return [...parsed];
    }
  } catch {}

  // Khởi tạo danh sách môn học mới cho user này
  const initial = DEFAULT_COURSES.map((c) => ({ ...c }));
  userCoursesCache.set(uid, initial);
  await appStorage.setItem(`${STORAGE_KEY_COURSES}${uid}`, JSON.stringify(initial));
  return [...initial];
}

export async function fetchCourseById(id: string, userId?: string): Promise<Course> {
  const courses = await fetchCourses(userId);
  const course = courses.find((c) => c.id === id);
  if (!course) throw new Error('Không tìm thấy môn học');
  return { ...course };
}

export async function createCourse(input: CreateCourseInput, userId?: string): Promise<Course> {
  await delay(NETWORK_DELAY);
  const uid = getActiveUserId(userId);
  const courses = await fetchCourses(uid);

  const newCourse: Course = { ...input, id: generateId() };
  const updated = [...courses, newCourse];

  userCoursesCache.set(uid, updated);
  await appStorage.setItem(`${STORAGE_KEY_COURSES}${uid}`, JSON.stringify(updated));
  return { ...newCourse };
}

export async function updateCourse(
  id: string,
  input: UpdateCourseInput,
  userId?: string
): Promise<Course> {
  await delay(NETWORK_DELAY);
  const uid = getActiveUserId(userId);
  const courses = await fetchCourses(uid);

  const index = courses.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('Không tìm thấy môn học');

  courses[index] = { ...courses[index], ...input };
  userCoursesCache.set(uid, courses);
  await appStorage.setItem(`${STORAGE_KEY_COURSES}${uid}`, JSON.stringify(courses));
  return { ...courses[index] };
}

export async function deleteCourse(id: string, userId?: string): Promise<void> {
  await delay(NETWORK_DELAY);
  const uid = getActiveUserId(userId);
  const courses = await fetchCourses(uid);

  const filtered = courses.filter((c) => c.id !== id);
  userCoursesCache.set(uid, filtered);
  await appStorage.setItem(`${STORAGE_KEY_COURSES}${uid}`, JSON.stringify(filtered));

  // Xóa luôn các bài tập thuộc môn này của user
  const assignments = await fetchAssignments(uid);
  const updatedAssignments = assignments.filter((a) => a.courseId !== id);
  userAssignmentsCache.set(uid, updatedAssignments);
  await appStorage.setItem(`${STORAGE_KEY_ASSIGNMENTS}${uid}`, JSON.stringify(updatedAssignments));
}

// ─── API Assignments & Lịch học ───────────────────────────────
export async function fetchAssignments(userId?: string): Promise<Assignment[]> {
  await delay(NETWORK_DELAY);
  const uid = getActiveUserId(userId);

  if (userAssignmentsCache.has(uid)) {
    return [...userAssignmentsCache.get(uid)!];
  }

  try {
    const raw = await appStorage.getItem(`${STORAGE_KEY_ASSIGNMENTS}${uid}`);
    if (raw) {
      const parsed = JSON.parse(raw) as Assignment[];
      userAssignmentsCache.set(uid, parsed);
      return [...parsed];
    }
  } catch {}

  // Khởi tạo bản sao độc lập cho user này
  const initial = DEFAULT_ASSIGNMENTS.map((a) => ({ ...a }));
  userAssignmentsCache.set(uid, initial);
  await appStorage.setItem(`${STORAGE_KEY_ASSIGNMENTS}${uid}`, JSON.stringify(initial));
  return [...initial];
}

export async function fetchAssignmentById(id: string, userId?: string): Promise<Assignment> {
  const assignments = await fetchAssignments(userId);
  const assignment = assignments.find((a) => a.id === id);
  if (!assignment) throw new Error('Không tìm thấy bài tập / lịch học');
  return { ...assignment };
}

export async function createAssignment(
  input: CreateAssignmentInput,
  userId?: string
): Promise<Assignment> {
  await delay(NETWORK_DELAY);
  const uid = getActiveUserId(userId);
  const assignments = await fetchAssignments(uid);

  const newAssignment: Assignment = {
    ...input,
    id: generateId(),
    status: input.status ?? 'pending',
    type: input.type ?? 'assignment',
  };

  const updated = [newAssignment, ...assignments];
  userAssignmentsCache.set(uid, updated);
  await appStorage.setItem(`${STORAGE_KEY_ASSIGNMENTS}${uid}`, JSON.stringify(updated));

  return { ...newAssignment };
}

export async function updateAssignment(
  id: string,
  input: UpdateAssignmentInput,
  userId?: string
): Promise<Assignment> {
  await delay(NETWORK_DELAY);
  const uid = getActiveUserId(userId);
  const assignments = await fetchAssignments(uid);

  const index = assignments.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Không tìm thấy bài tập / lịch học');

  assignments[index] = { ...assignments[index], ...input };
  userAssignmentsCache.set(uid, assignments);
  await appStorage.setItem(`${STORAGE_KEY_ASSIGNMENTS}${uid}`, JSON.stringify(assignments));

  return { ...assignments[index] };
}

export async function deleteAssignment(id: string, userId?: string): Promise<void> {
  await delay(NETWORK_DELAY);
  const uid = getActiveUserId(userId);
  const assignments = await fetchAssignments(uid);

  const filtered = assignments.filter((a) => a.id !== id);
  userAssignmentsCache.set(uid, filtered);
  await appStorage.setItem(`${STORAGE_KEY_ASSIGNMENTS}${uid}`, JSON.stringify(filtered));
}

/**
 * Xóa trắng dữ liệu bộ nhớ tạm của một user (phục vụ test)
 */
export function clearUserCacheInMemory(userId?: string): void {
  if (userId) {
    userCoursesCache.delete(userId);
    userAssignmentsCache.delete(userId);
  } else {
    userCoursesCache.clear();
    userAssignmentsCache.clear();
  }
}
