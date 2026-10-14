import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/auth/authSlice';
import userAvatar from '@/assets/images/ava.png';

function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState('threads');

  const avatar = user?.avatar || userAvatar;
  const name = user?.name || 'Alexander Vance';
  const username = user?.username || 'alexander.sartorial';

  const tabs = [
    { id: 'threads', label: 'Threads' },
    { id: 'replies', label: 'Replies' },
    { id: 'reposts', label: 'Reposts' },
  ];

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 select-none">
      {/* Profile Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight">
              {name}
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              <span>{username}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                threads.net
              </span>
            </div>
          </div>

          {/* User Avatar */}
          <div className="relative shrink-0">
            <img
              src={avatar}
              alt={name}
              className="w-20 h-20 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shadow-sm"
            />
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
          Classic elegance & tailoring · Smart Casual & Old Money Aesthetic · Sharing curated looks and sartorial inspirations ✨
        </p>

        {/* Followers & Social Link */}
        <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 pt-1">
          <div className="flex items-center gap-2">
            <span>2,480 followers</span>
            <span>·</span>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
            >
              instagram.com/{username}
            </a>
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            title="Instagram"
          >
            <InstagramIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            className="flex-1 py-1.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
          >
            Edit profile
          </button>
          <button
            type="button"
            className="flex-1 py-1.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
          >
            Share profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mt-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content preview */}
      <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 text-sm">
        Chưa có bài viết nào trong mục {tabs.find((t) => t.id === activeTab)?.label.toLowerCase()}.
      </div>
    </div>
  );
}
