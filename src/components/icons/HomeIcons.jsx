// 1. Home Icons (Outline & Solid silhouette chuẩn Threads / Barcelona)
export function SolidHome({ className = 'w-5 h-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M2.5 10.2a2.4 2.4 0 0 1 1.25-2.06l6.6-3.48a3.5 3.5 0 0 1 3.3 0l6.6 3.48a2.4 2.4 0 0 1 1.25 2.06v8.6a2.2 2.2 0 0 1-2.2 2.2h-14.6a2.2 2.2 0 0 1-2.2-2.2v-8.6z" />
    </svg>
  );
}

export function OutlineHome({ className = 'w-5 h-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M2.5 10.2a2.4 2.4 0 0 1 1.25-2.06l6.6-3.48a3.5 3.5 0 0 1 3.3 0l6.6 3.48a2.4 2.4 0 0 1 1.25 2.06v8.6a2.2 2.2 0 0 1-2.2 2.2h-14.6a2.2 2.2 0 0 1-2.2-2.2v-8.6z" />
    </svg>
  );
}
