# TỔNG HỢP KIẾN THỨC REACT TOÀN DIỆN & BLUEPRINT DỰ ÁN BASE
> **Mục tiêu**: Đóng gói toàn bộ kiến thức, kinh nghiệm thực chiến từ khóa học (D34 - D48) thành tài liệu cẩm nang chuẩn mực và định hình kiến trúc một **Dự án Base (Production-Ready React Base)** để tái sử dụng cho mọi dự án phát triển trong tương lai (threads-clone, dashboard, e-commerce, SaaS...).

---

## MỤC LỤC
1. [Tư Duy Kiến Trúc & Tổ Chức Dự Án](#1-tư-duy-kiến-trúc--tổ-chức-dự-án)
2. [Module 1: Thiết Lập Môi Trường & Cấu Hình Base](#module-1-thiết-lập-môi-trường--cấu-hình-base)
3. [Module 2: Routing, Layout & Điều Hướng Trang](#module-2-routing-layout--điều-hướng-trang)
4. [Module 3: UI System, Styling & Animation (Tailwind CSS + Shadcn UI)](#module-3-ui-system-styling--animation)
5. [Module 4: Quản Lý Form & Validation Thực Chiến (RHF + Yup)](#module-4-quản-lý-form--validation-thực-chiến)
6. [Module 5: Global State Management (Redux Toolkit & Persist)](#module-5-global-state-management-redux-toolkit--persist)
7. [Module 6: Network Layer & Kiến Trúc Silent Refresh Token](#module-6-network-layer--kiến-trúc-silent-refresh-token)
8. [Module 7: Tối Ưu Hiệu Năng, Bảo Mật & Production Hardening](#module-7-tối-ưu-hiệu-năng-bảo-mật--production-hardening)
9. [Module 8: Lộ Trình Từng Bước Tích Hợp Vào Dự Án Base](#module-8-lộ-trình-từng-bước-tích-hợp-vào-dự-án-base)
   - [Bước 7: Làm Đa Ngôn Ngữ Với react-i18next](#bước-7-làm-đa-ngôn-ngữ-với-react-i18next)
   - [Bước 8: Tích Hợp Dark Mode (ThemeProvider & ThemeToggle)](#bước-8-tích-hợp-dark-mode)

---

<a id="1-tư-duy-kiến-trúc--tổ-chức-dự-án"></a>
## 1. TƯ DUY KIẾN TRÚC & TỔ CHỨC DỰ ÁN

### 1.1. Triết lý phát triển
1. **Làm được đã rồi mới dùng công cụ**: Nắm chắc cơ chế JS thuần (Closure, Event Loop, Memory Heap) và React Core trước khi phụ thuộc vào thư viện.
2. **Tránh Over-engineering**: Không lạm dụng `useCallback`, `useMemo` cho các hàm hoặc tính toán quá nhẹ; Virtual DOM của React đã có thuật toán Diffing cực nhanh. Chỉ tối ưu khi thực sự có vấn đề về hiệu năng.
3. **Tách Component đúng lúc**: 
   - Tách khi xuất hiện lặp lại (>= 2 lần).
   - Tách khi file JSX quá dài (khó đọc, khó maintain).
   - Component con ở cấp cao hơn sẽ dùng được ở cấp thấp hơn; thư mục cùng cấp không nên phụ thuộc chéo để khi xóa không tạo code rác.
4. **Phân biệt `utils` vs `helpers`**:
   - `utils`: Bộ công cụ dùng chung cho toàn bộ dự án (`http.js`, `formatDate.js`, `validators.js`).
   - `helpers`: Hàm hỗ trợ riêng cho 1 tính năng hoặc 1 page/component cụ thể (đặt ngay bên trong thư mục page/feature đó).

### 1.2. Cấu trúc thư mục Scalable (Feature-Driven Architecture)
```text
src/
├── assets/                  # Tài nguyên tĩnh nội bộ
│   ├── icons/               # SVG / Icon components (export qua index.js)
│   └── images/              # Ảnh nội bộ (export qua index.js)
├── components/              # Reusable components dùng chung toàn dự án
│   ├── ui/                  # Shadcn primitives (button, input, dialog...)
│   ├── AppRoutes/           # Centralized routing configuration
│   ├── AuthProvider/        # Context/Wrapper kiểm tra phiên đăng nhập
│   ├── PrivateRoute/        # Guard bảo vệ route yêu cầu authentication
│   └── ErrorBoundary/       # Bắt crash runtime của ứng dụng
├── features/                # Chia theo nghiệp vụ (Feature/Domain-driven)
│   ├── auth/                # authSlice, hooks, selectors, services, types
│   ├── post/                # postSlice, hooks, postService
│   └── user/                # userSlice, userProfile...
├── hooks/                   # Custom hooks dùng chung (useDebounce, useInfinityLoad...)
├── layouts/                 # Hệ thống đa layout
│   ├── DefaultLayout/       # Header + Sidebar + Main content + Footer
│   ├── AuthLayout/          # Layout chuyên biệt cho Login, Register
│   └── BlankLayout/         # Full màn hình (404, Preview...)
├── lib/                     # Config thư viện ngoài (utils.js với hàm cn...)
├── locales/                 # Tài nguyên đa ngôn ngữ (i18n.js, vi/, en/)
│   ├── vi/                  # Từ điển tiếng Việt (common.json...)
│   └── en/                  # Từ điển tiếng Anh (common.json...)
├── pages/                   # Các trang ứng dụng (mỗi page chỉ lắp ráp components)
│   ├── Home/
│   ├── Auth/Login/
│   └── Profile/
├── services/                # API Services gọi qua axios client
│   ├── authService.js
│   └── postService.js
├── store/                   # Redux store & Redux persist setup
│   └── store.js
└── utils/                   # Công cụ toàn cục (http.js, validators.js...)
```

---

<a id="module-1-thiết-lập-môi-trường--cấu-hình-base"></a>
## MODULE 1: THIẾT LẬP MÔI TRƯỜNG & CẤU HÌNH BASE

### 1.1. Khởi tạo dự án chuẩn (Vite + React 19)
- Sử dụng Vite để khởi tạo dự án với tốc độ HMR nhanh nhất:
```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
```

### 1.2. Cấu hình Path Alias `@/`
Tránh việc import tương đối rối rắm như `../../components/Button`:

**File: `vite.config.js`**
```javascript
import path from 'path';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }), // Bật React Compiler tự động tối ưu useMemo/useCallback
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**File: `jsconfig.json`** (Để VS Code / IDE tự gợi ý đường dẫn):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 1.3. Quản lý biến môi trường (Environment Variables) & Bảo mật Git
- Tiền tố bắt buộc trong Vite: `VITE_` (truy cập trong code qua `import.meta.env.VITE_...`).
- **Thứ tự ưu tiên của Vite**: `.env.[mode].local` > `.env.local` > `.env.[mode]` > `.env`.
- **Phân tách các file môi trường**:
  - `.env.example`: File **mẫu** khai báo danh sách key (giá trị rỗng hoặc URL mock mẫu). **Bắt buộc commit lên Git** để các thành viên khác khi clone code về biết cần thiết lập những biến nào.
  - `.env`: File cấu hình chung cục bộ.
  - `.env.local`: File cấu hình ghi đè (override) riêng cho từng máy dev.
  - `.env.development` / `.env.production`: Môi trường dev hoặc production cụ thể khi build (`vite build --mode production`).
- **Quy tắc bảo mật Git (CỰC KỲ QUAN TRỌNG)**:
  - Mặc định template Vite chỉ ignore `*.local` nên file `.env` rất dễ bị vô tình commit lên Git (`git add .`).
  - **Bắt buộc thêm `.env` vào `.gitignore`**:
    ```gitignore
    # Environment variables
    .env
    .env.*
    !.env.example
    *.local
    ```
- **Cảnh báo bảo mật**: Khi chạy `npm run build`, Vite sẽ compile và nhúng tĩnh (hardcode) tất cả biến có tiền tố `VITE_` vào mã nguồn JS (`/dist`). Bất kỳ ai mở F12 cũng xem được. Do đó: **Tuyệt đối KHÔNG lưu Private Secret Key, Database Password, Payment Secret Key trong file `.env` của frontend!**

### 1.4. React Compiler & StrictMode
- **StrictMode**: Trong môi trường Dev (`npm run dev`), React sẽ render component 2 lần để phát hiện side-effects không tinh khiết và memory leaks. Không xảy ra trên Production.
- **React Compiler (`babel-plugin-react-compiler`)**: Tự động phân tích và bọc `useMemo`, `useCallback` ở cấp độ compile, giảm tải gánh nặng tối ưu thủ công cho lập trình viên.

---

<a id="module-2-routing-layout--điều-hướng-trang"></a>
## MODULE 2: ROUTING, LAYOUT & ĐIỀU HƯỚNG TRANG

### 2.1. React Router DOM (v6 / v7) Architecture
- Cài đặt: `npm i react-router-dom` (hoặc `react-router`).
- **Tư duy Layout**:
  - Web hiện đại luôn có ít nhất 2 layout: `DefaultLayout` (Header, Sidebar, Navigation) và `AuthLayout` (cho đăng nhập, đăng ký).
  - Sử dụng `<Outlet />` trong Layout cha để hiển thị nội dung động của Route con.

```jsx
// layouts/DefaultLayout/index.jsx
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Outlet } from 'react-router-dom';

export default function DefaultLayout() {
  return (
    <div className="app-layout">
      <Header />
      <div className="main-container">
        <Sidebar />
        <main className="content">
          <Outlet /> {/* Nơi page con được render */}
        </main>
      </div>
    </div>
  );
}
```

### 2.2. Điều hướng & Quản lý URL
- `useParams`: Lấy param động trên đường dẫn (`/news/:id` hoặc `/post/:slug`).
- `useSearchParams`: Quản lý query string (`?page=1&sort=desc&tab=settings`). Sử dụng `params.set()` và `setSearchParams(params)` để không ghi đè mất các param khác.
- `useNavigate`: Điều hướng theo luồng logic trong code (sau khi submit form, click handler...).
- `<Navigate to="..." replace />`: Điều hướng trực tiếp trong quá trình render (thường dùng trong Route Guard).

### 2.3. SEO Slug URLs
- Sử dụng chuỗi định danh slug thân thiện (`react-19-nang-cao`) thay vì số ID thô (`/post/102`).
- Dùng thư viện `slugify` để tạo slug chuẩn SEO từ tiêu đề bài viết.

### 2.4. Private Route & Lưu Vết Trang Đăng Nhập
Khi user truy cập trang bảo vệ (ví dụ: `/profile`) mà chưa đăng nhập:
1. Lưu lại đường dẫn hiện tại vào URL login dưới dạng param (`continue` hoặc `redirect`).
2. Mã hóa đường dẫn bằng `encodeURIComponent` để tránh lỗi ký tự đặc biệt (`/`).
3. Sau khi login thành công, chuyển hướng user trở lại chính xác trang họ đang muốn vào.

```jsx
// components/PrivateRoute/index.jsx
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function PrivateRoute() {
  const { pathname } = useLocation();
  const { currentUser, fetching } = useSelector((state) => state.auth);

  if (fetching && !currentUser) {
    return <div className="loading-spinner">Đang xác thực...</div>;
  }

  if (!currentUser) {
    return <Navigate to={`/login?continue=${encodeURIComponent(pathname)}`} replace />;
  }

  return <Outlet />;
}
```

---

<a id="module-3-ui-system-styling--animation"></a>
## MODULE 3: UI SYSTEM, STYLING & ANIMATION

### 3.1. Tailwind CSS v4 & Thiết Kế Tokens
- Tích hợp nhanh với `@tailwindcss/vite`:
```bash
npm i tailwindcss @tailwindcss/vite
```
- **File: `src/index.css`**:
```css
@import "tailwindcss";

@theme {
  --color-primary: #000000;
  --color-secondary: #777777;
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```
- **Quy tắc Responsive**: Thiết kế Mobile-first.
  - Không prefix: Áp dụng cho Mobile.
  - `sm:` (≥ 640px), `md:` (≥ 768px), `lg:` (≥ 1024px), `xl:` (≥ 1280px).
  - `@container`: Responsive dựa trên kích thước của thẻ cha gần nhất thay vì toàn màn hình.

### 3.2. Hệ Thống Dark/Light Mode Chống Nhấp Nháy (Anti-Flicker)
> [!IMPORTANT]
> **Vấn đề**: Nếu dùng `useState`/`Context API` để đặt theme trong React, khi user F5 trang web sẽ bị giật chớp (màn hình trắng nháy lên trước khi chuyển sang đen).
> **Giải pháp**: Đặt script đồng bộ ở cuối thẻ `<head>` trong file `index.html` để can thiệp class trước khi body bắt đầu parse:

```html
<!-- index.html -->
<head>
  <script>
    if (
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  </script>
</head>
```

### 3.3. Shadcn UI Architecture & Tiện Ích `cn`
Shadcn không phải component library thông thường (không đóng gói vào `node_modules` như MUI/AntD) mà cung cấp mã nguồn trực tiếp vào dự án để ta toàn quyền tùy biến.

**Hàm hợp nhất class `cn` (`src/lib/utils.js`)**:
```javascript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs)); // clsx lọc class falsy, twMerge loại bỏ xung đột CSS Tailwind
}
```

**Pattern `asChild` (Radix Slot)**:
Cho phép Component giữ nguyên style và hành vi của Button nhưng render ra thẻ khác (như thẻ `<a>` hoặc `<Link>`):
```jsx
<Button asChild variant="outline">
  <Link to="/home">Về trang chủ</Link>
</Button>
```

### 3.4. Quản Lý File Tĩnh & React Portal
- **Ảnh tĩnh**:
  - `public/`: Giữ nguyên URL khi build (dùng cho favicon, robots.txt, ảnh preview share mạng xã hội).
  - `src/assets/`: Được Vite hash tên và tối ưu dung lượng (dùng cho ảnh component, logo). Tạo `index.js` làm barrel export để import gọn gàng.
- **React Portal (`createPortal`)**:
  - Đưa Modal/Dialog render trực tiếp vào thẻ `document.body` (hoặc `#modal-root`), tránh bị ảnh hưởng bởi thuộc tính `transform`, `overflow: hidden`, `z-index` của component cha.

### 3.5. Hệ Thống Icon: Lucide React vs Font Awesome
- **Lucide Icons**: Mặc định đi kèm Shadcn UI, import theo dạng React Component (`import { Heart, Search } from 'lucide-react'`).
- **Font Awesome**: Hệ thống icon phong phú bậc nhất, chia thành các gói chuyên biệt:
  - `free-solid-svg-icons`: Các biểu tượng nét đặc (Solid).
  - `free-regular-svg-icons`: Các biểu tượng nét viền mảnh (Regular).
  - `free-brands-svg-icons`: Các logo thương hiệu / mạng xã hội (Instagram, Google, Github, Facebook...).
  - Render thông qua `<FontAwesomeIcon icon={...} />`, nhận màu sắc tự động qua class Tailwind (`text-red-500`, `hover:text-blue-500`).

### 3.6. Hiệu Ứng Chuyển Động (Animation) Với Motion
- Cài đặt: `npm i motion`
- **Tư duy thực chiến**: Là thư viện làm Animation hiện đại, mạnh mẽ (bản nâng cấp gọn nhẹ từ Framer Motion).
- **Nguyên tắc cốt lõi**: *"Dùng nơi cần dùng, không lạm dụng"* — chỉ nên áp dụng cho micro-interactions (hover, active nút bấm), modal popup xuất hiện hoặc chuyển tab mượt mà. Lạm dụng quá đà sẽ làm lag giao diện và giảm trải nghiệm người dùng (UX).
- **Cơ chế**: Khai báo declarative qua component `motion.div`, `motion.button`... với các props trực quan:
  - `initial`: Trạng thái ban đầu trước khi mount (ví dụ: `{ opacity: 0, y: 20 }`).
  - `animate`: Trạng thái đích sau khi mount (ví dụ: `{ opacity: 1, y: 0 }`).
  - `transition`: Thời gian và đường cong chuyển động (ví dụ: `{ duration: 0.3, ease: 'easeOut' }`).
  - `whileHover`, `whileTap`: Tương tác vi mô khi rê chuột hoặc click.

---

<a id="module-4-quản-lý-form--validation-thực-chiến"></a>
## MODULE 4: QUẢN LÝ FORM & VALIDATION THỰC CHIẾN

### 4.1. Tư Duy Form Trong React
- **One-way Data Binding**: Dữ liệu đi 1 chiều: Input event -> Cập nhật State -> State truyền ngược lại vào `value`.
- **Gom state form**:
  - Khi form có 5-10 trường: Gom thành 1 object `formValues` thay vì khai báo 10 cái `useState`.
  - Khi form lớn hoặc phức tạp: Dùng **React Hook Form (RHF)** để không bị re-render toàn bộ form mỗi lần user gõ phím.

### 4.2. React Hook Form + Yup Resolver
Cài đặt:
```bash
npm i react-hook-form @hookform/resolvers yup
```

**Triển khai Form chuẩn mẫu**:
```jsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const loginSchema = yup.object().shape({
  email: yup.string().required('Email không được để trống').email('Email không đúng định dạng'),
  password: yup.string().required('Mật khẩu không được để trống').min(6, 'Tối thiểu 6 ký tự'),
});

export default function LoginForm({ onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur', // Chỉ validate khi user đã rời khỏi ô input (Tối ưu UX)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input {...register('email')} className="w-full border p-2 rounded" />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Mật khẩu</label>
        <input type="password" {...register('password')} className="w-full border p-2 rounded" />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      <button disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>
    </form>
  );
}
```

### 4.3. Kỹ Thuật Debounce Custom Hook
Dùng cho ô tìm kiếm (Search) hoặc Async validation (kiểm tra username/email đã tồn tại hay chưa mà không spam API server):

```javascript
// hooks/useDebounce.js
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler); // Cleanup timer cũ nếu user gõ tiếp
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### 4.4. Tâm Lý Học & Best Practices trong Thiết Kế Form UX
1. **Không báo lỗi quá sớm**: Tránh báo lỗi đỏ lòm khi người dùng mới gõ được 1 ký tự (`mode: 'onBlur'` hoặc debounce).
2. **Nút Hoàn Tác (Undo) thay vì Modal Confirm**: Với các thao tác xóa thông thường, hãy xóa mềm và hiện Toast "Đã xóa - [Hoàn tác]" giúp người dùng tiết kiệm 1 cú click.
3. **Thao tác nguy hiểm**: Đặt nút "Hủy" ở vị trí thuận tay (Primary), nút "Xóa vĩnh viễn" ngả về hướng khó bấm nhầm hơn.

---

<a id="module-5-global-state-management-redux-toolkit--persist"></a>
## MODULE 5: GLOBAL STATE MANAGEMENT (REDUX TOOLKIT & PERSIST)

### 5.1. Khi Nào Dùng Context API vs Redux Toolkit?
- **Context API**: Phù hợp với state ít thay đổi (Theme Light/Dark, Ngôn ngữ i18n). Dùng cho state phức tạp sẽ bị tình trạng *Wrapper Hell* và gây re-render diện rộng cho các component con.
- **Redux Toolkit (RTK)**: Phù hợp với toàn bộ dữ liệu nghiệp vụ của ứng dụng (Auth, Giỏ hàng, Thông tin User, Danh sách bài viết). Hỗ trợ DevTools, Slice độc lập và cơ chế `useSelector` chỉ re-render component khi slice cụ thể thay đổi.

### 5.2. Cấu Trúc Slice Chuẩn Doanh Nghiệp (Feature Slice)
```javascript
// features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { loginThunk, getMeThunk } from './authService';

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  fetching: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    setFetching: (state, action) => {
      state.fetching = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.fetching = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.fetching = false;
        state.currentUser = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.fetching = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setFetching } = authSlice.actions;
export default authSlice.reducer;
```

### 5.3. Redux Persist & Xử Lý Blacklist Tránh Bug Duplicate
Cài đặt:
```bash
npm i redux-persist
```
- **Kinh nghiệm thực chiến**: Khi F5 trang web, Redux Persist khôi phục dữ liệu từ `localStorage`.
- **Lưu ý 1 - Blacklist trạng thái loading**: Trạng thái `fetching` và `loading` **bắt buộc phải đưa vào `blacklist`**. Nếu lưu cả `fetching: true`, khi F5 trang web state sẽ mãi mãi kẹt ở loading!
- **Lưu ý 2 - Lỗi tương thích Vite ESM (`storage.getItem is not a function`)**:
  > [!WARNING]
  > **Bẫy lỗi kinh điển với Vite**: `Uncaught TypeError: storage.getItem is not a function` hoặc `storage.setItem is not a function`.
  > - **Nguyên nhân**: `redux-persist` là thư viện đóng gói dạng CommonJS (CJS). Khi chạy trong môi trường thuần ES Modules (ESM) của Vite, câu lệnh `import storage from "redux-persist/lib/storage"` sẽ import vào một đối tượng bọc có dạng `{ default: { getItem, setItem, ... } }`. Khi truyền trực tiếp `storage` này vào `persistReducer`, hàm `storage.getItem` không tồn tại ở cấp root, gây ra crash trắng trang.
  > - **Giải pháp chuẩn**:
  >   ```javascript
  >   import storageModule from "redux-persist/lib/storage";
  >   import authReducer from "@/features/auth/authSlice";
  >
  >   // Khắc phục tương thích ESM của Vite với redux-persist (tránh lỗi TypeError: storage.getItem is not a function)
  >   const storage = storageModule.default ?? storageModule;
  >   ```

```javascript
// store/store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storageModule from 'redux-persist/lib/storage';
import authReducer from '@/features/auth/authSlice';

// Khắc phục tương thích Vite ESM (tránh TypeError: storage.getItem is not a function)
const storage = storageModule.default ?? storageModule;

// Cấu hình riêng cho Auth: Không persist biến fetching
const authPersistConfig = {
  key: 'auth',
  storage,
  blacklist: ['fetching', 'error'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Bắt buộc tắt với redux-persist
    }),
});

export const persistor = persistStore(store);
```

---

<a id="module-6-network-layer--kiến-trúc-silent-refresh-token"></a>
## MODULE 6: NETWORK LAYER & KIẾN TRÚC SILENT REFRESH TOKEN

### 6.1. Quy Trình Xác Thực (Authentication Flow)
1. User đăng nhập -> Server trả về `accessToken` (thời hạn ngắn, vd: 15-60 phút) và `refreshToken` (thời hạn dài, vd: 7-30 ngày).
2. Client lưu `accessToken` và đính kèm vào Header `Authorization: Bearer <token>` ở mỗi request.
3. Khi `accessToken` hết hạn, Server trả về lỗi `401 Unauthorized`.
4. Client chặn lỗi này tại **Axios Interceptor**:
   - Không được logout người dùng ngay lập tức!
   - Âm thầm (Silent) gửi `refreshToken` lên để lấy cặp token mới.
   - Gọi lại (Retry) các API đã bị lỗi trước đó.
   - Nếu `refreshToken` cũng hết hạn -> Thực hiện đăng xuất hoàn toàn.

### 6.2. Mã Nguồn Axios Interceptor Đẳng Cấp Doanh Nghiệp
Xử lý đồng thời:
- Hàng đợi `failedQueue` gom các request lỗi trong lúc đang refresh.
- Cờ `isRefreshing` ngăn chặn việc gọi refresh token nhiều lần.
- Cờ `_retry` chống đệ quy lặp vô tận.

**File: `src/utils/http.js`**
```javascript
import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_API || 'http://localhost:3000/api';

export const httpClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Tự động đính kèm Token
httpClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 2. Logic xử lý Silent Refresh Token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

httpClient.interceptors.response.use(
  (response) => response.data, // Trả trực tiếp data, bỏ bọc thừa
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra lỗi 401 và chưa từng retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Đã có request trước đó đang đi refresh -> Đưa request này vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return httpClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = localStorage.getItem('refreshToken');
      if (!currentRefreshToken) {
        // Không có refresh token -> Buộc đăng xuất
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Gọi thẳng bằng axios thuần để tránh interceptor chặn lặp
        const res = await axios.post(`${baseURL}/auth/refresh-token`, {
          refresh_token: currentRefreshToken,
        });

        const { access_token, refresh_token } = res.data.data;
        localStorage.setItem('accessToken', access_token);
        if (refresh_token) {
          localStorage.setItem('refreshToken', refresh_token);
        }

        httpClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Wrapper tiện ích
const http = {
  get: (url, config) => httpClient.get(url, config),
  post: (url, data, config) => httpClient.post(url, data, config),
  put: (url, data, config) => httpClient.put(url, data, config),
  patch: (url, data, config) => httpClient.patch(url, data, config),
  delete: (url, config) => httpClient.delete(url, config),
};

export default http;
```

---

<a id="module-7-tối-ưu-hiệu-năng-bảo-mật--production-hardening"></a>
## MODULE 7: TỐI ƯU HIỆU NĂNG, BẢO MẬT & PRODUCTION HARDENING

### 7.1. Tránh Bẫy Closure & Sử Dụng Hooks Đúng Cách
- **Closure Trap trong `useCallback` / `useEffect`**: Nếu không khai báo biến phụ thuộc vào mảng dependencies `[]`, hàm sẽ ghi nhớ giá trị cũ của biến ở lần render đầu tiên (stale state).
- **`useRef`**: 
  - Lưu tham chiếu phần tử DOM thật (`ref.current.focus()`).
  - Lưu trữ giá trị qua các lần render **mà không gây re-render component**.
- **`useImperativeHandle` + `forwardRef`**: Cho phép component cha gọi trực tiếp một số hàm do component con cung cấp (ví dụ: `formRef.current.reset()`).

### 7.2. Error Boundary (Chống Trắng Trang Khi Crash)
Trong Functional Component chưa có hook thay thế cho Error Boundary, do đó bắt buộc phải dùng Class Component:

```jsx
// components/ErrorBoundary/index.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Crash caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-100 p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Đã có lỗi xảy ra!</h2>
          <p className="text-gray-600 mb-4">Giao diện gặp sự cố ngoài ý muốn. Vui lòng thử tải lại trang.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 7.3. Code Splitting & Lazy Loading (`React.lazy` + `Suspense`)
- Chia nhỏ bundle JS thành các chunk riêng biệt cho từng trang.
- Chỉ tải mã nguồn khi người dùng thực sự truy cập vào trang đó:

```jsx
import React, { Suspense, lazy } from 'react';

const HomePage = lazy(() => import('@/pages/Home'));
const ProfilePage = lazy(() => import('@/pages/Profile'));

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải trang...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Suspense>
  );
}
```

### 7.4. Bảo Mật XSS (Cross-Site Scripting)
Khi hiển thị nội dung HTML nhận về từ API (ví dụ: nội dung bài viết, bình luận có markdown/html), tuyệt đối không dùng trực tiếp `dangerouslySetInnerHTML` mà phải làm sạch bằng thư viện `DOMPurify`:
```bash
npm i dompurify
```
```jsx
import DOMPurify from 'dompurify';

export function SafeHtml({ content }) {
  const cleanHtml = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}
```

---

<a id="module-8-lộ-trình-từng-bước-tích-hợp-vào-dự-án-base"></a>
## MODULE 8: LỘ TRÌNH TỪNG BƯỚC TÍCH HỢP VÀO DỰ ÁN BASE
> *(Mã nguồn hoàn chỉnh 100% Copy-Paste Ready, đầy đủ file và lệnh cài đặt)*

Dưới đây là cẩm nang hướng dẫn triển khai thực tế từ đầu (A-Z) để dựng bộ khung **Production-Ready React Base**. Mỗi bước đều bao gồm:
1. **Lệnh cài đặt thư viện chính xác**.
2. **Đường dẫn file cụ thể**.
3. **Mã nguồn hoàn chỉnh 100%** (chỉ cần copy & paste, không có code dở dang hay placeholder).

---

### BƯỚC 1: CẤU TRÚC THƯ MỤC CHUẨN, ALIAS `@/` & DESIGN SYSTEM

#### 1.1. Tạo cấu trúc thư mục chuẩn (Scalable Folder Architecture)
Khi bắt đầu một dự án React thực chiến, việc đầu tiên là thiết lập khung cây thư mục chuẩn mực theo tính năng (Feature-based) để dự án luôn ngăn nắp, dễ mở rộng và tái sử dụng cho mọi dự án sau này.

**Sơ đồ cấu trúc thư mục chuẩn trong `src/`**:
```text
src/
├── assets/             # File tĩnh nội bộ (icons, images - export qua barrel index.js)
│   ├── icons/
│   └── images/
├── components/         # Reusable components dùng chung toàn dự án
│   └── ui/             # Shadcn primitives (drawer, dialog, button...)
├── features/           # Chia theo nghiệp vụ thực tế (auth, post, user...)
│   └── auth/           # authSlice.js, authService.js, selectors.js
├── hooks/              # Custom hooks dùng chung (useDebounce, useInfinityLoad...)
├── layouts/            # Hệ thống layout giao diện (DefaultLayout, AuthLayout...)
│   ├── DefaultLayout/
│   └── AuthLayout/
├── lib/                # Cấu hình thư viện ngoài (utils.js chứa hàm cn...)
├── locales/            # Đa ngôn ngữ (i18n.js, vi/, en/)
│   ├── vi/             # Từ điển tiếng Việt (common.json...)
│   └── en/             # Từ điển tiếng Anh (common.json...)
├── pages/              # Các màn hình ứng dụng (Home, Login, Profile, NotFound...)
│   ├── Home/
│   ├── Auth/Login/
│   ├── Profile/
│   └── NotFound/
├── routes/             # Cấu hình định tuyến tập trung (AppRoutes.jsx)
├── services/           # Network API services (authService.js, postService.js...)
├── store/              # Redux Store & Redux Persist (store.js)
└── utils/              # Bộ công cụ tiện ích toàn cục (http.js, validators.js...)
```

**Lệnh tạo nhanh toàn bộ thư mục chỉ bằng 1 dòng lệnh**:
- **Dành cho Windows PowerShell**:
```powershell
New-Item -ItemType Directory -Force -Path src/assets/icons, src/assets/images, src/components/ui, src/features/auth, src/hooks, src/layouts/DefaultLayout, src/layouts/AuthLayout, src/lib, src/locales/vi, src/locales/en, src/pages/Home, src/pages/Auth/Login, src/pages/Profile, src/pages/NotFound, src/routes, src/services, src/store, src/utils
```
- **Dành cho Git Bash / macOS / Linux**:
```bash
mkdir -p src/{assets/{icons,images},components/ui,features/auth,hooks,layouts/{DefaultLayout,AuthLayout},lib,locales/{vi,en},pages/{Home,Auth/Login,Profile,NotFound},routes,services,store,utils}
```

#### 1.2. Cài đặt thư viện tiện ích & styling
Chạy lệnh sau tại thư mục gốc của dự án:
```bash
npm i clsx tailwind-merge lucide-react
npm i -D tailwindcss @tailwindcss/vite
```

#### 1.3. Cấu hình Path Alias `@/` & Plugins trong `vite.config.js`
Tạo/Cập nhật file: `vite.config.js`
```javascript
import path from 'path';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }), // Kích hoạt React Compiler (React 19)
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### 1.4. Cấu hình gợi ý đường dẫn trong `jsconfig.json`
Tạo file: `jsconfig.json` ở thư mục gốc (ngang hàng `package.json`):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

#### 1.5. Cấu hình Design Tokens & Tailwind CSS tại `src/index.css`
Tạo/Ghi đè file: `src/index.css`
```css
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --border: 0 0% 89.8%;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --border: 0 0% 14.9%;
  }

  * {
    border-color: hsl(var(--border));
  }

  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    min-height: 100vh;
  }
}
```

#### 1.6. Tạo hàm hợp nhất class `cn` tại `src/lib/utils.js`
Tạo file: `src/lib/utils.js`
```javascript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tiện ích gom nhóm và xử lý xung đột class Tailwind CSS
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

#### 1.7. Chống nhấp nháy Dark Mode tại `index.html`
Mở `index.html`, thêm đoạn script sau vào ngay trước thẻ đóng `</head>`:
```html
    <!-- Chống chớp trắng khi refresh trang ở chế độ Dark Mode -->
    <script>
      (function() {
        const theme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (theme === 'dark' || (!theme && systemDark)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      })();
    </script>
  </head>
```

---

### BƯỚC 2: NETWORK LAYER & SILENT REFRESH TOKEN (AXIOS ENTERPRISE)

#### 2.1. Cài đặt Axios
```bash
npm i axios
```

#### 2.2. Khai báo biến môi trường & Bảo mật Git
Tạo file: `.env.example` ở thư mục gốc (file mẫu commit lên Git):
```env
VITE_BASE_API=http://localhost:3000/api
```

Tạo file: `.env` hoặc `.env.local` ở thư mục gốc (file thật chạy máy cá nhân):
```env
VITE_BASE_API=http://localhost:3000/api
```

Cập nhật file `.gitignore` để tránh đẩy `.env` lên GitHub/GitLab:
```gitignore
# Environment variables
.env
.env.*
!.env.example
*.local
```

#### 2.3. Tạo Client HTTP hoàn chỉnh tại `src/utils/http.js`
File này đã tích hợp sẵn:
- Tự động gắn Access Token vào header mỗi request.
- Hàng đợi `failedQueue` gom các request song song khi token hết hạn.
- Cờ `isRefreshing` ngăn gọi refresh token nhiều lần.
- Cờ `_retry` chống đệ quy lặp vô tận.

Tạo file: `src/utils/http.js`
```javascript
import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_API || 'http://localhost:3000/api';

export const httpClient = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Tự động đính kèm Bearer Token
httpClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Logic xử lý Silent Refresh Token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 3. Response Interceptor: Xử lý 401 Unauthorized
httpClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp response.data để components không cần .data lặp lại
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Đã có request trước đó kích hoạt refresh -> đưa request này vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return httpClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // Không có refresh token -> xóa cache và đá về login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = `/login?continue=${encodeURIComponent(window.location.pathname)}`;
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh bằng axios độc lập (không đi qua httpClient để tránh interceptor chặn)
        const res = await axios.post(`${baseURL}/auth/refresh-token`, {
          refresh_token: refreshToken,
        });

        // Tùy theo cấu trúc response trả về của backend (vd: res.data.data hoặc res.data)
        const data = res.data?.data || res.data;
        const newAccessToken = data.access_token || data.accessToken;
        const newRefreshToken = data.refresh_token || data.refreshToken;

        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        httpClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return httpClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = `/login?continue=${encodeURIComponent(window.location.pathname)}`;
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Wrapper tiện ích xuất ra ngoài
const http = {
  get: (url, config) => httpClient.get(url, config),
  post: (url, data, config) => httpClient.post(url, data, config),
  put: (url, data, config) => httpClient.put(url, data, config),
  patch: (url, data, config) => httpClient.patch(url, data, config),
  delete: (url, config) => httpClient.delete(url, config),
};

export default http;
```

---

### BƯỚC 3: STATE MANAGEMENT (REDUX TOOLKIT & REDUX PERSIST)

#### 3.1. Cài đặt Redux dependencies
```bash
npm i @reduxjs/toolkit react-redux redux-persist
```

#### 3.2. Tạo Auth Slice tại `src/features/auth/authSlice.js`
Tạo file: `src/features/auth/authSlice.js`
```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  fetching: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.currentUser = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
      if (action.payload.accessToken) {
        localStorage.setItem('accessToken', action.payload.accessToken);
      }
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    setFetching: (state, action) => {
      state.fetching = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateCurrentUser: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
  },
});

export const { loginSuccess, logout, setFetching, setError, updateCurrentUser } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthFetching = (state) => state.auth.fetching;

export default authSlice.reducer;
```

#### 3.3. Tạo Redux Store với Redux Persist tại `src/store/store.js`
> [!IMPORTANT]
> - **Quy tắc 1 (Tương thích Vite ESM)**: Do `redux-persist` là CommonJS, bắt buộc import `storageModule` và gán `const storage = storageModule.default ?? storageModule;` để tránh lỗi crash trắng trang `storage.getItem is not a function`.
> - **Quy tắc 2 (Blacklist loading state)**: Bắt buộc thêm `blacklist: ['fetching', 'error']` vào cấu hình persist của Auth để không lưu lại trạng thái đang tải vào `localStorage`, tránh lỗi treo loading khi F5.

Tạo file: `src/store/store.js`
```javascript
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storageModule from 'redux-persist/lib/storage';
import authReducer from '@/features/auth/authSlice';

// Khắc phục tương thích Vite ESM (tránh TypeError: storage.getItem is not a function)
const storage = storageModule.default ?? storageModule;

// Cấu hình riêng cho Auth Slice
const authPersistConfig = {
  key: 'auth',
  storage,
  blacklist: ['fetching', 'error'], // KHÔNG persist trạng thái loading/fetching
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Bắt buộc tắt check serializable để tương thích redux-persist
    }),
});

export const persistor = persistStore(store);
```

#### 3.4. Bọc Redux Provider & PersistGate tại `src/main.jsx`
Cập nhật file: `src/main.jsx`
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/store';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div className="p-4 text-center">Đang khởi tạo...</div>} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
```

---

### BƯỚC 4: ROUTING, ĐA LAYOUT & ERROR BOUNDARY

#### 4.1. Cài đặt React Router DOM
```bash
npm i react-router-dom
```

#### 4.2. Tạo Error Boundary tại `src/components/ErrorBoundary/index.jsx`
Tạo file: `src/components/ErrorBoundary/index.jsx`
```jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary phát hiện lỗi runtime:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50 dark:bg-zinc-950">
          <div className="max-w-md p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-red-200 dark:border-red-950">
            <h2 className="text-xl font-bold text-red-600 mb-2">Đã xảy ra sự cố!</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Giao diện gặp lỗi ngoài ý muốn. Vui lòng thử tải lại trang hoặc quay về trang chủ.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity"
              >
                Tải lại trang
              </button>
              <a
                href="/"
                className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Về trang chủ
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### 4.3. Tạo Private Route Guard tại `src/components/PrivateRoute/index.jsx`
Tạo file: `src/components/PrivateRoute/index.jsx`
```jsx
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectCurrentUser, selectAuthFetching } from '@/features/auth/authSlice';

export default function PrivateRoute() {
  const location = useLocation();
  const currentUser = useSelector(selectCurrentUser);
  const fetching = useSelector(selectAuthFetching);

  if (fetching && !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-75">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin dark:border-zinc-700 dark:border-t-white" />
      </div>
    );
  }

  if (!currentUser) {
    // Lưu lại pathname hiện tại để sau khi đăng nhập có thể quay lại đúng trang
    return <Navigate to={`/login?continue=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Outlet />;
}
```

#### 4.4. Tạo các Layouts
Tạo file: `src/layouts/DefaultLayout/index.jsx`
```jsx
import { Outlet, Link } from 'react-router-dom';

export default function DefaultLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-black dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight">BaseApp</Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300">Trang chủ</Link>
          <Link to="/profile" className="hover:text-gray-600 dark:hover:text-gray-300">Hồ sơ</Link>
          <Link to="/login" className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black">Đăng nhập</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-zinc-800 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} BaseApp. All rights reserved.
      </footer>
    </div>
  );
}
```

Tạo file: `src/layouts/AuthLayout/index.jsx`
```jsx
import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
      <div className="mb-6">
        <Link to="/" className="text-2xl font-black tracking-wider">BaseApp</Link>
      </div>
      <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <Outlet />
      </div>
    </div>
  );
}
```

#### 4.5. Thiết lập Centralized Routes tại `src/routes/AppRoutes.jsx`
Tạo file: `src/routes/AppRoutes.jsx`
```jsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import DefaultLayout from '@/layouts/DefaultLayout';
import AuthLayout from '@/layouts/AuthLayout';
import PrivateRoute from '@/components/PrivateRoute';

// Code Splitting / Lazy Loading các Pages
const HomePage = lazy(() => import('@/pages/Home'));
const ProfilePage = lazy(() => import('@/pages/Profile'));
const LoginPage = lazy(() => import('@/pages/Auth/Login'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-75">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin dark:border-zinc-700 dark:border-t-white" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes với DefaultLayout */}
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<HomePage />} />

          {/* Protected Routes cần đăng nhập */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Auth Routes với AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* 404 Not Found Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
```

#### 4.6. Kết nối `AppRoutes` và `ErrorBoundary` vào `src/App.jsx`
Cập nhật file: `src/App.jsx`
```jsx
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import AppRoutes from '@/routes/AppRoutes';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
```

---

### BƯỚC 5: TÍCH HỢP UI COMPONENT (SHADCN UI) & ICON SYSTEM (FONT AWESOME)

Không cần phải tự viết thủ công và bảo trì hàng trăm dòng code cho các component UI (Modal, Dialog, Button...), ta chỉ cần dùng trực tiếp CLI chính thức của **Shadcn UI** để tự động kéo code chuẩn về dự án, kết hợp cùng hệ thống icon **Font Awesome**:

#### 5.1. Khởi tạo Shadcn UI (chạy 1 lần nếu dự án mới chưa khởi tạo)
```bash
npx shadcn@latest init
```

#### 5.2. Thêm component Drawer
Chỉ cần chạy lệnh sau là đủ:
```bash
npx shadcn@latest add drawer
```
> *(Nếu dự án cần thêm các component khác, chỉ cần chạy thêm: `npx shadcn@latest add button input dialog`...)*

#### 5.3. Ví dụ sử dụng Drawer (`src/components/DemoDrawer.jsx`)
Sau khi chạy lệnh, Shadcn sẽ tự động tạo file `src/components/ui/drawer.jsx`. Ví dụ sử dụng:
```jsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function DemoDrawer() {
  return (
    <Drawer>
      <DrawerTrigger className="px-4 py-2 text-sm font-medium rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity cursor-pointer">
        Mở Drawer
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm p-6">
          <DrawerHeader>
            <DrawerTitle>Tiêu đề Drawer</DrawerTitle>
            <DrawerDescription>Nội dung hiển thị dạng ngăn kéo trượt (tối ưu UX cho mobile/web).</DrawerDescription>
          </DrawerHeader>
          <div className="py-4 text-sm text-gray-500">
            Nội dung chi tiết (form, danh sách thao tác, bình luận, v.v.)...
          </div>
          <DrawerFooter>
            <DrawerClose className="w-full py-2 text-sm font-medium border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
              Đóng
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
```

#### 5.4. Tích hợp bộ Font Awesome Icons
Chạy các lệnh sau để cài đặt Font Awesome và các bộ icon thông dụng:
```bash
npm i --save @fortawesome/react-fontawesome@latest
npm i --save @fortawesome/free-solid-svg-icons
npm i --save @fortawesome/free-regular-svg-icons
npm i --save @fortawesome/free-brands-svg-icons
```

*(Hoặc cài đặt gộp tất cả trong một lệnh duy nhất)*:
```bash
npm i @fortawesome/react-fontawesome@latest @fortawesome/free-solid-svg-icons @fortawesome/free-regular-svg-icons @fortawesome/free-brands-svg-icons
```

**Ví dụ sử dụng Font Awesome (`src/components/IconDemo.jsx`)**:
```jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faMagnifyingGlass, faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons'; // Nét đặc
import { faHeart as faHeartRegular, faComment } from '@fortawesome/free-regular-svg-icons';                // Nét viền
import { faInstagram, faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';                    // Logo MXH

export default function IconDemo() {
  return (
    <div className="flex items-center gap-4 text-xl">
      {/* 1. Solid Icons (thường dùng cho thanh điều hướng, nút chức năng) */}
      <FontAwesomeIcon icon={faHouse} className="text-black dark:text-white" />
      <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-500 hover:text-black dark:hover:text-white cursor-pointer" />

      {/* 2. Regular vs Solid (ví dụ nút Thích / Bỏ thích tương tác) */}
      <FontAwesomeIcon icon={faHeartRegular} className="text-gray-500 hover:text-red-500 cursor-pointer" />
      <FontAwesomeIcon icon={faHeartSolid} className="text-red-500" />
      <FontAwesomeIcon icon={faComment} className="text-gray-500 hover:text-blue-500 cursor-pointer" />

      {/* 3. Brand Icons (rất quan trọng cho luồng Đăng nhập MXH: Instagram, Google, Github...) */}
      <FontAwesomeIcon icon={faInstagram} className="text-pink-600 hover:opacity-80 cursor-pointer" />
      <FontAwesomeIcon icon={faGithub} className="text-black dark:text-white hover:opacity-80 cursor-pointer" />
      <FontAwesomeIcon icon={faGoogle} className="text-red-500 hover:opacity-80 cursor-pointer" />
    </div>
  );
}
```

> **Lưu ý thực chiến**:
> - Font Awesome render ra thẻ SVG vector, tự động nhận màu sắc theo chữ (`currentColor`) hoặc class màu Tailwind (`text-red-500`, `hover:text-pink-600`).
> - Gói `@fortawesome/free-brands-svg-icons` đặc biệt cần thiết cho các nút đăng nhập bằng mạng xã hội (Instagram, Google, Facebook) trong các dự án như Threads Clone.

#### 5.5. Tích hợp Animation với Motion
Cài đặt thư viện:
```bash
npm i motion
```

**Ví dụ sử dụng Motion (`src/components/MotionCard.jsx`)**:
```jsx
import { motion } from 'motion/react';

export default function MotionCard({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm cursor-pointer transition-shadow hover:shadow-md ${className}`}
    >
      {children}
    </motion.div>
  );
}
```

> **Lưu ý thực chiến từ D46**:
> - Dùng Motion cho: Modal mở lên mượt mà, bài viết mới xuất hiện, feedback khi like/bình luận (`whileTap={{ scale: 1.2 }}`).
> - Không lạm dụng animation toàn trang gây rối mắt và tốn GPU/CPU của người dùng.


---

### BƯỚC 6: FORM VALIDATION & REUSABLE HOOKS

#### 6.1. Cài đặt React Hook Form & Yup
```bash
npm i react-hook-form @hookform/resolvers yup
```

#### 6.2. Custom Hook: `useDebounce` tại `src/hooks/useDebounce.js`
Tạo file: `src/hooks/useDebounce.js`
```javascript
import { useState, useEffect } from 'react';

/**
 * Hook làm trễ giá trị thay đổi liên tục (dùng cho ô tìm kiếm, auto-save, async validation)
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

#### 6.3. Custom Hook: `useInfinityLoad` tại `src/hooks/useInfinityLoad.js`
Tạo file: `src/hooks/useInfinityLoad.js`
```javascript
import { useEffect, useRef } from 'react';

/**
 * Hook lắng nghe khi phần tử sentinel chạm đáy màn hình để kích hoạt tải thêm dữ liệu
 */
export function useInfinityLoad({ onIntersect, hasMore, isLoading }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect?.();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [onIntersect, hasMore, isLoading]);

  return { sentinelRef };
}
```

#### 6.4. Trang Login mẫu hoàn chỉnh tại `src/pages/Auth/Login/index.jsx`
Tạo file: `src/pages/Auth/Login/index.jsx`
```jsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginSuccess } from '@/features/auth/authSlice';

const loginSchema = yup.object().shape({
  email: yup.string().required('Vui lòng nhập email').email('Email không đúng định dạng'),
  password: yup.string().required('Vui lòng nhập mật khẩu').min(6, 'Mật khẩu phải từ 6 ký tự'),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const continueUrl = searchParams.get('continue') || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    try {
      // Giả lập API gọi đăng nhập (thay thế bằng gọi http.post('/auth/login', data))
      console.log('Submitted data:', data);

      // Lưu kết quả vào Redux Store
      dispatch(
        loginSuccess({
          user: { id: '1', name: 'Demo User', email: data.email },
          accessToken: 'mock_access_token_123',
          refreshToken: 'mock_refresh_token_456',
        })
      );

      // Chuyển hướng về trang trước đó user muốn truy cập
      navigate(decodeURIComponent(continueUrl), { replace: true });
    } catch (err) {
      console.error('Đăng nhập thất bại:', err);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-1 text-black dark:text-white">Đăng nhập tài khoản</h2>
      <p className="text-sm text-gray-500 mb-6">Nhập thông tin bên dưới để tiếp tục trải nghiệm</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Địa chỉ Email</label>
          <input
            type="email"
            placeholder="user@example.com"
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mật khẩu</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            {...register('password')}
          />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 rounded-lg bg-black text-white dark:bg-white dark:text-black font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity mt-2 cursor-pointer"
        >
          {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
```

#### 6.5. Tạo các trang cơ bản còn lại để chạy dự án
Tạo file: `src/pages/Home/index.jsx`
```jsx
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '@/features/auth/authSlice';

export default function HomePage() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  return (
    <div className="space-y-6">
      <div className="p-8 border rounded-2xl bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Chào mừng đến với BaseApp! 🚀</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Dự án đã được cấu hình đầy đủ: Tailwind CSS v4, Redux Toolkit Persist, Axios Silent Refresh Token, Error Boundary và React Router.
        </p>
      </div>

      {user ? (
        <div className="p-4 border rounded-xl border-green-200 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 flex items-center justify-between">
          <span>Đang đăng nhập dưới tên: <strong>{user.email}</strong></span>
          <button
            onClick={() => dispatch(logout())}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      ) : (
        <div className="p-4 border rounded-xl border-blue-200 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300">
          Bạn chưa đăng nhập. Hãy truy cập <a href="/login" className="underline font-semibold">trang Đăng nhập</a> để trải nghiệm luồng xác thực.
        </div>
      )}
    </div>
  );
}
```

Tạo file: `src/pages/Profile/index.jsx`
```jsx
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/auth/authSlice';

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser);

  return (
    <div className="p-6 border rounded-2xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 space-y-4">
      <h2 className="text-2xl font-bold">Trang Hồ Sơ Cá Nhân (Protected Route) 🔒</h2>
      <p className="text-sm text-gray-500">Chỉ người dùng đã đăng nhập mới có thể xem trang này.</p>
      <div className="p-4 rounded-lg bg-gray-100 dark:bg-zinc-800 font-mono text-sm">
        {JSON.stringify(user, null, 2)}
      </div>
    </div>
  );
}
```

Tạo file: `src/pages/NotFound/index.jsx`
```jsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black mb-2">404</h1>
      <p className="text-gray-500 mb-6">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
      <Link
        to="/"
        className="px-4 py-2 text-sm font-medium rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
      >
        Quay về trang chủ
      </Link>
    </div>
  );
}
```

---

<a id="bước-7-làm-đa-ngôn-ngữ-với-react-i18next"></a>
### BƯỚC 7: LÀM ĐA NGÔN NGỮ VỚI REACT-I18NEXT

Trong các ứng dụng chuẩn quốc tế (như Threads, Facebook, Dashboard SaaS), việc hỗ trợ đa ngôn ngữ (Internationalization - i18n) là tính năng bắt buộc. `react-i18next` là giải pháp tiêu chuẩn số 1 trong hệ sinh thái React nhờ hiệu năng vượt trội, hỗ trợ tách nhỏ namespace, interpolation biến động và tự động tránh re-render thừa.

#### 7.1. Cài đặt thư viện
```bash
npm i i18next react-i18next
```

- `i18next`: Nhân xử lý logic từ điển, tìm kiếm key, dịch chuỗi và format biến.
- `react-i18next`: Cung cấp React Hook `useTranslation()`, HOC và component `<Trans />` tối ưu cho React 19.

#### 7.2. Cấu trúc thư mục i18n chuẩn
```text
src/
└── locales/
    ├── vi/
    │   └── common.json     # Từ điển tiếng Việt
    ├── en/
    │   └── common.json     # Từ điển tiếng Anh
    └── i18n.js             # Cấu hình khởi tạo và lưu trữ ngôn ngữ
```

#### 7.3. Tạo các file từ điển JSON

Tạo file: `src/locales/vi/common.json`
```json
{
  "nav": {
    "home": "Trang chủ",
    "profile": "Hồ sơ",
    "login": "Đăng nhập",
    "logout": "Đăng xuất"
  },
  "home": {
    "welcome": "Chào mừng đến với BaseApp! 🚀",
    "description": "Dự án đã được cấu hình đầy đủ: Tailwind CSS v4, Redux Toolkit Persist, Axios Silent Refresh Token, Error Boundary và Đa ngôn ngữ react-i18next.",
    "loggedInAs": "Đang đăng nhập dưới tên: {{email}}",
    "notLoggedIn": "Bạn chưa đăng nhập. Hãy truy cập trang Đăng nhập để trải nghiệm luồng xác thực."
  },
  "auth": {
    "loginTitle": "Đăng nhập tài khoản",
    "loginSubtitle": "Nhập thông tin bên dưới để tiếp tục trải nghiệm",
    "emailLabel": "Địa chỉ Email",
    "passwordLabel": "Mật khẩu",
    "submitBtn": "Đăng nhập",
    "submitting": "Đang xử lý..."
  },
  "common": {
    "theme": "Giao diện",
    "language": "Ngôn ngữ"
  }
}
```

Tạo file: `src/locales/en/common.json`
```json
{
  "nav": {
    "home": "Home",
    "profile": "Profile",
    "login": "Login",
    "logout": "Logout"
  },
  "home": {
    "welcome": "Welcome to BaseApp! 🚀",
    "description": "Fully configured with Tailwind CSS v4, Redux Toolkit Persist, Axios Silent Refresh Token, Error Boundary, and Multi-language react-i18next.",
    "loggedInAs": "Logged in as: {{email}}",
    "notLoggedIn": "You are not logged in. Please visit the Login page to test authentication flow."
  },
  "auth": {
    "loginTitle": "Sign in to account",
    "loginSubtitle": "Enter your credentials below to continue",
    "emailLabel": "Email address",
    "passwordLabel": "Password",
    "submitBtn": "Sign In",
    "submitting": "Processing..."
  },
  "common": {
    "theme": "Theme",
    "language": "Language"
  }
}
```

#### 7.4. Khởi tạo cấu hình tại `src/locales/i18n.js`
> [!TIP]
> - Lưu ngôn ngữ người dùng vào `localStorage` với key `'language'`. Khi F5 trang web hoặc truy cập lại, giao diện sẽ giữ nguyên ngôn ngữ đã chọn.
> - Thiết lập `fallbackLng: 'en'` để nếu lỡ quên dịch 1 key ở tiếng Việt, ứng dụng vẫn tự động hiển thị chữ tiếng Anh thay vì vỡ giao diện.

Tạo file: `src/locales/i18n.js`
```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import viCommon from './vi/common.json';
import enCommon from './en/common.json';

const resources = {
  vi: {
    translation: viCommon,
  },
  en: {
    translation: enCommon,
  },
};

// Đọc ngôn ngữ đã lưu từ localStorage, mặc định là tiếng Việt
const savedLanguage = localStorage.getItem('language') || 'vi';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en', // Ngôn ngữ dự phòng nếu thiếu key dịch
    interpolation: {
      escapeValue: false, // React đã tự escape chuỗi an toàn chống XSS
    },
  });

export default i18n;
```

#### 7.5. Kích hoạt i18n trong `src/main.jsx`
Mở `src/main.jsx` và import file `i18n.js` ngay trên cùng:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/store';
import '@/locales/i18n'; // Khởi chạy cấu hình đa ngôn ngữ i18n trước khi render
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div className="p-4 text-center">Đang khởi tạo...</div>} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
```

#### 7.6. Tạo Component chuyển đổi ngôn ngữ (`LanguageSwitcher`)
Tạo file: `src/components/LanguageSwitcher/index.jsx`
```jsx
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'vi';

  const handleChangeLanguage = (newLang) => {
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <div className="flex items-center gap-1 p-0.5 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-900 text-xs font-medium">
      <button
        onClick={() => handleChangeLanguage('vi')}
        className={`px-2 py-1 rounded transition-colors cursor-pointer ${
          currentLang === 'vi'
            ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
            : 'text-gray-500 hover:text-black dark:hover:text-white'
        }`}
        title="Tiếng Việt"
      >
        VI
      </button>
      <button
        onClick={() => handleChangeLanguage('en')}
        className={`px-2 py-1 rounded transition-colors cursor-pointer ${
          currentLang === 'en'
            ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
            : 'text-gray-500 hover:text-black dark:hover:text-white'
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
```

#### 7.7. Tích hợp thực tế vào Header & Pages
**1. Tích hợp nút đổi ngôn ngữ và dịch menu trong `src/layouts/DefaultLayout/index.jsx`:**
```jsx
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function DefaultLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-black dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight">BaseApp</Link>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300">{t('nav.home')}</Link>
            <Link to="/profile" className="hover:text-gray-600 dark:hover:text-gray-300">{t('nav.profile')}</Link>
            <Link to="/login" className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black">{t('nav.login')}</Link>
          </nav>
          {/* Nút chuyển đổi VI / EN */}
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-zinc-800 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} BaseApp. All rights reserved.
      </footer>
    </div>
  );
}
```

**2. Sử dụng hook `useTranslation` trong `src/pages/Home/index.jsx` (hỗ trợ truyền biến):**
```jsx
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { selectCurrentUser, logout } from '@/features/auth/authSlice';

export default function HomePage() {
  const { t } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  return (
    <div className="space-y-6">
      <div className="p-8 border rounded-2xl bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">{t('home.welcome')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('home.description')}</p>
      </div>

      {user ? (
        <div className="p-4 border rounded-xl border-green-200 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 flex items-center justify-between">
          {/* Truyền biến email vào chuỗi dịch qua Interpolation */}
          <span>{t('home.loggedInAs', { email: user.email })}</span>
          <button
            onClick={() => dispatch(logout())}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {t('nav.logout')}
          </button>
        </div>
      ) : (
        <div className="p-4 border rounded-xl border-blue-200 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300">
          {t('home.notLoggedIn')}
        </div>
      )}
    </div>
  );
}
```

#### 7.8. Bí kíp & Quy tắc vàng khi làm i18n
1. **Interpolation (Truyền tham số biến)**: Trong file json khai báo `"message": "Xin chào {{name}}"`, trong code gọi `t('message', { name: 'F8' })`. Tuyệt đối không cộng chuỗi thủ công như `t('hello') + ' ' + name` vì ngữ pháp tiếng Anh và tiếng Việt có trật tự từ khác nhau.
2. **Quy tắc đặt tên key**: Phân cấp theo module/component (vd: `nav.home`, `auth.loginTitle`, `error.required`). Tránh đặt key phẳng dạng `"Trang chủ"` hay `"home"` chung chung dễ bị trùng lặp nghĩa.
3. **Lazy Load Locales (Dự án lớn)**: Nếu dự án có hàng nghìn từ vựng hoặc hàng chục thứ tiếng, có thể tích hợp thêm `i18next-http-backend` để chỉ tải file `.json` của ngôn ngữ tương ứng qua HTTP khi người dùng chọn.

---

<a id="bước-8-tích-hợp-dark-mode"></a>
### BƯỚC 8: TÍCH HỢP DARK MODE (THEMEPROVIDER & THEMETOGGLE)

Dark Mode là tính năng cốt lõi của giao diện hiện đại. Giải pháp chuẩn mực dưới đây kết hợp **Context API**, **Tailwind CSS v4** (`@custom-variant dark`), lưu trữ `localStorage`, hỗ trợ `system` theme và **chống giật chớp màn hình (Zero-Flicker)** khi F5.

#### 8.1. Script chống chớp trắng màn hình tại `index.html`
Đặt script này vào ngay trước thẻ đóng `</head>` của `index.html` để nạp theme trước khi cây DOM được vẽ:
```html
    <!-- Chống chớp trắng khi refresh trang ở chế độ Dark Mode -->
    <script>
      (function () {
        const theme = localStorage.getItem("theme");
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (theme === "dark" || (!theme && systemDark)) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      })();
    </script>
```

#### 8.2. Tạo `ThemeProvider` & hook `useTheme` tại `src/components/ThemeProvider/index.jsx`
Tạo file: `src/components/ThemeProvider/index.jsx`
```jsx
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'system',
  setTheme: () => null,
  isDark: false,
});

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  ...props
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  );

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const current = localStorage.getItem(storageKey) || defaultTheme;
    if (current === 'dark') return true;
    if (current === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      root.classList.remove('light', 'dark');

      let resolvedTheme = theme;
      if (theme === 'system') {
        resolvedTheme = mediaQuery.matches ? 'dark' : 'light';
      }

      root.classList.add(resolvedTheme);
      setIsDark(resolvedTheme === 'dark');
    };

    applyTheme();

    const handleMediaChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
    isDark,
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

#### 8.3. Tạo Component `ThemeToggle` gọn nhẹ tại `src/components/ThemeToggle/index.jsx`
Sử dụng icon `Sun` và `Moon` từ `lucide-react`, tự động đổi icon và đổi class giao diện chỉ với 1 click:

Tạo file: `src/components/ThemeToggle/index.jsx`
```jsx
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from 'react-i18next';

export default function ThemeToggle() {
  const { isDark, setTheme } = useTheme();
  const { t } = useTranslation();

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={handleToggle}
      className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer inline-flex items-center justify-center focus:outline-none"
      title={isDark ? t('theme.switchToLight', 'Chuyển sang giao diện sáng') : t('theme.switchToDark', 'Chuyển sang giao diện tối')}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-700 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}
```

#### 8.4. Bọc `ThemeProvider` trong `src/App.jsx`
Cập nhật file: `src/App.jsx`
```jsx
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppRoutes from '@/routes/AppRoutes';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="theme">
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

#### 8.5. Đặt `ThemeToggle` lên Header của `DefaultLayout`
Cập nhật file: `src/layouts/DefaultLayout/index.jsx`:
```jsx
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';

export default function DefaultLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-black dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight">BaseApp</Link>
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-6 text-sm font-medium mr-1">
            <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300">{t('nav.home')}</Link>
            <Link to="/profile" className="hover:text-gray-600 dark:hover:text-gray-300">{t('nav.profile')}</Link>
            <Link to="/login" className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black">{t('nav.login')}</Link>
          </nav>
          {/* Nút chuyển đổi ngôn ngữ */}
          <LanguageSwitcher />
          {/* Nút chuyển đổi Dark / Light mode */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-zinc-800 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} BaseApp. All rights reserved.
      </footer>
    </div>
  );
}
```

---

### TỔNG KẾT THỨ TỰ THỰC HIỆN
Để dựng nhanh dự án base mới từ file này:
1. Copy các lệnh `npm i` ở từng bước chạy vào terminal.
2. Tạo các thư mục tương ứng trong `src/` (`lib`, `locales`, `utils`, `features`, `store`, `layouts`, `routes`, `pages`, `components/ui`, `hooks`).
3. Copy từng đoạn mã trên dán vào đúng đường dẫn file.
4. Chạy `npm run dev` để tận hưởng thành quả!


