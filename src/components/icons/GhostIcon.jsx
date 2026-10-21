// 3. Cute Ghost Icon (cho Ghost posts chuẩn hình mẫu)
export function GhostIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      {...props}
    >
      <path
        strokeDasharray="2.5 2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 16.5L4 19.5c-.3.3-.8.1-.7-.3l1-4.2A8 8 0 1 1 7.5 17"
      />
      <circle cx="10" cy="11.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="11.5" r="1.1" fill="currentColor" stroke="none" />
      <path d="M10.5 14.5c.6.5 1.4.7 2 .7s1.4-.2 2-.7" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}
