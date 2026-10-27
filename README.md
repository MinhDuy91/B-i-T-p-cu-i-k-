# 📚 Study Planner — Ứng dụng Quản lý Lịch học & Deadline cho Sinh viên

> **Đồ án Cuối kỳ — Chuyên đề Lập trình Thiết bị Di động (Mobile Programming)**  
> **Topic 01:** Study Planner (Lịch học & Quản lý Deadline thông minh)  
> **Đối tượng:** Sinh viên năm 4 — Khoa Công nghệ Thông tin

---

## 👥 Nhóm Sinh viên Thực hiện

|  STT  | Mã số Sinh viên (MSSV) |           Họ và Tên            | Vai trò & Phân công nhiệm vụ                                                                                               |
| :---: | :--------------------: | :----------------------------: | :------------------------------------------------------------------------------------------------------------------------- |
| **1** |     **1923050269**     | Nguyễn Minh Hiếu (Trưởng Nhóm) | Thiết kế UI/UX Tokens, Xây dựng hệ thống màn hình (Screens), Tối ưu Accessibility (WCAG AA), Kiểm thử trải nghiệm          |
| **2** |     **1923050154**     |  Nguyễn Duy Hiếu (Thành viên)  | Kiến trúc Quản lý trạng thái (Zustand), TanStack Query Cache, Xác thực bảo mật SecureStore, Xử lý ảnh đính kèm & Thông báo |
| **3** |     **1923050091**     | Vũ Thanh Minh Duy (Thành viên) | Thiết kế Mock API & Xử lý ngoại tuyến (Offline), Viết Automated Tests (Jest 22 tests), Kiểm thử Timezone & Build app       |

---

## 🎯 Bảng Đối chiếu Tính năng & Thang điểm Đánh giá

| Phân loại             | Tính năng yêu cầu                                 | Trạng thái | Vị trí Source Code / Chi tiết kỹ thuật                                                 |
| :-------------------- | :------------------------------------------------ | :--------: | :------------------------------------------------------------------------------------- |
| **Must Have**         | Đăng nhập / Đăng xuất an toàn, lưu phiên          |   ✅ Đạt   | `store/authStore.ts`, `app/sign-in.tsx`, dùng `expo-secure-store`                      |
| **Must Have**         | CRUD Môn học & Bài tập từ API                     |   ✅ Đạt   | `api/client.ts`, `api/courses.ts`, `api/assignments.ts`                                |
| **Must Have**         | 2 Chế độ xem Lịch (Tuần & Danh sách)              |   ✅ Đạt   | `app/(tabs)/calendar.tsx`, `components/WeeklyCalendar.tsx`                             |
| **Must Have**         | Lọc theo môn học và trạng thái                    |   ✅ Đạt   | Lọc 'all' / 'pending' / 'completed' kết hợp môn học trong `calendar.tsx`               |
| **Must Have**         | Nhắc nhở hạn nộp thông báo cục bộ                 |   ✅ Đạt   | `utils/notifications.ts` (lên lịch nhắc trước 24h & 2h)                                |
| **Must Have**         | Thống kê tiến độ theo môn (Computed)              |   ✅ Đạt   | `app/(tabs)/courses.tsx`, `components/CourseCard.tsx` (tính động)                      |
| **Must Have**         | Hỗ trợ Ngoại tuyến & Offline Banner               |   ✅ Đạt   | `hooks/useNetworkStatus.ts`, `components/ui/OfflineBanner.tsx`                         |
| **Should Have (>8đ)** | Đính kèm ảnh chụp ghi chú bài tập                 |   ✅ Đạt   | `app/modal/new-assignment.tsx`, `app/assignment/[id].tsx` (Camera & Library)           |
| **Should Have (>8đ)** | Widget tóm tắt deadline 48 giờ                    |   ✅ Đạt   | `components/WidgetSummary.tsx` hiển thị ngay đầu màn hình Trang chủ                    |
| **Should Have (>8đ)** | Optimistic updates kèm rollback                   |   ✅ Đạt   | `api/assignments.ts` và `app/assignment/[id].tsx` khi hoàn thành bài                   |
| **Tiêu chuẩn UI**     | 4 Trạng thái (Loading, Empty, Error, Content)     |   ✅ Đạt   | Đầy đủ tại 100% các màn hình (`components/ui/*`)                                       |
| **Tiêu chuẩn UI**     | Dark & Light Mode từ 1 file token duy nhất        |   ✅ Đạt   | `constants/tokens.ts` (đảm bảo độ tương phản chữ/nền >= 4.5:1)                         |
| **Tiêu chuẩn UI**     | Accessibility WCAG (Target >= 44x44, label, role) |   ✅ Đạt   | Áp dụng `minTouchSize: 44`, `hitSlop`, `accessibilityRole`, `accessibilityLabel`       |
| **Kiến trúc**         | Cấu trúc định tuyến Expo Router (5+ màn hình)     |   ✅ Đạt   | 1 Dynamic Route (`[id]`), 1 Modal Route (`modal/new-assignment`), 4 Tabs, `+not-found` |
| **Kiểm thử**          | Kiểm thử tự động (Tối thiểu 3 tests)              |   ✅ Đạt   | **4 test suites, 22 unit tests** chạy với Jest & `@react-native/jest-preset`           |

---

## 🛠️ Công nghệ Sử dụng

- **Nền tảng:** React Native 0.88 + Expo SDK 58 (Expo Router 58, File-based routing)
- **Ngôn ngữ:** TypeScript 6.0 (Cấu hình `strict: true`, không dùng `any`)
- **State Management:** Zustand v5 (Store phân tầng, selector tối ưu re-render)
- **Data Fetching & Cache:** TanStack Query v5 (`@tanstack/react-query`) hỗ trợ cache, auto-retry, optimistic updates & rollback
- **Bảo mật:** `expo-secure-store` mã hóa token xác thực
- **Xử lý Thời gian:** `date-fns` v4 chuẩn hóa theo múi giờ Việt Nam (UTC+7)
- **Device Features:** `expo-image-picker` (Camera & Thư viện), `expo-notifications` (Thông báo đẩy cục bộ), `expo-network` (Giám sát kết nối mạng)
- **Testing:** Jest + `jest-expo` + `@react-native/jest-preset` + `@testing-library/react-native`

---

## 📂 Cấu trúc Thư mục Dự án

```
./ (file cuối kỳ)
├── __tests__/                  # Thư mục kiểm thử tự động (22 tests)
│   ├── appStore.test.ts        # Test quản lý trạng thái bộ lọc & theme
│   ├── authStore.test.ts       # Test đăng nhập, đăng xuất, SecureStore session
│   ├── dates.test.ts           # Test tiện ích ngày giờ, hạn 48h, format VN
│   └── progress.test.ts        # Test tính toán tiến độ môn học động
├── api/                        # Tầng kết nối API & TanStack Query Hooks
│   ├── client.ts               # REST API mock client (có độ trễ mạng giả lập)
│   ├── courses.ts              # Hooks: useCourses, useCourse
│   └── assignments.ts          # Hooks: useAssignments, useUpdateAssignment (Optimistic)
├── app/                        # Expo Router — Định tuyến dựa trên file
│   ├── (tabs)/                 # Nhóm màn hình Bottom Tabs
│   │   ├── _layout.tsx         # Tab Bar điều hướng (Home, Calendar, Courses, Profile)
│   │   ├── index.tsx           # Tab 1: Trang chủ Dashboard & Widget 48h
│   │   ├── calendar.tsx        # Tab 2: Lịch học (Weekly View & List View)
│   │   ├── courses.tsx         # Tab 3: Danh sách môn & Thống kê tiến độ
│   │   └── profile.tsx         # Tab 4: Thông tin sinh viên, Đổi theme, Cài đặt
│   ├── assignment/
│   │   └── [id].tsx            # Dynamic Route: Xem chi tiết bài tập, ảnh ghi chú
│   ├── modal/
│   │   └── new-assignment.tsx  # Modal Route: Form Thêm / Sửa bài tập & Chụp ảnh
│   ├── +not-found.tsx          # Màn hình 404 Not Found
│   ├── _layout.tsx             # Root Layout (Provider, Auth Guard)
│   └── sign-in.tsx             # Màn hình Đăng nhập (Email sinh viên)
├── components/                 # Các Component tái sử dụng
│   ├── ui/                     # Bộ 4 trạng thái giao diện chuẩn mực
│   │   ├── LoadingState.tsx    # Trạng thái đang tải dữ liệu
│   │   ├── EmptyState.tsx      # Trạng thái danh sách rỗng
│   │   ├── ErrorState.tsx      # Trạng thái lỗi mạng kèm nút thử lại
│   │   └── OfflineBanner.tsx   # Banner cảnh báo ngoại tuyến
│   ├── AssignmentCard.tsx      # Thẻ bài tập kèm deadline badge & checkbox
│   ├── CourseCard.tsx          # Thẻ môn học kèm thanh tiến độ phần trăm
│   ├── WeeklyCalendar.tsx      # Thanh chọn 7 ngày trong tuần
│   └── WidgetSummary.tsx       # Widget tóm tắt bài tập gấp trong 48 giờ
├── constants/
│   └── tokens.ts               # Nguồn duy nhất chứa Bảng màu, Typography, WCAG Tokens
├── hooks/
│   ├── useNetworkStatus.ts     # Hook theo dõi online/offline mạng
│   └── useTheme.ts             # Hook cung cấp màu sắc theme sáng/tối
├── store/
│   ├── appStore.ts             # Zustand store lưu filter, themePreference, offline
│   └── authStore.ts            # Zustand store lưu user, token, SecureStore sync
├── types/
│   └── index.ts                # TypeScript Interfaces (Course, Assignment, User, ...)
├── utils/
│   ├── dates.ts                # Xử lý thời gian, hạn nộp, tuần học
│   └── notifications.ts        # Quản lý quyền và lên lịch local notifications
├── AI_LOG.md                   # Báo cáo Nhật ký sử dụng AI bắt buộc
├── jest.config.js              # Cấu hình Jest Testing
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Hướng dẫn Cài đặt & Chạy Ứng dụng

### 1. Yêu cầu Môi trường

- Node.js >= 18.x
- Trình quản lý gói npm hoặc yarn
- Ứng dụng **Expo Go** trên điện thoại (iOS / Android) hoặc giả lập Android Studio / Xcode Simulator.

### 2. Cài đặt Thư viện

Mở terminal tại thư mục dự án (`file cuối kỳ`):

```bash
npm install
```

### 3. Chạy Ứng dụng (Development)

```bash
npx expo start
```

- Quét mã QR hiển thị trên Terminal bằng **Expo Go** (Android) hoặc Camera (iOS).
- Nhấn `w` để mở giao diện Web.
- Nhấn `a` để chạy trên Android Emulator.

### 4. Chạy Kiểm thử Tự động (Automated Tests)

Toàn bộ 4 bộ test suites (22 tests) được chạy bằng Jest:

```bash
npm test
```

_Kết quả mẫu:_

```text
PASS __tests__/progress.test.ts
PASS __tests__/appStore.test.ts
PASS __tests__/authStore.test.ts
PASS __tests__/dates.test.ts

Test Suites: 4 passed, 4 total
Tests:       22 passed, 22 total
Snapshots:   0 total
Time:        2.953 s
```

### 5. Kiểm tra TypeScript (Type Check)

Đảm bảo 100% không có lỗi kiểu dữ liệu:

```bash
npx tsc --noEmit
```

---

## 🌟 Điểm Nổi Bật của Dự án

1. **Optimistic Updates với Rollback tự động:** Khi người dùng nhấn hoàn thành bài tập, giao diện lập tức cập nhật và gạch bỏ bài tập ngay tức thì (0ms latency). Nếu API giả lập trả về lỗi, TanStack Query sẽ tự động rollback trạng thái về trước đó và thông báo lỗi.
2. **Đính kèm Ảnh ghi chú (Handwritten Notes):** Cho phép chụp trực tiếp từ camera hoặc chọn từ thư viện ảnh để lưu lại ảnh chụp đề cương, slide giảng viên hoặc bản nháp viết tay của bài tập.
3. **Widget 48h thông minh:** Tự động tính toán các bài tập sắp hết hạn trong 48 giờ tới, nhóm theo mức độ khẩn cấp (Hôm nay / Ngày mai) để sinh viên không bao giờ bị trễ hạn.
4. **Hệ thống Design Tokens chuẩn WCAG AA:** Đảm bảo tỉ lệ tương phản chữ/nền luôn đạt từ 4.5:1 đến 16:1, kích thước vùng chạm tối thiểu 44x44 points, hỗ trợ người khiếm thị đọc màn hình với nhãn trợ năng đầy đủ.
5. **Chế độ Ngoại tuyến mượt mà:** Ứng dụng tự động phát hiện mất mạng, hiển thị dải thông báo cảnh báo ngoại tuyến và sử dụng cache nội bộ mà không làm gián đoạn việc xem lịch học.

## 📌 Ghi Chú Về Quy Trình Git (Git Workflow Note)

- Do giai đoạn đầu nhóm tập trung phát triển và thử nghiệm các mô hình lưu trữ (Zustand, SecureStore vs Web) trực tiếp trên môi trường máy cục bộ (Local Environment), mã nguồn chính thức được đẩy lên GitHub ở mốc hoàn thiện dự án (`v1.0.0`).
- Toàn bộ quá trình phân công nhiệm vụ, đóng góp của các thành viên và bài học kinh nghiệm về Git đã được nhóm trình bày chi tiết trong file **AI_LOG.md** và **Bài thu hoạch 1 trang**.
