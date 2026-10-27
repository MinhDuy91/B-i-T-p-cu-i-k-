/**
 * Tiện ích xử lý ngày giờ — Study Planner
 * Sử dụng date-fns để đảm bảo timezone chính xác.
 * "Ngày mai" phải đúng dù kiểm tra lúc 23:30 hay 08:00.
 */
import {
  format,
  isToday,
  isTomorrow,
  isPast,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  differenceInHours,
  differenceInDays,
  parseISO,
  isValid,
} from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Parse chuỗi ISO thành Date an toàn.
 * Luôn dùng hàm này thay vì new Date() trực tiếp.
 */
export function parseDate(isoString: string): Date {
  const date = parseISO(isoString);
  if (!isValid(date)) {
    throw new Error(`Ngày không hợp lệ: ${isoString}`);
  }
  return date;
}

/**
 * Định dạng ngày theo kiểu Việt Nam.
 * Ví dụ: "Thứ 2, 28/10/2026"
 */
export function formatDateVN(isoString: string): string {
  const date = parseDate(isoString);
  return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
}

/**
 * Định dạng ngày ngắn gọn.
 * Ví dụ: "28/10"
 */
export function formatDateShort(isoString: string): string {
  const date = parseDate(isoString);
  return format(date, 'dd/MM', { locale: vi });
}

/**
 * Định dạng giờ.
 * Ví dụ: "23:59"
 */
export function formatTime(isoString: string): string {
  const date = parseDate(isoString);
  return format(date, 'HH:mm');
}

/**
 * Định dạng đầy đủ ngày + giờ.
 * Ví dụ: "28/10/2026 23:59"
 */
export function formatDateTime(isoString: string): string {
  const date = parseDate(isoString);
  return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
}

/**
 * Nhãn deadline thân thiện.
 * - "Hôm nay, 23:59"
 * - "Ngày mai, 08:00"
 * - "Đã quá hạn 2 ngày"
 * - "Còn 3 ngày"
 */
export function getDeadlineLabel(isoString: string): string {
  const date = parseDate(isoString);
  const now = new Date();
  const time = format(date, 'HH:mm');

  if (isPast(date)) {
    const daysLate = differenceInDays(now, date);
    if (daysLate === 0) {
      const hoursLate = differenceInHours(now, date);
      return `Quá hạn ${hoursLate} giờ trước`;
    }
    return `Đã quá hạn ${daysLate} ngày`;
  }

  if (isToday(date)) {
    return `Hôm nay, ${time}`;
  }

  if (isTomorrow(date)) {
    return `Ngày mai, ${time}`;
  }

  const daysLeft = differenceInDays(date, now);
  if (daysLeft <= 7) {
    return `Còn ${daysLeft} ngày`;
  }

  return formatDateVN(isoString);
}

/**
 * Kiểm tra deadline có sắp đến không (trong vòng 48 giờ tới).
 */
export function isDueSoon(isoString: string): boolean {
  const date = parseDate(isoString);
  const now = new Date();
  const hoursLeft = differenceInHours(date, now);
  return hoursLeft >= 0 && hoursLeft <= 48;
}

/**
 * Kiểm tra đã quá hạn chưa.
 */
export function isOverdue(isoString: string): boolean {
  const date = parseDate(isoString);
  return isPast(date);
}

/**
 * Lấy danh sách 7 ngày trong tuần chứa ngày đã cho.
 * Tuần bắt đầu từ thứ Hai (theo chuẩn Việt Nam).
 */
export function getWeekDays(dateString: string): string[] {
  const date = parseDate(dateString);
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Thứ 2

  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    return day.toISOString();
  });
}

/**
 * Lấy tên viết tắt ngày trong tuần.
 */
export function getDayName(isoString: string): string {
  const date = parseDate(isoString);
  return format(date, 'EEE', { locale: vi });
}

/**
 * Lấy số ngày trong tháng.
 */
export function getDayNumber(isoString: string): string {
  const date = parseDate(isoString);
  return format(date, 'd');
}

/**
 * Kiểm tra 2 ngày có cùng ngày không (bỏ qua giờ).
 */
export function isSameDay(date1: string, date2: string): boolean {
  const d1 = startOfDay(parseDate(date1));
  const d2 = startOfDay(parseDate(date2));
  return d1.getTime() === d2.getTime();
}

/**
 * Kiểm tra ngày có nằm trong khoảng (từ - đến) không.
 */
export function isDateInRange(
  dateStr: string,
  startStr: string,
  endStr: string
): boolean {
  const date = parseDate(dateStr);
  const start = startOfDay(parseDate(startStr));
  const end = endOfDay(parseDate(endStr));
  return (isAfter(date, start) || date.getTime() === start.getTime()) &&
         (isBefore(date, end) || date.getTime() === end.getTime());
}

/**
 * Tạo ISO string cho ngày hôm nay.
 */
export function todayISO(): string {
  return new Date().toISOString();
}
