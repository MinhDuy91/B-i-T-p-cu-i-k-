/**
 * WeeklyCalendar — Hiển thị 7 ngày trong tuần.
 * Tuần bắt đầu từ thứ Hai (chuẩn Việt Nam).
 * Có chấm đánh dấu ngày có bài tập sắp đến hạn.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography, radii, minTouchSize } from '@/constants/tokens';
import { getWeekDays, getDayName, getDayNumber, isSameDay } from '@/utils/dates';
import { isToday, parseISO, startOfDay, isSameDay as dateIsSameDay } from 'date-fns';

interface WeeklyCalendarProps {
  /** Ngày đang chọn (ISO string) */
  selectedDate: string;
  /** Hàm gọi khi chọn ngày */
  onSelectDate: (date: string) => void;
  /** Danh sách ngày có bài tập (ISO strings) */
  assignmentDates?: string[];
}

export function WeeklyCalendar({
  selectedDate,
  onSelectDate,
  assignmentDates = [],
}: WeeklyCalendarProps) {
  const theme = useTheme();
  const weekDays = getWeekDays(selectedDate);

  const hasAssignment = (dayIso: string): boolean => {
    const day = startOfDay(parseISO(dayIso));
    return assignmentDates.some((d) => {
      try {
        return dateIsSameDay(parseISO(d), day);
      } catch {
        return false;
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {weekDays.map((dayIso) => {
          const selected = isSameDay(dayIso, selectedDate);
          const today = isToday(parseISO(dayIso));
          const hasDot = hasAssignment(dayIso);

          return (
            <Pressable
              key={dayIso}
              onPress={() => onSelectDate(dayIso)}
              style={[
                styles.dayButton,
                selected && { backgroundColor: theme.primary },
                today && !selected && {
                  borderWidth: 2,
                  borderColor: theme.primary,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${getDayName(dayIso)}, ngày ${getDayNumber(dayIso)}${selected ? ', đang chọn' : ''}${hasDot ? ', có bài tập' : ''}`}
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.dayName,
                  { color: selected ? theme.onPrimary : theme.textTertiary },
                ]}
              >
                {getDayName(dayIso)}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  { color: selected ? theme.onPrimary : theme.textPrimary },
                ]}
              >
                {getDayNumber(dayIso)}
              </Text>
              {hasDot ? (
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: selected
                        ? theme.onPrimary
                        : theme.warning,
                    },
                  ]}
                />
              ) : (
                <View style={styles.dotPlaceholder} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  scrollContent: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dayButton: {
    width: minTouchSize,
    minHeight: minTouchSize + 24,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  dayName: {
    ...typography.small,
    textTransform: 'capitalize',
  },
  dayNumber: {
    ...typography.bodyBold,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotPlaceholder: {
    width: 6,
    height: 6,
  },
});
