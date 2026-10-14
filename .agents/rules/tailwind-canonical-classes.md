# Tailwind CSS v4 & Canonical Classes Rule

## 1. Luôn dùng cú pháp Tailwind CSS v4 (Always Use Tailwind v4 Syntax)
Dự án sử dụng Tailwind CSS v4. Tuyệt đối tuân thủ các quy tắc cú pháp v4 sau đây:
- **CSS-First Configuration**: Sử dụng `@import "tailwindcss";` và `@theme` trực tiếp trong file CSS (không dùng cú pháp legacy `tailwind.config.js`).
- **Dynamic Spacing & Sizing Scale**: Trong Tailwind v4, kích thước (width, height, margin, padding, top/bottom/left/right, max-w, min-w) hỗ trợ trực tiếp các số thực chia hết cho 4 (`px / 4 = tailwind unit`).
  - **Bắt buộc dùng**: `max-w-92.5` thay vì `max-w-[370px]` (370 / 4 = 92.5).
  - **Bắt buộc dùng**: `-mt-67` thay vì `-mt-[268px]` (268 / 4 = 67).
  - **Bắt buộc dùng**: `h-127.5` thay vì `h-[510px]` (510 / 4 = 127.5).
  - **Bắt buộc dùng**: `w-446.25` thay vì `w-[1785px]` (1785 / 4 = 446.25).
  - **Bắt buộc dùng**: `w-120` / `max-w-120` thay vì `w-[480px]` / `max-w-[480px]`.
  - **Bắt buộc dùng**: `w-130` / `max-w-130` thay vì `w-[520px]` / `max-w-[520px]`.
  - **Bắt buộc dùng**: `w-50` / `max-w-50` thay vì `w-[200px]` / `max-w-[200px]`.
  - **Bắt buộc dùng**: `min-w-0` thay vì `min-w-[0px]`.
  - Hỗ trợ đầy đủ các bước nhảy lẻ chuẩn v4: `h-13.5`, `px-4.5`, `my-5.5`, `w-5.5`, `h-5.5`.

## 2. Nghiêm cấm dùng Arbitrary Values `[...]` khi đã có Canonical Classes
Tuyệt đối không dùng ký hiệu ngoặc vuông `[...]` khi Tailwind v4 đã có canonical class tương ứng để tránh kích hoạt cảnh báo `suggestCanonicalClasses`:
1. **Scrollbar Utilities**:
   - `[scrollbar-width:none]` -> `scrollbar-none` (TUYỆT ĐỐI KHÔNG dùng `[scrollbar-width:none]`).
2. **Transform & Scale Utilities**:
   - `scale-[0.99]` -> `scale-99`
   - `scale-[0.95]` -> `scale-95`
   - `active:scale-[0.99]` -> `active:scale-99`
3. **Stroke Width Utilities**:
   - `stroke-[1]` -> `stroke-1`
   - `stroke-[2]` -> `stroke-2`
   - `stroke-[3]` -> `stroke-3` (TUYỆT ĐỐI KHÔNG dùng `stroke-[3]`).
4. **Font Sizes**:
   - `text-[12px]` -> `text-xs`
   - `text-[14px]` -> `text-sm`
   - `text-[16px]` -> `text-base`
   - `text-[18px]` -> `text-lg`
   - `text-[20px]` -> `text-xl`
   - `text-[24px]` -> `text-2xl`
   - Trường hợp font size đặc thù khác: dùng canonical unit `text-3.75` (cho 15px) hoặc map về `text-sm`/`text-base`.
5. **Padding, Margin, Gaps**:
   - Dùng thang đo v4: `p-4` thay vì `p-[16px]`, `gap-4` thay vì `gap-[16px]`.

## 3. Tóm tắt nguyên tắc cốt lõi:
- Mọi giá trị px cần chuyển sang đơn vị Tailwind bằng công thức: `px / 4`.
- Luôn ưu tiên cú pháp chuẩn v4 gọn gàng và không dùng bracket notation `[...]` nếu có thể biểu diễn bằng số thực hoặc built-in utilities.
