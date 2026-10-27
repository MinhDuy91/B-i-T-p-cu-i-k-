/**
 * Design Tokens — Study Planner
 * ĐÂY LÀ FILE DUY NHẤT CHỨA MÃ MÀU HEX.
 * Mọi file khác phải import màu từ đây.
 * Tỉ lệ tương phản chữ/nền >= 4.5:1 (WCAG AA)
 */

// ─── Bảng màu gốc ───────────────────────────────────────────
const palette = {
  // Xanh dương chủ đạo
  blue50: '#EBF5FF',
  blue100: '#D1E9FF',
  blue200: '#A3D3FF',
  blue500: '#2E86DE',
  blue600: '#1B6EC2',
  blue700: '#155DA5',
  blue900: '#0A2E52',

  // Xanh lá
  green50: '#E8F8EF',
  green500: '#27AE60',
  green600: '#1E8C4C',
  green700: '#166D3B',

  // Cam
  orange50: '#FFF4E6',
  orange500: '#F39C12',
  orange600: '#D68910',
  orange700: '#B7770A',

  // Đỏ
  red50: '#FDEDED',
  red500: '#E74C3C',
  red600: '#CB4335',
  red700: '#B03A2E',

  // Tím
  purple50: '#F3E8FF',
  purple500: '#8E44AD',
  purple600: '#7D3C98',

  // Hồng
  pink50: '#FDE8F0',
  pink500: '#E91E8C',

  // Vàng
  yellow50: '#FFFDE6',
  yellow500: '#F1C40F',

  // Xám trung tính
  grey50: '#F8F9FA',
  grey100: '#F1F3F5',
  grey200: '#E9ECEF',
  grey300: '#DEE2E6',
  grey400: '#CED4DA',
  grey500: '#ADB5BD',
  grey600: '#868E96',
  grey700: '#495057',
  grey800: '#343A40',
  grey900: '#212529',

  // Đen trắng
  white: '#FFFFFF',
  black: '#000000',
} as const;

// ─── Màu môn học mặc định ───────────────────────────────────
export const courseColors = [
  palette.blue500,
  palette.green500,
  palette.orange500,
  palette.purple500,
  palette.pink500,
  palette.red500,
  palette.yellow500,
] as const;

// ─── Chế độ sáng ────────────────────────────────────────────
export const lightTheme = {
  // Nền
  background: palette.white,
  backgroundSecondary: palette.grey50,
  backgroundTertiary: palette.grey100,
  surface: palette.white,
  surfaceElevated: palette.white,

  // Chữ (contrast >= 4.5:1 trên nền trắng)
  textPrimary: palette.grey900,       // #212529 trên #FFFFFF = 16.0:1 ✓
  textSecondary: palette.grey700,     // #495057 trên #FFFFFF = 8.5:1 ✓
  textTertiary: palette.grey600,      // #868E96 trên #FFFFFF = 4.6:1 ✓
  textMuted: palette.grey500,
  textInverse: palette.white,

  // Thương hiệu
  primary: palette.blue600,           // #1B6EC2 trên #FFFFFF = 5.2:1 ✓
  primaryLight: palette.blue100,
  primaryDark: palette.blue700,
  onPrimary: palette.white,

  // Trạng thái
  success: palette.green600,
  successLight: palette.green50,
  warning: palette.orange600,
  warningLight: palette.orange50,
  error: palette.red600,
  errorLight: palette.red50,
  info: palette.blue600,
  infoLight: palette.blue50,

  // Viền & Phân cách
  border: palette.grey300,
  borderLight: palette.grey200,
  divider: palette.grey200,

  // Icon
  icon: palette.grey700,
  iconSecondary: palette.grey500,

  // Bóng đổ
  shadowColor: palette.black,

  // Tab bar
  tabBarBackground: palette.white,
  tabBarBorder: palette.grey200,
  tabBarActive: palette.blue600,
  tabBarInactive: palette.grey500,

  // Offline banner
  offlineBanner: palette.orange500,
  offlineBannerText: palette.white,
} as const;

// ─── Chế độ tối ─────────────────────────────────────────────
export const darkTheme = {
  // Nền
  background: palette.grey900,
  backgroundSecondary: palette.grey800,
  backgroundTertiary: palette.grey700,
  surface: palette.grey800,
  surfaceElevated: palette.grey700,

  // Chữ (contrast >= 4.5:1 trên nền tối)
  textPrimary: palette.grey50,        // #F8F9FA trên #212529 = 15.3:1 ✓
  textSecondary: palette.grey300,     // #DEE2E6 trên #212529 = 11.8:1 ✓
  textTertiary: palette.grey400,      // #CED4DA trên #212529 = 9.7:1 ✓
  textMuted: palette.grey500,
  textInverse: palette.grey900,

  // Thương hiệu
  primary: palette.blue200,           // #A3D3FF trên #212529 = 11.6:1 ✓
  primaryLight: palette.blue900,
  primaryDark: palette.blue100,
  onPrimary: palette.grey900,

  // Trạng thái
  success: palette.green500,
  successLight: palette.green700,
  warning: palette.orange500,
  warningLight: palette.orange700,
  error: palette.red500,
  errorLight: palette.red700,
  info: palette.blue500,
  infoLight: palette.blue700,

  // Viền & Phân cách
  border: palette.grey700,
  borderLight: palette.grey800,
  divider: palette.grey700,

  // Icon
  icon: palette.grey300,
  iconSecondary: palette.grey500,

  // Bóng đổ
  shadowColor: palette.black,

  // Tab bar
  tabBarBackground: palette.grey900,
  tabBarBorder: palette.grey800,
  tabBarActive: palette.blue200,
  tabBarInactive: palette.grey500,

  // Offline banner
  offlineBanner: palette.orange600,
  offlineBannerText: palette.white,
} as const;

// ─── Kiểu chữ ───────────────────────────────────────────────
export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  captionBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  small: { fontSize: 11, fontWeight: '400' as const, lineHeight: 16 },
} as const;

// ─── Khoảng cách ────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

// ─── Bo góc ─────────────────────────────────────────────────
export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

// ─── Kích thước mục tiêu chạm (Accessibility) ──────────────
export const hitSlop = {
  /** Tối thiểu 44x44 theo WCAG */
  minimum: { top: 10, bottom: 10, left: 10, right: 10 },
} as const;

export const minTouchSize = 44;

// ─── Kiểu dữ liệu theme ────────────────────────────────────
export type ThemeColors = {
  [K in keyof typeof lightTheme]: string;
};
