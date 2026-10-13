# Tailwind CSS Canonical Classes Rule

## Strictly Avoid Arbitrary Values Where Canonical Classes Exist
Always use canonical Tailwind CSS classes instead of arbitrary bracket notation to avoid triggering the Tailwind CSS extension warning `suggestCanonicalClasses` (e.g. `The class 'min-h-[40px]' can be written as 'min-h-10'`, `The class '[scrollbar-width:none]' can be written as 'scrollbar-none'`).

### Standard Mapping & Best Practices:
1. **Scrollbar Utilities**:
   - `[scrollbar-width:none]` -> `scrollbar-none` (CRITICAL: NEVER write `[scrollbar-width:none]`, always write `scrollbar-none`)

2. **Heights & Widths**:
   - `min-h-[40px]` -> `min-h-10`
   - `h-[40px]` -> `h-10`
   - `w-[40px]` -> `w-10`
   - `w-[480px]` / `max-w-[480px]` -> `w-120` / `max-w-120`
   - `w-[520px]` / `max-w-[520px]` -> `w-130` / `max-w-130`
   - `w-[200px]` / `max-w-[200px]` -> `w-50` / `max-w-50`
   - `min-w-[0px]` -> `min-w-0`

3. **Font Sizes**:
   - `text-[12px]` -> `text-xs`
   - `text-[14px]` -> `text-sm`
   - `text-[16px]` -> `text-base`
   - `text-[18px]` -> `text-lg`
   - `text-[20px]` -> `text-xl`
   - `text-[24px]` -> `text-2xl`

4. **Padding, Margin & Gaps**:
   - `p-[16px]` -> `p-4`
   - `gap-[16px]` -> `gap-4`

5. **Stroke Width Utilities**:
   - `stroke-[1]` -> `stroke-1`
   - `stroke-[2]` -> `stroke-2`
   - `stroke-[3]` -> `stroke-3` (CRITICAL: NEVER write `stroke-[3]`, always write `stroke-3`)

Always use standard Tailwind scale values and built-in canonical utilities directly rather than bracket notation `[...]`.

