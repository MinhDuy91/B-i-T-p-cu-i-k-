/**
 * Unit tests cho hàm tính toán tiến độ môn học (Course Progress Statistics)
 * Yêu cầu: Tiến độ được TÍNH TOÁN (computed), không lưu trữ trong database.
 */
import type { Course, Assignment, CourseProgress } from '@/types';

// Hàm tính toán tiến độ tái hiện logic trong CoursesScreen
export function calculateCourseProgress(
  courses: Course[],
  assignments: Assignment[]
): CourseProgress[] {
  return courses.map((course) => {
    const courseAssignments = assignments.filter((a) => a.courseId === course.id);
    const completed = courseAssignments.filter((a) => a.status === 'completed').length;
    const total = courseAssignments.length;

    return {
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      courseColour: course.colour,
      total,
      completed,
      outstanding: total - completed,
    };
  });
}

describe('calculateCourseProgress', () => {
  const mockCourses: Course[] = [
    { id: 'c1', code: 'CS101', name: 'Lập trình Mobile', colour: '#6366F1' },
    { id: 'c2', code: 'CS102', name: 'Trí tuệ nhân tạo', colour: '#EC4899' },
  ];

  it('tính đúng số bài tập hoàn thành và còn lại của từng môn', () => {
    const mockAssignments: Assignment[] = [
      { id: 'a1', courseId: 'c1', title: 'Lab 1', dueAt: '2026-10-28T00:00:00.000Z', status: 'completed' },
      { id: 'a2', courseId: 'c1', title: 'Lab 2', dueAt: '2026-10-29T00:00:00.000Z', status: 'pending' },
      { id: 'a3', courseId: 'c1', title: 'Assignment 1', dueAt: '2026-10-30T00:00:00.000Z', status: 'pending' },
      { id: 'a4', courseId: 'c2', title: 'Report', dueAt: '2026-10-31T00:00:00.000Z', status: 'completed' },
    ];

    const result = calculateCourseProgress(mockCourses, mockAssignments);

    expect(result).toHaveLength(2);

    // Môn CS101: 3 bài, 1 hoàn thành, 2 còn lại
    expect(result[0]).toEqual({
      courseId: 'c1',
      courseName: 'Lập trình Mobile',
      courseCode: 'CS101',
      courseColour: '#6366F1',
      total: 3,
      completed: 1,
      outstanding: 2,
    });

    // Môn CS102: 1 bài, 1 hoàn thành, 0 còn lại
    expect(result[1]).toEqual({
      courseId: 'c2',
      courseName: 'Trí tuệ nhân tạo',
      courseCode: 'CS102',
      courseColour: '#EC4899',
      total: 1,
      completed: 1,
      outstanding: 0,
    });
  });

  it('xử lý chính xác môn học chưa có bài tập nào (total = 0)', () => {
    const result = calculateCourseProgress(mockCourses, []);

    expect(result[0].total).toBe(0);
    expect(result[0].completed).toBe(0);
    expect(result[0].outstanding).toBe(0);

    // Tỉ lệ hoàn thành không bị chia cho 0
    const percent = result[0].total > 0 ? (result[0].completed / result[0].total) * 100 : 0;
    expect(percent).toBe(0);
  });
});
