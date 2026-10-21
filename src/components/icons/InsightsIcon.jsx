// 2. Insights / Chart Icon
export function InsightsIcon({ className = 'w-5 h-5', active = false, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M8 17v-4" strokeWidth={active ? 3 : 2} />
      <path d="M12 17v-8" strokeWidth={active ? 3 : 2} />
      <path d="M16 17v-6" strokeWidth={active ? 3 : 2} />
    </svg>
  );
}
