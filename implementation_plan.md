# Kế hoạch tổng hợp kiến thức React & Xây dựng Dự án Base (Production-Ready)

## Mục tiêu
1. **Tổng hợp kiến thức toàn diện**: Đọc và trích xuất toàn bộ kiến thức, kinh nghiệm thực chiến, quy tắc tổ chức code và các giải pháp đã học qua các thư mục dự án (`D34` đến `D48`, `threads-clone-ui`) thành một tài liệu Markdown chuẩn mực, có hệ thống (lưu tại `Sum1.md` trong thư mục `threads-clone-ui` hoặc file theo chỉ định).
2. **Thiết lập lộ trình xây dựng Dự án Base**: Định hình kiến trúc thư mục chuẩn công nghiệp và các bước triển khai chi tiết (từ Core config, Routing, UI/UX, State, API Client với Refresh Token, Form, Auth Guard đến Error Boundary) để có thể tái sử dụng cho mọi dự án React tương lai.

---

## Phân tích nguồn dữ liệu kiến thức (Input Projects)

Qua rà soát toàn bộ các thư mục bài học trong `ReactJs`:
- **D34 - D35**: React Core, JSX, Virtual DOM, Component Mindset, Props & State (`useState`), Re-render trigger, Event handling, Two-way vs One-way data binding.
- **D36**: React Router DOM (v6+), Nested Routes, `<Outlet />`, Hệ thống đa Layout (`DefaultLayout`, `AuthLayout`, Blank), `useParams`, `useSearchParams`, `useNavigate` vs `<Navigate />`, Slug URL & SEO, Scroll Restoration.
- **D37**: Tư duy phân rã Component (Micro-components), CSS Modules/SCSS isolation, Modal pattern, `useEffect` Lifecycle & **Cleanup functions** (tránh memory leak), **Closure** & Context thực thi trong JS.
- **D38**: Tối ưu hiệu năng & Hooks nâng cao: `useRef` (DOM Ref & Mutable Ref), `React.memo` (so sánh shallow/custom prop), `useCallback` (caching function reference, tránh trap closure), `useMemo` (caching phép tính nặng), `useImperativeHandle` + `forwardRef` (expose method con ra cha), `useReducer`, Custom Hooks (quy tắc & patterns), Vite Path Alias (`@/` với `jsconfig.json`).
- **D39**: Form Handling & UI patterns: Kỹ thuật **Debounce** (tối ưu search input & chống race-condition API), Compound Component (Tabs/Tab với `Children.map`, query param URL sync), Form state gom nhóm, Context API đa tầng (Theme Light/Dark với anti-flicker script tại `index.html`, Form Context Provider).
- **D40**: State Management Evolution: Hạn chế của Context API (Wrapper hell, re-render diện rộng), Redux Core architecture (Store, State, Actions, Dispatch, Reducer, Subscriptions, Pure Functions & Immutability).
- **D41**: Asynchronous & Side Effects: Axios Instance, **Redux Thunk** (xử lý async action), Phân chia tài nguyên (`features`/`store`), Global Loading, Quản lý biến môi trường Vite (`.env`, `.env.local`, `.env.production`).
- **D42**: **Redux Toolkit (RTK)**: `configureStore`, `createSlice` (tích hợp Immer), `createAsyncThunk` với `extraReducers`, Quản lý tài nguyên tĩnh (`public` vs `src/assets`), Icon barrel export, Reusable Button với icon props, SCSS modules.
- **D43**: RTK Query vs `createAsyncThunk`, **Redux Persist** (cache store vào localStorage, whitelist/blacklist state nhạy cảm), Luồng Authentication cơ bản, PrivateRoute (bảo vệ route, lưu previous location bằng `encodeURIComponent`).
- **D44**: **Kiến trúc Silent Refresh Token chuẩn Enterprise**: Axios Interceptor bắt `401 Unauthorized`, Hàng đợi Request (`failedQueue`), cờ khóa `isRefreshing`, cờ `_retry`, chống lặp vô hạn; Validate Form nâng cao với **React Hook Form + Yup** (`@hookform/resolvers/yup`), Debounce Async Validation (check trùng email/username), UX trong Form Design.
- **D45**: Production Hardening: **Error Boundaries** (bắt crash runtime), **Code Splitting & Lazy Loading** (`React.lazy` + `Suspense` + Skeleton fallback), **React Portal** (`createPortal` đưa modal ra ngoài hierarchy tránh lỗi `transform`/`overflow`), Infinite Loading (`react-intersection-observer`).
- **D46**: Redux Persist Advanced (mã hóa dữ liệu, xử lý fetching lock tránh gọi API 2 lần), SPA SEO (Pre-render Server với Headless Chrome, `react-helmet`, `robots.txt`, `sitemap.xml`), Motion Animation, Render an toàn HTML (`dangerouslySetInnerHTML` + `DOMPurify`), Slugify & Table of Contents tự động.
- **D47**: Tailwind CSS (v4 / Vite setup), React Compiler (`babel-plugin-react-compiler`), Responsive Design (Mobile-first, Container Queries `@container`), Dark mode biến thể CSS variables.
- **D48 - D49**: Component System cao cấp: So sánh UI libraries (MUI vs Radix vs Shadcn UI), Tiện ích `cn` (`clsx` + `twMerge`), `asChild` Slot pattern, Shadcn Primitives (Button, Input, NavigationMenu, Dialog), Kiến trúc tổng thể dự án lớn (Threads Clone case study: Layouts, Pages, Features, Tech Stack).

---

## Cấu trúc tài liệu tổng hợp Markdown (`Sum1.md`)

Tài liệu sẽ được chia làm **8 Module lớn**, mỗi module gồm:
1. **Lý thuyết cốt lõi & Tư duy kiến trúc** (Tại sao dùng? Khi nào dùng?).
2. **Code mẫu chuẩn (Best Practices)**: Trích xuất các snippet tối ưu nhất từ các bài học.
3. **Các bẫy thường gặp & Cách khắc phục (Gotchas & Antipatterns)**: Ví dụ trap closure, re-render lãng phí, vòng lặp refresh token vô hạn, memory leak khi thiếu cleanup...
4. **Quy chuẩn áp dụng vào Dự án Base**.

### Danh mục 8 Module trong tài liệu:
- **Module 1: Cấu trúc thư mục & Cấu hình môi trường Base**
  - Cấu trúc thư mục chuẩn mở rộng (Scalable Feature-based folder structure).
  - Vite Path Alias (`@/`), `jsconfig.json`, Eslint, Prettier.
  - Quản lý biến môi trường (`.env`, `.env.local`, `.env.production`).
  - React Compiler & StrictMode notes.
- **Module 2: Routing, Layout & Điều hướng trang**
  - React Router DOM v6+ data router / router config.
  - Hệ thống Layout đa dạng (`DefaultLayout`, `AuthLayout`, `BlankLayout`) kết hợp `<Outlet />`.
  - Dynamic Routes, Query Params, Scroll Restoration, Slug URL.
  - Private Route & Role-based Access Control (Ghi nhớ return URL).
- **Module 3: UI System, Styling & Animation**
  - Tailwind CSS + CSS Variables (Hỗ trợ Dark/Light mode chuẩn không giật chớp).
  - Shadcn UI foundation (`cn` utility với `clsx` + `twMerge`, Radix primitives, `asChild` pattern).
  - Asset Management (`public` vs `src/assets`, icon barrel exports).
  - React Portal cho Dialogs/Modals/Toasts.
  - Micro-animations với Motion & Headless styling.
- **Module 4: Quản lý Form & Validation Thực Chiến**
  - Controlled vs Uncontrolled Components, One-way binding mindset.
  - React Hook Form + Yup Resolver (`@hookform/resolvers/yup`).
  - Async Validation có Debounce (Check trùng username, email).
  - UX Form Best Practices (thời điểm báo lỗi, form submission feedback).
- **Module 5: State Management (Redux Toolkit & Persistence)**
  - Redux Core Mindset vs Redux Toolkit (RTK).
  - Cấu trúc `features/` với `createSlice` và selectors.
  - Async Thunk vs RTK Query (Khi nào dùng RTK Query, khi nào dùng `createAsyncThunk`).
  - Redux Persist (Lưu trữ an toàn, blacklist/whitelist state nhạy cảm, chống duplicate fetching).
- **Module 6: Network Layer & Kiến trúc Silent Refresh Token**
  - Axios Instance cấu hình chuẩn (`timeout`, `baseURL`, headers).
  - Request Interceptor: Tự động đính kèm Bearer Token.
  - Response Interceptor: Xử lý 401 với Refresh Token Queue (`failedQueue`, `isRefreshing`, cờ `_retry`).
  - API Service Pattern (Tách biệt service layer khỏi UI components).
- **Module 7: Tối ưu hiệu năng, Bảo mật & Xử lý lỗi**
  - Hook optimization (`useMemo`, `useCallback`, `useRef`, `useImperativeHandle`).
  - Code Splitting & Lazy Loading (`React.lazy` + `Suspense`).
  - Error Boundaries bảo vệ ứng dụng khỏi crash trắng trang.
  - An toàn bảo mật: XSS Prevention (`DOMPurify` với `dangerouslySetInnerHTML`), HttpOnly Cookie vs LocalStorage Token.
- **Module 8: Checklist từng bước xây dựng Dự án Base (Step-by-Step Guide)**
  - Thứ tự cài đặt và tích hợp từng thành phần vào dự án mới.

---

## Kế hoạch hành động cụ thể

### Giai đoạn 1: Soạn thảo toàn bộ tài liệu tổng hợp Markdown
- **Target File**: `d:\Desktop\Workspace\F8_Pro\Fullstack_Pro\ReactJs\threads-clone-ui\Sum1.md`
- Viết đầy đủ, súc tích, chuyên sâu, kèm theo các code mẫu thực tế lấy trực tiếp từ các dự án mẫu của khóa học.

### Giai đoạn 2: Lập kế hoạch từng bước đưa vào dự án Base
Sau khi bạn duyệt tài liệu tổng hợp, chúng ta sẽ bắt đầu từng bước thêm các module vào dự án base (chẳng hạn khởi tạo các thư mục, cấu hình, utils, http, auth, layout... trong `threads-clone-ui`):
1. **Bước 1**: Thiết lập Base Config (Vite alias, Tailwind, Lucide/Shadcn util `cn`).
2. **Bước 2**: Thiết lập Network Layer (Axios instance, Token Manager, Refresh Token Interceptor).
3. **Bước 3**: Thiết lập State Management (Redux Toolkit Store, Auth Slice, Persist).
4. **Bước 4**: Thiết lập Layout & Routing System (Default/Auth Layout, PrivateRoute, Suspense fallback).
5. **Bước 5**: Thiết lập Common UI Components & Utilities (Button, Input, Modal Portal, ErrorBoundary, Debounce hook).

---

## User Review Required
> [!IMPORTANT]
> 1. Tài liệu tổng hợp sẽ được ghi trực tiếp vào file [Sum1.md](file:///d:/Desktop/Workspace/F8_Pro/Fullstack_Pro/ReactJs/threads-clone-ui/Sum1.md) đang mở trên editor của bạn.
> 2. Bạn có muốn điều chỉnh thứ tự các mục kiến thức hoặc muốn tập trung sâu hơn vào phần nào (ví dụ: Refresh Token, Redux Toolkit, hay Shadcn UI)?
