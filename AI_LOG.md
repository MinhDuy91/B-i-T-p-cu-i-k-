# 📝 NHẬT KÝ SỬ DỤNG TRÍ TUỆ NHÂN TẠO (AI LOG)

> **Môn học:** Chuyên đề Lập trình Thiết bị Di động (Mobile Programming)  
> **Đề tài:** Topic 01 — Study Planner (Quản lý Lịch học & Deadline Sinh viên)  
> **Nhóm sinh viên thực hiện:**
>
> - **1923050269 - Nguyễn Minh Hiếu**
> - **1923050154 - Nguyễn Duy Hiếu**
> - **1923050091 - Vũ Thanh Minh Duy**

---

## 1. Mục Đích & Nguyên Tắc Sử Dụng AI Trong Đồ Án

Nhóm sinh viên năm 4 tiếp cận đồ án với tinh thần xem AI (Trí tuệ nhân tạo) như một **trợ lý lập trình cặp (Pair Programmer)** nhằm:

1. Đẩy nhanh tốc độ thiết lập khung dự án ban đầu (Project Scaffolding).
2. Xây dựng cấu trúc Design System tuân thủ tiêu chuẩn trợ năng quốc tế **WCAG AA**.
3. Tham khảo các mô hình quản lý trạng thái hiện đại (**Zustand + TanStack Query v5**).
4. Viết các kịch bản kiểm thử tự động (**Unit Tests với Jest**).

**Nguyên tắc cốt lõi của nhóm:**  
_Mọi dòng mã do AI sinh ra đều phải được sinh viên đọc hiểu, rà soát logic, kiểm tra an toàn kiểu dữ liệu (Strict TypeScript) và kiểm thử thực tế trên thiết bị di động trước khi đưa vào sản phẩm._

---

## 2. Nhật Ký Chi Tiết Các Giai Đoạn Phát Triển

### Giai đoạn 1: Khởi tạo Kiến trúc & Thiết kế Design Tokens

- **Prompt gửi AI:**  
  _"Tôi đang làm đồ án tốt nghiệp năm 4 đề tài Topic 01: Study Planner bằng Expo SDK 58, Expo Router, TypeScript strict. Hãy thiết kế cho tôi một file constants/tokens.ts đóng vai trò là nguồn duy nhất (Single Source of Truth) cho toàn bộ màu sắc, typography, spacing, border radii và kích thước vùng chạm tối thiểu 44x44 theo chuẩn WCAG AA."_
- **Kết quả do AI sinh ra:**  
  AI sinh ra file `constants/tokens.ts` với bảng màu palette, `lightTheme`, `darkTheme`, kích thước `minTouchSize: 44` và `hitSlop`.
- **Đánh giá & Chỉnh sửa của Sinh viên:**
  - _Vấn đề phát hiện:_ AI dùng cú pháp `as const` cho cả `lightTheme` và `darkTheme`, sau đó khai báo `export type ThemeColors = typeof lightTheme;`. Điều này dẫn đến việc TypeScript khóa chặt các giá trị mã hex thành kiểu hằng số (literal type), khiến hàm `useTheme()` không thể trả về `darkTheme` vì lỗi xung đột kiểu.
  - _Giải pháp khắc phục:_ Sinh viên đã viết lại type `ThemeColors` dạng indexed mapping `[K in keyof typeof lightTheme]: string`, đồng thời bổ sung thêm token `textMuted` vào cả hai theme để phục vụ hiển thị chữ phụ ở các component.

---

### Giai đoạn 2: Tầng Dữ liệu (Mock API, Zustand Stores, TanStack Query)

- **Prompt gửi AI:**  
  _"Xây dựng tầng API Client giả lập có độ trễ mạng (Network Latency 500ms) cho Course và Assignment, kết hợp với TanStack Query v5 hỗ trợ tính năng Optimistic Update kèm Rollback khi sinh viên đánh dấu hoàn thành bài tập. Đồng thời tạo 2 store Zustand: authStore (lưu token vào SecureStore) và appStore (quản lý bộ lọc bài tập, chế độ xem tuần/danh sách)."_
- **Kết quả do AI sinh ra:**  
  AI tạo thành công `api/client.ts`, `api/assignments.ts`, `api/courses.ts`, `store/authStore.ts` và `store/appStore.ts`.
- **Đánh giá & Chỉnh sửa của Sinh viên:**
  - Sinh viên đã kiểm tra cơ chế rollback trong `onMutate`, `onError`, `onSettled` của TanStack Query: snapshot `previousAssignments` được lưu đúng cách, đảm bảo khi server phát sinh lỗi mạng thì checkbox hoàn thành lập tức quay về trạng thái cũ.
  - Sinh viên bổ sung thêm thuộc tính `themePreference` ('light' | 'dark' | 'system') vào `appStore` để hỗ trợ người dùng chủ động chọn giao diện tối trong phần Cài đặt.

---

### Giai đoạn 3: Phát triển Hệ thống Màn hình (Screens & Navigation)

- **Prompt gửi AI:**  
  _"Xây dựng các màn hình theo đúng yêu cầu đề bài gồm: Dynamic Route app/assignment/[id].tsx xem chi tiết và đính kèm ảnh, Modal Route app/modal/new-assignment.tsx có chức năng chụp ảnh bằng camera/thư viện ảnh, Tab Trang chủ với Widget 48h, Tab Lịch có chế độ Weekly và List view, Tab Môn học hiển thị tiến độ tính toán động. Mọi màn hình phải có đủ 4 trạng thái: Loading, Empty, Error, Content."_
- **Kết quả do AI sinh ra:**  
  Các màn hình được sinh ra với đầy đủ cấu trúc 4 trạng thái sử dụng `LoadingState`, `EmptyState`, `ErrorState`.
- **Đánh giá & Chỉnh sửa của Sinh viên:**
  - _Vấn đề phát hiện 1:_ File `app/(tabs)/two.tsx` và `app/modal.tsx` từ template gốc của Expo bị thừa thãi và không ăn khớp với cấu trúc route mới.
  - _Giải pháp:_ Sinh viên đã chuyển đổi `two.tsx` thành `profile.tsx` (Màn hình Cá nhân & Cài đặt) hiển thị thông tin 3 sinh viên trong nhóm, nút chuyển theme, kiểm tra đồng bộ dữ liệu ngoại tuyến và đăng xuất an toàn. Đồng thời khai báo chính xác `modal/new-assignment` trong `app/_layout.tsx`.
  - _Vấn đề phát hiện 2:_ Trong Expo SDK 58 với React 19, file `components/Themed.tsx` bị lỗi `DefaultText['props'] does not exist`. Sinh viên đã sửa thành `React.ComponentProps<typeof DefaultText>`.

---

### Giai đoạn 4: Tính năng Thông báo & Tính toán Thời gian

- **Prompt gửi AI:**  
  _"Viết module utils/notifications.ts sử dụng expo-notifications để tự động lên lịch nhắc nhở deadline trước 24 giờ và trước 2 giờ khi sinh viên thêm bài tập mới."_
- **Kết quả do AI sinh ra:**  
  Hàm `scheduleAssignmentReminder()` và `requestNotificationPermissions()`.
- **Đánh giá & Chỉnh sửa của Sinh viên:**
  - _Lỗi phát hiện:_ Trong Expo SDK 58, giao diện `NotificationBehavior` yêu cầu bắt buộc phải có thuộc tính `shouldShowList: boolean`. Đoạn mã AI ban đầu chỉ có `shouldShowAlert`, `shouldPlaySound`, `shouldSetBadge`, `shouldShowBanner`, dẫn đến lỗi biên dịch TypeScript.
  - _Giải pháp:_ Sinh viên đã bổ sung `shouldShowList: true` vào `Notifications.setNotificationHandler`.

---

### Giai đoạn 5: Viết Kiểm thử Tự động (Automated Testing)

- **Prompt gửi AI:**  
  _"Viết các bộ kiểm thử unit tests cho Jest để kiểm tra: (1) Tính toán tiến độ môn học không chia cho 0, (2) Quản lý trạng thái bộ lọc trong appStore, (3) Đăng nhập và lưu SecureStore trong authStore, (4) Các tiện ích ngày giờ trong dates.ts."_
- **Kết quả do AI sinh ra:**  
  4 file test trong thư mục `__tests__/`.
- **Đánh giá & Chỉnh sửa của Sinh viên (QUAN TRỌNG):**
  - _Lỗi 1 (Cấu hình Jest):_ Khi chạy `npm test`, Jest báo lỗi `The React Native Jest preset that jest-expo relies on has moved to a separate package`. Sinh viên đã tìm hiểu tài liệu và cài đặt bổ sung `@react-native/jest-preset`, đồng thời cài `@types/jest` và cập nhật `tsconfig.json`.
  - _Lỗi 2 (Lệch múi giờ UTC vs Local):_ Test case `isSameDay` bị fail:  
    `Expected: true, Received: false`.  
    AI đã truyền `'2026-10-28T08:00:00.000Z'` và `'2026-10-28T22:30:00.000Z'`. Trong múi giờ Việt Nam (UTC+7), mốc 22:30 UTC thực chất đã bước sang 05:30 ngày 29/10, do đó thuộc về hai ngày khác nhau. Sinh viên đã sửa lại thời gian kiểm thử thành chuẩn giờ địa phương `'2026-10-28T08:00:00'` và `'2026-10-28T14:30:00'`, đưa toàn bộ 22 tests về trạng thái **PASS 100%**.

### Giai đoạn 6: Tính năng Xác thực Nâng cao (Đăng ký mới, Ràng buộc Email Edu/Gmail & Kiểm tra Mật khẩu)

- **Prompt gửi AI:**  
  _"Setup thêm phần đăng ký tài khoản dành cho ai chưa có. Điều kiện đăng nhập vào app phải có đuôi edu gmail (.edu, .edu.vn hoặc @gmail.com). Khi nhập mật khẩu sai phải hiện thông báo lỗi rõ ràng."_
- **Kết quả do AI sinh ra:**
  - Nâng cấp `store/authStore.ts`: thêm `isEduEmail()`, hàm `signUp()` lưu người dùng vào bộ nhớ cục bộ, hàm `signIn()` kiểm tra mật khẩu chính xác.
  - Thiết kế lại `app/sign-in.tsx` dạng tab kép: **🔐 Đăng nhập** $\leftrightarrow$ **📝 Đăng ký mới**, bổ sung cảnh báo pop-up `Alert.alert` khi sai mật khẩu hoặc sai định dạng email.
- **Đánh giá & Chỉnh sửa của Sinh viên:**
  - _Vấn đề phát hiện 1:_ Lúc đầu regex chỉ lọc cứng `.edu.vn`, nếu sinh viên nhập tài khoản Gmail cá nhân (`@gmail.com`) hoặc mail edu quốc tế (`.edu`) thì bị từ chối oan. Sinh viên đã tối ưu hàm `isEduEmail()` để chấp nhận linh hoạt cả email trường cấp (`.edu`, `.edu.vn`, `@edu.`) và tài khoản Google Workspace / Gmail (`@gmail.com`).
  - _Vấn đề phát hiện 2:_ Khi bàn phím ảo đẩy lên trên màn hình điện thoại, thông báo lỗi màu đỏ có thể bị che khuất. Sinh viên đã tích hợp thêm native popup `Alert.alert` giúp thông báo mật khẩu sai hiển thị ngay lập tức ở giữa màn hình.
  - _Bổ sung kiểm thử:_ Cập nhật bộ unit test `__tests__/authStore.test.ts` nâng tổng số test lên **28/28 tests PASS 100%**.

### Giai đoạn 7: Phân Tách Dữ Liệu Đa Tài Khoản (User Data Isolation) & Quản Lý Lịch Học

- **Prompt gửi AI:**  
  _"Giờ bạn hãy làm đăng nhập tài khoản A thêm phần lịch học và rồi đăng xuất ra đăng nhập vào tài khoản B đảm bảo không còn dữ liệu của tài khoản A vừa thêm vào."_
- **Kết quả do AI sinh ra:**
  - Tách dữ liệu `assignments` và `courses` độc lập cho từng người dùng (`userId`) thông qua `AsyncStorage` / `localStorage` và `Map` cache trong RAM.
  - Tích hợp `queryClient.clear()` vào các hàm `signIn`, `signUp`, `signOut`, `restoreSession` của `useAuthStore` để xóa sạch TanStack Query cache khi đổi tài khoản.
  - Bổ sung loại dữ liệu `type: 'assignment' | 'schedule'` vào model `Assignment`, thêm toggle chọn **📅 Lịch học / Tiết học** $\leftrightarrow$ **📝 Bài tập / Deadline** trong modal `app/modal/new-assignment.tsx`.
  - Cập nhật tab Lịch học (`app/(tabs)/calendar.tsx`) với nút `+` trên thanh tiêu đề để thêm nhanh lịch học, hiển thị nhãn `[📅 Lịch học]` trên thẻ bài tập (`AssignmentCard`).
  - Bổ sung 2 nút bấm đăng nhập nhanh riêng biệt cho **Tài khoản A** (`sinhvien@hutech.edu.vn`) và **Tài khoản B** (`minhduy@student.edu.vn`) tại màn hình `app/sign-in.tsx`.
- **Đánh giá & Chỉnh sửa của Sinh viên:**
  - _Vấn đề phát hiện 1 (Rò rỉ dữ liệu qua RAM & Cache):_ Ban đầu `api/client.ts` sử dụng một mảng tĩnh dùng chung `MOCK_ASSIGNMENTS` và TanStack Query giữ cache `['assignments']`. Khi tài khoản A thêm bài tập hoặc lịch học mới, tài khoản B đăng nhập vào vẫn nhìn thấy dữ liệu của A do dùng chung mảng bộ nhớ.
  - _Giải pháp:_ Sinh viên đã thiết kế cơ chế lưu trữ phân vùng theo tiền tố khóa `@study_planner_assignments_${userId}`, kết hợp lệnh `queryClient.clear()` mỗi khi đăng xuất/đăng nhập để xóa bỏ hoàn toàn cache bộ nhớ, cô lập tuyệt đối dữ liệu giữa các sinh viên.
  - _Vấn đề phát hiện 2 (Lỗi Jest với AsyncStorage Native Module):_ Khi chạy test unit test `__tests__/userIsolation.test.ts`, Jest báo lỗi `[@RNC/AsyncStorage]: NativeModule: AsyncStorage is null`. Sinh viên đã cấu hình `moduleNameMapper` trong `jest.config.js` trỏ `@react-native-async-storage/async-storage` về mock chính thức `@react-native-async-storage/async-storage/jest/async-storage-mock`, đưa toàn bộ 5 test suites (29 tests) về trạng thái **PASS 100%**.

---

## 3. Tổng Hợp Các Lỗi Cụ Thể Do AI Sinh Ra & Cách Nhóm Khắc Phục

|  STT   | Vấn đề / Lỗi do AI sinh ra            | Nguyên nhân kỹ thuật                                                                                                                                          | Cách nhóm sinh viên đã xử lý                                                                                                                                                                                                     |
| :----: | :------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | Lỗi TypeScript `ThemeColors`          | Dùng `as const` ép kiểu literal hex, không tương thích giữa `darkTheme` và `lightTheme`                                                                       | Định nghĩa lại type `ThemeColors` với kiểu `string` và thêm `textMuted`                                                                                                                                                          |
| **2**  | Lỗi thiếu `@react-native/jest-preset` | Thay đổi trong kiến trúc Expo SDK 58 tách riêng preset Jest                                                                                                   | Cài đặt `@react-native/jest-preset` và `@types/jest` vào `devDependencies`                                                                                                                                                       |
| **3**  | Lỗi fail test `isSameDay`             | AI dùng chuỗi UTC `...Z` mà không tính tới độ lệch múi giờ Việt Nam (UTC+7)                                                                                   | Điều chỉnh giờ test case về cùng một ngày theo múi giờ hệ thống                                                                                                                                                                  |
| **4**  | Lỗi `Themed.tsx` trên React 19        | `DefaultText['props']` không còn khả dụng trên React Functional Components                                                                                    | Thay thế bằng `React.ComponentProps<typeof DefaultText>`                                                                                                                                                                         |
| **5**  | Lỗi `NotificationBehavior`            | Thiếu trường bắt buộc `shouldShowList` trong định nghĩa kiểu Expo Notifications mới                                                                           | Thêm `shouldShowList: true` vào hàm cấu hình notification handler                                                                                                                                                                |
| **6**  | Route modal chưa ăn khớp              | AI tạo route nhưng chưa đăng ký đúng tên `modal/new-assignment` trong root layout                                                                             | Cập nhật lại `app/_layout.tsx` và gỡ bỏ file template thừa                                                                                                                                                                       |
| **7**  | Bộ lọc email quá cứng nhắc            | AI ban đầu chỉ cho phép đuôi `.edu.vn`, chặn nhầm email `@gmail.com` của sinh viên                                                                            | Mở rộng kiểm tra cho cả `.edu`, `.edu.vn`, và `@gmail.com` theo đúng yêu cầu đề tài                                                                                                                                              |
| **8**  | Rò rỉ dữ liệu giữa tài khoản A và B   | Dữ liệu mock lưu trong biến mảng toàn cục và TanStack Query không xóa cache khi đăng xuất                                                                     | Phân tách khóa lưu trữ theo `userId`, xóa sạch query cache bằng `queryClient.clear()`, viết test `userIsolation.test.ts` kiểm chứng độc lập                                                                                      |
| **9**  | Không lưu được trên Web máy tính      | `Alert.alert` không hiện trên React Native Web; ngày nộp và môn học ban đầu bị trống dẫn tới chặn validate âm thầm; `router.back()` không đóng modal trên web | Tự động chọn môn học đầu tiên, điền sẵn ngày hiện tại dạng `YYYY-MM-DD`, thêm dải cảnh báo lỗi trực quan, bổ sung nút bấm Lưu to ở cuối biểu mẫu và hỗ trợ `router.replace` mượt mà trên Web                                     |
| **10** | Nút Xóa không hoạt động trên Web      | Dùng `Alert.alert` hoặc `window.confirm` bị trình duyệt chặn hộp thoại modal âm thầm, đồng thời modal sửa thiếu nút xóa trực tiếp                             | Thay thế hoàn toàn bằng hộp xác nhận xóa nội bộ ngay trên giao diện (In-App Confirmation Card) với hai nút `[Hủy bỏ]` và `[🗑️ Đồng ý xóa ngay]`, hỗ trợ xóa trực tiếp ở cả màn hình chi tiết và màn hình Sửa trên Web lẫn Mobile |

---

## 4. Phân Công & Đánh Giá Đóng Góp Giữa Các Thành Viên

|      MSSV      |   Họ tên    | Nhiệm vụ chính trong dự án                                                                                                 | Mức độ đóng góp |
| :------------: | :---------: | :------------------------------------------------------------------------------------------------------------------------- | :-------------: |
| **1923050269** | Trưởng nhóm | Prompt và giám sát kiến trúc UI, kiểm duyệt toàn bộ Design Tokens WCAG, hoàn thiện các màn hình Dashboard, Calendar, Modal |    **100%**     |
| **1923050154** | Thành viên  | Quản lý state Zustand, tích hợp TanStack Query, xử lý SecureStore, tích hợp Camera/Image Picker và Notification            |    **100%**     |
| **1923050091** | Thành viên  | Thiết kế Mock API, cấu hình Jest & viết 4 test suites (22 tests), rà soát và fix các lỗi múi giờ và TypeScript             |    **100%**     |

---

## 5. Kết Luận & Bài Học Kinh Nghiệm

1. **Hiệu quả của AI:** AI giúp tăng năng suất vượt bậc trong việc tạo boilerplate code, gợi ý giải pháp kiến trúc và sinh các trường hợp kiểm thử biên (edge cases).
2. **Vai trò không thể thay thế của Kỹ sư phần mềm:** AI thường xuyên gặp các lỗi về phiên bản thư viện mới nhất (breaking changes), lệch múi giờ (timezone issues), hoặc định nghĩa kiểu TypeScript quá chặt/quá lỏng. Sinh viên công nghệ thông tin cần có nền tảng vững vàng để phát hiện, debug và làm chủ hoàn toàn mã nguồn của mình.
