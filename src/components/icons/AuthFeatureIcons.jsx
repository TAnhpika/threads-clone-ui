// Auth Feature Gradient Icons (chuẩn màu Neon Gradient cho Like, Comment, Repost, Post modal)

export function LikeGradientIcon({ className = 'w-11.5 h-11.5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <defs>
        <linearGradient id="auth-grad-like" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="40%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke="url(#auth-grad-like)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CommentGradientIcon({ className = 'w-11.5 h-11.5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <defs>
        <linearGradient id="auth-grad-comment" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="40%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <g transform="scale(-1, 1) translate(-24, 0)">
        <path
          d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
          stroke="url(#auth-grad-comment)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function RepostGradientIcon({ className = 'w-11.5 h-11.5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <defs>
        <linearGradient id="auth-grad-repost" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="40%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path
        d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
        stroke="url(#auth-grad-repost)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 3v5h-5"
        stroke="url(#auth-grad-repost)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
        stroke="url(#auth-grad-repost)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 16H3v5"
        stroke="url(#auth-grad-repost)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PostGradientIcon({ className = 'w-13 h-13' }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="none">
      <defs>
        <linearGradient id="auth-grad-post" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="40%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path
        d="M17 6H10a4 4 0 0 0-4 4v16a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4v-7"
        stroke="url(#auth-grad-post)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M27.5 4.5a3 3 0 0 1 4 4L19 21l-5 1 1-5 12.5-12.5z"
        stroke="url(#auth-grad-post)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AuthFeatureIcon({ type, containerClassName = 'w-14 h-14 flex items-center justify-center mt-1 mb-1' }) {
  if (type === 'say_more') return null;

  let iconContent = null;
  if (type === 'like') {
    iconContent = <LikeGradientIcon />;
  } else if (type === 'comment') {
    iconContent = <CommentGradientIcon />;
  } else if (type === 'repost') {
    iconContent = <RepostGradientIcon />;
  } else {
    // default type === 'post'
    iconContent = <PostGradientIcon />;
  }

  return <div className={containerClassName}>{iconContent}</div>;
}
