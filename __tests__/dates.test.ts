/**
 * Unit tests cho module tiện ích ngày giờ (utils/dates.ts)
 */
import {
  parseDate,
  formatTime,
  isDueSoon,
  isOverdue,
  getWeekDays,
  isSameDay,
} from '@/utils/dates';

describe('dates utils', () => {
  describe('parseDate', () => {
    it('parse ngày ISO hợp lệ thành Date object', () => {
      const date = parseDate('2026-10-28T14:30:00.000Z');
      expect(date).toBeInstanceOf(Date);
      expect(date.getUTCFullYear()).toBe(2026);
      expect(date.getUTCMonth()).toBe(9); // 0-indexed, tháng 10
      expect(date.getUTCDate()).toBe(28);
    });

    it('báo lỗi khi chuỗi ngày không hợp lệ', () => {
      expect(() => parseDate('chuoi-ngay-sai')).toThrow('Ngày không hợp lệ');
    });
  });

  describe('formatTime', () => {
    it('định dạng giờ phút chính xác HH:mm', () => {
      const formatted = formatTime('2026-10-28T09:05:00.000Z');
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('isDueSoon', () => {
    it('trả về true nếu hạn nộp trong vòng 48 giờ tới', () => {
      const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      expect(isDueSoon(in24Hours)).toBe(true);
    });

    it('trả về false nếu hạn nộp còn hơn 48 giờ', () => {
      const in5Days = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      expect(isDueSoon(in5Days)).toBe(false);
    });

    it('trả về false nếu deadline đã quá hạn trong quá khứ', () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      expect(isDueSoon(pastDate)).toBe(false);
    });
  });

  describe('isOverdue', () => {
    it('trả về true khi deadline đã trôi qua', () => {
      const past = new Date(Date.now() - 3600 * 1000).toISOString();
      expect(isOverdue(past)).toBe(true);
    });

    it('trả về false khi deadline ở tương lai', () => {
      const future = new Date(Date.now() + 3600 * 1000).toISOString();
      expect(isOverdue(future)).toBe(false);
    });
  });

  describe('getWeekDays', () => {
    it('trả về mảng 7 ngày', () => {
      const week = getWeekDays('2026-10-28T10:00:00.000Z');
      expect(week).toHaveLength(7);
    });
  });

  describe('isSameDay', () => {
    it('trả về true cho hai thời điểm trong cùng một ngày', () => {
      const morning = '2026-10-28T08:00:00';
      const afternoon = '2026-10-28T14:30:00';
      expect(isSameDay(morning, afternoon)).toBe(true);
    });

    it('trả về false cho hai ngày khác nhau', () => {
      const day1 = '2026-10-28T08:00:00';
      const day2 = '2026-10-29T08:00:00';
      expect(isSameDay(day1, day2)).toBe(false);
    });
  });
});
