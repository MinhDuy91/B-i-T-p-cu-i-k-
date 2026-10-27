/**
 * Hook useTheme — trả về bảng màu theo chế độ sáng/tối hiện tại.
 * Mọi component sử dụng màu sắc phải dùng hook này.
 */
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, type ThemeColors } from '@/constants/tokens';
import { useAppStore } from '@/store/appStore';

export function useTheme(): ThemeColors {
  const systemColorScheme = useColorScheme();
  const themePreference = useAppStore((s) => s.themePreference);

  const effectiveScheme =
    themePreference === 'system' ? systemColorScheme : themePreference;

  return effectiveScheme === 'dark' ? darkTheme : lightTheme;
}
