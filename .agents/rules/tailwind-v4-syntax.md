# Tailwind CSS v4 Strict Rule

## Luôn dùng cú pháp Tailwind CSS v4 (Always Use Tailwind v4 Syntax)
Mọi component trong dự án bắt buộc phải tuân theo cú pháp Tailwind CSS v4:

1. **Dynamic Numeric Sizing**:
   - Sử dụng trực tiếp giá trị chia cho 4 (`px / 4`):
     - `max-w-92.5` thay vì `max-w-[370px]`
     - `-mt-67` thay vì `-mt-[268px]`
     - `h-127.5` thay vì `h-[510px]`
     - `w-446.25` thay vì `w-[1785px]`
     - `w-120` thay vì `w-[480px]`
     - `w-130` thay vì `w-[520px]`
     - `w-50` thay vì `w-[200px]`
     - `h-13.5`, `px-4.5`, `my-5.5`, `w-5.5`, `h-5.5`
2. **Built-in Canonical Classes**:
   - `scrollbar-none` thay cho `[scrollbar-width:none]`
   - `scale-99` / `active:scale-99` thay cho `scale-[0.99]`
   - `stroke-1`, `stroke-2`, `stroke-3` thay cho `stroke-[1]`, `stroke-[2]`, `stroke-[3]`
   - `wrap-break-word` thay cho `break-words`
   - `bg-linear-to-tr`, `bg-linear-to-b`, ... thay cho `bg-gradient-to-*`
   - `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`
3. **CSS-First Theme Config**:
   - Cấu hình theme trực tiếp bằng directives `@theme` trong CSS, không sử dụng file config JS kiểu cũ.
4. **Tuyệt đối tránh Arbitrary Values `[...]`** khi có thể viết bằng số thực hoặc canonical class của v4.
