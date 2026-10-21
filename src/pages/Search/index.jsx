import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Search,
  X,
  SlidersHorizontal,
  MoreHorizontal,
  Plus,
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  Sparkles,
  Hash,
} from 'lucide-react';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import { CreatePostModal, PostCard, mockPosts } from '@/components/post';
import { RadialSpinner } from '@/components/common';
import { searchApi, getFollowSuggestionsApi } from '@/services/searchService';
import { followUserApi, unfollowUserApi } from '@/services/userService';
import { getFeed } from '@/services/postService';

// Meta/Threads Authentic Verified Badge
function VerifiedBadge({ className = 'w-3.5 h-3.5 text-[#0095f6] shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10.5 2.5a2.5 2.5 0 0 1 3 0l1.2 1a2.5 2.5 0 0 0 2 .5l1.6-.2a2.5 2.5 0 0 1 2.7 1.6l.6 1.5a2.5 2.5 0 0 0 1.5 1.5l1.5.6a2.5 2.5 0 0 1 1.6 2.7l-.2 1.6a2.5 2.5 0 0 0 .5 2l1 1.2a2.5 2.5 0 0 1 0 3l-1 1.2a2.5 2.5 0 0 0-.5 2l.2 1.6a2.5 2.5 0 0 1-1.6 2.7l-1.5.6a2.5 2.5 0 0 0-1.5 1.5l-.6 1.5a2.5 2.5 0 0 1-2.7 1.6l-1.6-.2a2.5 2.5 0 0 0-2 .5l-1.2 1a2.5 2.5 0 0 1-3 0l-1.2-1a2.5 2.5 0 0 0-2-.5l-1.6.2a2.5 2.5 0 0 1-2.7-1.6l-.6-1.5a2.5 2.5 0 0 0-1.5-1.5l-1.5-.6a2.5 2.5 0 0 1-1.6-2.7l.2-1.6a2.5 2.5 0 0 0-.5-2l-1-1.2a2.5 2.5 0 0 1 0-3l1-1.2a2.5 2.5 0 0 0 .5-2l-.2-1.6a2.5 2.5 0 0 1 1.6-2.7l1.5-.6a2.5 2.5 0 0 0 1.5-1.5l.6-1.5a2.5 2.5 0 0 1 2.7-1.6l1.6.2a2.5 2.5 0 0 0 2-.5l1.2-1zm-1.2 13.7l6.8-6.8-1.1-1.1-5.7 5.7-2.3-2.3-1.1 1.1 3.4 3.4z" />
    </svg>
  );
}

// Avatar với fallback sang Gradient + Chữ cái đầu nếu mạng chậm/lỗi
function AvatarWithFallback({ src, name, username, className = 'w-10 h-10 sm:w-11 sm:h-11' }) {
  const [error, setError] = useState(false);
  const initial = (name || username || 'U')[0].toUpperCase();

  // Tạo màu gradient ổn định theo username
  const gradients = [
    'from-rose-500 to-amber-500',
    'from-blue-600 to-cyan-500',
    'from-purple-600 to-pink-500',
    'from-emerald-500 to-teal-700',
    'from-orange-500 to-yellow-500',
  ];
  const colorIndex = (username?.charCodeAt(0) || 0) % gradients.length;
  const gradientClass = gradients[colorIndex];

  if (error || !src) {
    return (
      <div
        className={`${className} rounded-full bg-linear-to-tr ${gradientClass} flex items-center justify-center text-white font-bold text-sm sm:text-base shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-xs`}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={username || name}
      onError={() => setError(true)}
      className={`${className} rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-800`}
    />
  );
}

// Thumbnail tin tức xu hướng với fallback
function ThumbnailWithFallback({ src, title, icon: Icon, fallbackBg = 'from-zinc-700 to-zinc-900' }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-linear-to-br ${fallbackBg} flex items-center justify-center text-white/80 shrink-0 border border-zinc-200/50 dark:border-zinc-800 shadow-xs`}
      >
        {Icon ? <Icon className="w-6 h-6 stroke-2" /> : <Sparkles className="w-5 h-5" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      onError={() => setError(true)}
      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 border border-zinc-200/50 dark:border-zinc-800 group-hover:opacity-90 transition-opacity"
    />
  );
}

// Helper tạo SVG Data URI đảm bảo hiển thị 100% sắc nét và không bao giờ bị lỗi ảnh
const createSvgDataUrl = (gradientDefs, contentSvg, rx = 32) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs>${gradientDefs}</defs>
    <rect width="200" height="200" rx="${rx}" fill="url(#bg)"/>
    ${contentSvg}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
};

// Thumbnail các chủ đề xu hướng (chuẩn màu và icon theo ảnh mẫu)
const viettelThumbnail = createSvgDataUrl(
  '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ee0033"/><stop offset="100%" stop-color="#ff6b00"/></linearGradient>',
  `<circle cx="100" cy="100" r="55" fill="rgba(255,255,255,0.15)"/>
   <path d="M70 90h60v55H70z" fill="#fff" rx="8"/>
   <path d="M65 80h70v15H65z" fill="#ffd700" rx="4"/>
   <path d="M95 80h10v65H95z" fill="#ff4d4d"/>
   <path d="M85 70c-12-12-2 0 15 10-17-10-7-22 5-15 10 6 0 15-5 15z" fill="#ffd700"/>
   <path d="M115 70c12-12 2 0-15 10 17-10 7-22-5-15-10 6 0 15 5 15z" fill="#ffd700"/>`
);

const wrenEvansThumbnail = createSvgDataUrl(
  '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3b82f6"/><stop offset="50%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#ec4899"/></linearGradient>',
  `<circle cx="100" cy="85" r="32" fill="#fff"/>
   <path d="M60 160c0-28 18-42 40-42s40 14 40 42z" fill="#fff"/>
   <circle cx="150" cy="55" r="8" fill="#ffd700"/>
   <circle cx="45" cy="70" r="5" fill="#ffd700"/>
   <path d="M140 100l8-8 8 8-8 8z" fill="#ffd700"/>`
);

const doranThumbnail = createSvgDataUrl(
  '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>',
  `<rect x="40" y="40" width="120" height="120" rx="24" fill="#334155"/>
   <circle cx="100" cy="85" r="28" fill="#e2e8f0"/>
   <path d="M65 150c0-22 15-35 35-35s35 13 35 35z" fill="#38bdf8"/>
   <text x="100" y="145" font-family="sans-serif" font-size="14" font-weight="900" fill="#fff" text-anchor="middle">LCK</text>`
);

const concertThumbnail = createSvgDataUrl(
  '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#064e3b"/><stop offset="50%" stop-color="#047857"/><stop offset="100%" stop-color="#10b981"/></linearGradient>',
  `<circle cx="100" cy="100" r="60" fill="rgba(255,255,255,0.1)"/>
   <path d="M70 140l30-70 30 70-30-18z" fill="#facc15"/>
   <circle cx="100" cy="65" r="14" fill="#fff"/>
   <circle cx="65" cy="80" r="6" fill="#fde047"/>
   <circle cx="135" cy="80" r="6" fill="#fde047"/>`
);

const mewAmazingThumbnail = createSvgDataUrl(
  '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4c1d95"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient>',
  `<rect x="45" y="60" width="110" height="90" rx="16" fill="rgba(255,255,255,0.15)"/>
   <circle cx="80" cy="100" r="15" fill="#38bdf8"/>
   <circle cx="120" cy="100" r="15" fill="#f43f5e"/>
   <path d="M70 135h60" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`
);

// Avatar các tài khoản gợi ý (Follow suggestions)
const pennAvatar = createSvgDataUrl(
  '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#011F5B"/><stop offset="100%" stop-color="#990000"/></linearGradient>',
  `<circle cx="100" cy="100" r="70" fill="none" stroke="#fff" stroke-width="4"/>
   <text x="100" y="125" font-family="serif" font-size="75" font-weight="bold" fill="#fff" text-anchor="middle">Penn</text>`,
  100
);

const songphaivuiAvatar = createSvgDataUrl(
  '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f766e"/><stop offset="100%" stop-color="#115e59"/></linearGradient>',
  `<circle cx="100" cy="100" r="65" fill="#134e4a"/>
   <path d="M65 90h55a15 15 0 0 1 15 15v10a25 25 0 0 1-25 25H85a25 25 0 0 1-25-25v-20a5 5 0 0 1 5-5z" fill="#fff"/>
   <path d="M135 98h8a12 12 0 0 1 12 12v4a12 12 0 0 1-12 12h-8" fill="none" stroke="#fff" stroke-width="6"/>
   <path d="M78 72c0-8 6-8 6-16m16 16c0-8 6-8 6-16" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/>`,
  100
);

const datawithlyAvatar = createSvgDataUrl(
  '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#4f46e5"/></linearGradient>',
  `<circle cx="100" cy="80" r="35" fill="#fde047"/>
   <path d="M50 165c0-30 22-45 50-45s50 15 50 45z" fill="#fff"/>
   <path d="M65 65c10-15 45-20 60 5" stroke="#1e1b4b" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  100
);

const lilyAvatar = createSvgDataUrl(
  '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#fb7185"/></linearGradient>',
  `<circle cx="100" cy="80" r="35" fill="#fff"/>
   <path d="M50 165c0-30 22-45 50-45s50 15 50 45z" fill="#fecdd3"/>
   <circle cx="100" cy="80" r="28" fill="#fda4af"/>`,
  100
);

const f8Avatar = createSvgDataUrl(
  '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f05123"/><stop offset="100%" stop-color="#ff7a45"/></linearGradient>',
  `<text x="100" y="125" font-family="sans-serif" font-size="70" font-weight="900" fill="#fff" text-anchor="middle">F8</text>`,
  100
);

// Danh sách danh mục pills ở đầu trang Search
const categoryTags = [
  'AI Threads',
  'Travel Threads',
  'du lịch hà nội',
  'northern lights',
  'Iceland Travel',
  'Thái Lan',
  'Đà Lạt',
  'Nhiếp ảnh',
  'Công nghệ & AI',
];

// Danh sách chủ đề xu hướng (Trending now) đúng theo ảnh mẫu
const initialTrendingList = [
  {
    id: 'trend-1',
    title: 'Viettel Tammi tặng quà tri ân',
    description:
      'Ứng dụng Viettel Tammi tặng data và tiền cước nhân kỷ niệm 22 năm mạng di động',
    postCount: '335 posts',
    image: viettelThumbnail,
    category: 'AI Threads',
  },
  {
    id: 'trend-2',
    title: 'Wren Evans diễn Mơ Màng Year End',
    description:
      'Ban tổ chức thông báo ca sĩ Wren Evans biểu diễn tại Những Thành Phố Mơ Màng',
    postCount: '1K posts',
    image: wrenEvansThumbnail,
    category: 'Travel Threads',
  },
  {
    id: 'trend-3',
    title: 'Nhóm dựng booth bị tố nói xấu',
    description:
      'Một số người thuộc nhóm dựng booth quyên góp bị tố nói xấu nghệ sĩ khác',
    postCount: '119 posts',
    image: null,
    category: 'AI Threads',
  },
  {
    id: 'trend-4',
    title: 'Doran phản đối hành vi chế giễu',
    description:
      'Tuyển thủ Doran khẳng định sẽ không bao giờ hạ bệ hay đối xử tiêu cực với ai',
    postCount: '1K posts',
    image: doranThumbnail,
    category: 'Công nghệ & AI',
  },
  {
    id: 'trend-5',
    title: 'Concert ATVNCG 2026 sắp diễn ra',
    description:
      'Nghệ sĩ và khán giả chuẩn bị cho concert ATVNCG 2026 vào cuối tuần này',
    postCount: '5K posts',
    image: concertThumbnail,
    category: 'Travel Threads',
  },
  {
    id: 'trend-6',
    title: 'Booth Mew Amazing gây thất vọng',
    description:
      'Khán giả thất vọng trước chất lượng hoàn thiện booth cổ vũ Mew Amazing tại concert',
    postCount: '2K posts',
    image: mewAmazingThumbnail,
    category: 'du lịch hà nội',
  },
];

// Danh sách gợi ý theo dõi (Follow suggestions) đúng theo ảnh mẫu 2
const initialFollowSuggestions = [
  {
    id: 'user-1',
    username: 'uofpenn',
    displayName: 'University of Pennsylvania',
    isVerified: true,
    avatar: pennAvatar,
    bio: 'A member of the Ivy League, Penn is one of the oldest universities in America and one of the most prestigious educational institutions in the world.',
    followers: '85.5K followers',
    isFollowing: false,
  },
  {
    id: 'user-2',
    username: 'songphaivui_',
    displayName: 'Tiệm cà phê Sống vui',
    isVerified: false,
    avatar: songphaivuiAvatar,
    bio: 'Giờ mở cửa: 19:00 - 23:30\nĐịa chỉ: Lầu 3, Lô P chung cư Ngô Gia Tự, đường Hoà Hảo, phường Vườn Lài, TP.HCM....',
    followers: '1,171 followers',
    isFollowing: false,
  },
  {
    id: 'user-3',
    username: 'datawithly',
    displayName: 'Lý Data',
    isVerified: false,
    avatar: datawithlyAvatar,
    bio: 'Chia sẻ về Data Analytics và hành trình làm Data\nTham khảo khoá học Data tại đây 👇',
    followers: '1,648 followers',
    isFollowing: false,
  },
  {
    id: 'user-4',
    username: 'iamlily.thanhthao',
    displayName: 'Thanh Thảo',
    isVerified: false,
    avatar: lilyAvatar,
    bio: 'Lifestyle, coffee vibes & architecture photography in Saigon ✨\nWork with me: lilythao@contact.me',
    followers: '12.8K followers',
    isFollowing: false,
  },
  {
    id: 'user-5',
    username: 'f8team.official',
    displayName: 'F8 Fullstack',
    isVerified: true,
    avatar: f8Avatar,
    bio: 'Học lập trình để đi làm. Chia sẻ kiến thức React, Node.js, Frontend & Backend hàng ngày.',
    followers: '128K followers',
    isFollowing: false,
  },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [searchResults, setSearchResults] = useState({ topics: [], users: [] });
  const [feedPosts, setFeedPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [trendingList] = useState(initialTrendingList);
  const [followSuggestions, setFollowSuggestions] = useState(initialFollowSuggestions);
  const [toastMessage, setToastMessage] = useState(null);

  // Filter & Options menu dropdown
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('top'); // 'top' | 'recent' | 'profiles'
  const optionsRef = useRef(null);
  const searchInputRef = useRef(null);

  // Floating create thread modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalPlacement, setCreateModalPlacement] = useState('bottom-right');

  // Đóng dropdown tuỳ chọn khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setIsOptionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Đồng bộ URL search params ?q=...
  useEffect(() => {
    const urlQ = searchParams.get('q') || '';
    if (urlQ !== searchQuery) {
      setSearchQuery(urlQ);
      setDebouncedQuery(urlQ);
    }
  }, [searchParams]);

  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [debouncedQuery, setSearchParams]);

  // Tải thêm bài viết feed để kết hợp tìm kiếm bài viết
  useEffect(() => {
    getFeed({ type: 'for_you', page: 1, per_page: 30 })
      .then((res) => {
        if (Array.isArray(res?.data) && res.data.length > 0) {
          setFeedPosts(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Tổng hợp tất cả bài viết từ feed và mockPosts
  const allAvailablePosts = useMemo(() => {
    const list = [...feedPosts, ...mockPosts];
    const seen = new Set();
    return list.filter((p) => {
      if (!p || !p.id || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [feedPosts]);

  // Lọc bài viết theo query tìm kiếm
  const trimmedQuery = searchQuery.trim();
  const isSearching = trimmedQuery.length >= 2;
  const isQueryTooShort = trimmedQuery.length === 1;

  const matchingPosts = useMemo(() => {
    if (!trimmedQuery) return [];
    const q = trimmedQuery.toLowerCase();
    return allAvailablePosts.filter((p) => {
      const contentMatch = p.content && p.content.toLowerCase().includes(q);
      const authorMatch =
        (p.author?.username && p.author.username.toLowerCase().includes(q)) ||
        (p.author?.name && p.author.name.toLowerCase().includes(q));
      const tagMatch = p.tag && p.tag.toLowerCase().includes(q);
      return contentMatch || authorMatch || tagMatch;
    });
  }, [trimmedQuery, allAvailablePosts]);

  // Sắp xếp bài viết cho tab 'top' và 'recent'
  const sortedPosts = useMemo(() => {
    if (activeTab === 'recent') {
      return [...matchingPosts].sort((a, b) => {
        const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
        const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
        return timeB - timeA;
      });
    }
    // 'top' mặc định sắp xếp theo độ tương tác (likes, reposts, comments)
    return [...matchingPosts].sort((a, b) => {
      const scoreA = (a.likes || 0) + (a.reposts || 0) * 2 + (a.comments || 0) * 3;
      const scoreB = (b.likes || 0) + (b.reposts || 0) * 2 + (b.comments || 0) * 3;
      return scoreB - scoreA;
    });
  }, [matchingPosts, activeTab]);

  // 1. Lấy danh sách gợi ý theo dõi (Follow suggestions) từ API khi mount
  useEffect(() => {
    let isMounted = true;
    setIsSuggestionsLoading(true);

    getFollowSuggestionsApi({ page: 1, per_page: 20 })
      .then((res) => {
        if (!isMounted) return;
        const rawUsers = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.users)
          ? res.users
          : [];

        if (rawUsers.length > 0) {
          const mapped = rawUsers.map((u) => ({
            id: u.id,
            username: u.username,
            displayName: u.name || u.display_name || u.username,
            isVerified: !!u.verified,
            avatar: u.avatar_url || u.avatar,
            bio: u.bio || '',
            followers: `${(u.followers_count ?? 0).toLocaleString()} followers`,
            isFollowing: !!u.is_following,
          }));
          setFollowSuggestions(mapped);
        }
      })
      .catch((err) => {
        console.warn('Follow suggestions API fallback to default:', err);
      })
      .finally(() => {
        if (isMounted) setIsSuggestionsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Debounce query 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 3. Gọi API search khi debouncedQuery thay đổi (Ràng buộc: tối thiểu 2 ký tự theo backend)
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSearchResults({ topics: [], users: [] });
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    searchApi({ q: debouncedQuery, page: 1, per_page_topics: 10, per_page_users: 20 })
      .then((res) => {
        if (!isMounted) return;

        // Defensive unwrap: Hỗ trợ cả trường hợp res.data = { topics, users } hoặc res = { topics, users }
        const data =
          res?.data?.topics || res?.data?.users
            ? res.data
            : res?.topics || res?.users
            ? res
            : res?.data || {};

        const rawTopics = Array.isArray(data.topics) ? data.topics : [];
        const rawUsers = Array.isArray(data.users) ? data.users : [];

        setSearchResults({
          topics: rawTopics.map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            description: t.description || '',
            postCount: t.posts_count != null ? `${t.posts_count.toLocaleString()} posts` : '',
          })),
          users: rawUsers.map((u) => ({
            id: u.id,
            username: u.username,
            displayName: u.name || u.display_name || u.username,
            isVerified: !!u.verified,
            avatar: u.avatar_url || u.avatar,
            bio: u.bio || '',
            followers: `${(u.followers_count ?? 0).toLocaleString()} followers`,
            isFollowing: !!u.is_following,
          })),
        });
        setPagination(res?.pagination || null);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Search API error:', err);
        showToast('Không thể tải kết quả tìm kiếm');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  // Toggle theo dõi tài khoản
  const handleToggleFollow = async (userOrId) => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-auth-prompt'));
      return;
    }

    const user =
      typeof userOrId === 'object'
        ? userOrId
        : followSuggestions.find((u) => u.id === userOrId) ||
          searchResults.users.find((u) => u.id === userOrId);

    if (!user) return;

    const userId = user.id;
    const currentIsFollowing = user.isFollowing;
    const nextState = !currentIsFollowing;

    // Cập nhật lạc quan (Optimistic update)
    setFollowSuggestions((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isFollowing: nextState } : u))
    );
    setSearchResults((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === userId ? { ...u, isFollowing: nextState } : u
      ),
    }));

    showToast(
      nextState
        ? `Đã theo dõi @${user.username}`
        : `Đã bỏ theo dõi @${user.username}`
    );

    try {
      if (currentIsFollowing) {
        await unfollowUserApi(userId);
      } else {
        await followUserApi(userId);
      }
    } catch (err) {
      console.error('Follow action error:', err);
      // Rollback nếu thất bại
      setFollowSuggestions((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isFollowing: currentIsFollowing } : u))
      );
      setSearchResults((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === userId ? { ...u, isFollowing: currentIsFollowing } : u
        ),
      }));
      showToast('Thao tác không thành công, vui lòng thử lại');
    }
  };

  // Chọn category pill
  const handleSelectCategory = (cat) => {
    if (selectedCategory === cat) {
      setSelectedCategory(null);
      setSearchQuery('');
    } else {
      setSelectedCategory(cat);
      setSearchQuery(cat);
    }
  };

  return (
    <div className="flex justify-start items-start w-full relative">
      <div className="w-[660px] max-w-[660px] min-w-0 shrink-0">
        {/* 1. THANH TÌM KIẾM Ở TRÊN ĐẦU (SEARCH BAR) */}
        <div className="flex items-center gap-2 mb-3.5 select-none">
          {/* Hộp input tìm kiếm bo tròn */}
          <div className="relative flex-1 flex items-center bg-zinc-100 dark:bg-[#141414] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl px-4 py-3 transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-600">
            <Search className="w-4 h-4 text-zinc-500 shrink-0 stroke-2 mr-3" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedCategory && e.target.value !== selectedCategory) {
                  setSelectedCategory(null);
                }
              }}
              className="w-full bg-transparent text-sm sm:text-[15px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 outline-none"
            />

            {/* Spinner indicator khi đang gọi API tìm kiếm */}
            {isLoading && (
              <RadialSpinner className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
            )}

            {/* Nút xoá nhanh khi có nội dung */}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  searchInputRef.current?.focus();
                }}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white mr-1.5 cursor-pointer"
                title="Xoá tìm kiếm"
              >
                <X className="w-3.5 h-3.5 stroke-2" />
              </button>
            )}

            {/* Icon filter sliders bên phải input */}
            <button
              onClick={() => showToast('Bộ lọc tìm kiếm')}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer pl-1"
              title="Bộ lọc nâng cao"
            >
              <SlidersHorizontal className="w-4 h-4 stroke-2" />
            </button>
          </div>

          {/* Nút tuỳ chọn (...) hình tròn cạnh ô tìm kiếm */}
          <div className="relative shrink-0" ref={optionsRef}>
            <button
              onClick={() => setIsOptionsOpen((prev) => !prev)}
              className="w-10 h-10 rounded-full border border-zinc-300 dark:border-zinc-700/80 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Tuỳ chọn tìm kiếm"
            >
              <MoreHorizontal className="w-4 h-4 stroke-2" />
            </button>

            {isOptionsOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setIsOptionsOpen(false);
                    showToast('Đang hiển thị bài viết hàng đầu');
                    setActiveTab('top');
                  }}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-left text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                >
                  Top (Hàng đầu)
                </button>
                <button
                  onClick={() => {
                    setIsOptionsOpen(false);
                    showToast('Đang hiển thị bài viết gần đây');
                    setActiveTab('recent');
                  }}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-left text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                >
                  Recent (Gần đây)
                </button>
                <button
                  onClick={() => {
                    setIsOptionsOpen(false);
                    showToast('Đang lọc hồ sơ người dùng');
                    setActiveTab('profiles');
                  }}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-left text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                >
                  Profiles (Hồ sơ)
                </button>
                <button
                  onClick={() => {
                    setIsOptionsOpen(false);
                    setSearchQuery('');
                    setSelectedCategory(null);
                    showToast('Đã xoá lịch sử tìm kiếm');
                  }}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl cursor-pointer"
                >
                  Xoá lịch sử tìm kiếm
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. KHUNG CARD CHÍNH (CONTAINER) */}
        <main className="w-full bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl shadow-xs overflow-hidden transition-colors">
          {/* A. THANH CATEGORY PILLS CHỈ HIỂN THỊ KHI CHƯA NHẬP TÌM KIẾM */}
          {!isSearching && !isQueryTooShort && (
            <div className="px-4 pt-4 pb-3 sm:px-5">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
                {categoryTags.map((cat) => {
                  const isSelected = selectedCategory === cat || searchQuery === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleSelectCategory(cat)}
                      className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                          : 'bg-zinc-100 dark:bg-[#1e1e1e] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* B. KHI NGƯỜI DÙNG ĐANG TÌM KIẾM: GIAO DIỆN CHUẨN THREADS (Top | Recent | Profiles) */}
          {isSearching ? (
            <div className="pb-4">
              {/* TABS HEADER: Top | Recent | Profiles */}
              <div className="flex border-b border-zinc-200/80 dark:border-zinc-800">
                <button
                  onClick={() => setActiveTab('top')}
                  className={`flex-1 py-3.5 text-center text-sm sm:text-[15px] font-bold transition-colors relative cursor-pointer ${
                    activeTab === 'top'
                      ? 'text-black dark:text-white'
                      : 'text-zinc-500 hover:text-black dark:hover:text-zinc-300'
                  }`}
                >
                  Top
                  {activeTab === 'top' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`flex-1 py-3.5 text-center text-sm sm:text-[15px] font-bold transition-colors relative cursor-pointer ${
                    activeTab === 'recent'
                      ? 'text-black dark:text-white'
                      : 'text-zinc-500 hover:text-black dark:hover:text-zinc-300'
                  }`}
                >
                  Recent
                  {activeTab === 'recent' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('profiles')}
                  className={`flex-1 py-3.5 text-center text-sm sm:text-[15px] font-bold transition-colors relative cursor-pointer ${
                    activeTab === 'profiles'
                      ? 'text-black dark:text-white'
                      : 'text-zinc-500 hover:text-black dark:hover:text-zinc-300'
                  }`}
                >
                  Profiles
                  {activeTab === 'profiles' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
                  )}
                </button>
              </div>

              {/* Trạng thái Skeleton Loading */}
              {isLoading ? (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 sm:p-5 flex items-start gap-3 animate-pulse">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                      <div className="flex-1 space-y-2 py-1 min-w-0">
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-4/5" />
                        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* TAB TOP HOẶC RECENT: HIỂN THỊ BÀI VIẾT THREADS HOẶC CHỦ ĐỀ */}
                  {(activeTab === 'top' || activeTab === 'recent') && (
                    <div>
                      {sortedPosts.length > 0 ? (
                        <div>
                          {sortedPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                          ))}
                        </div>
                      ) : searchResults.topics.length > 0 ? (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                          <div className="px-5 pt-4 pb-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            Chủ đề ({searchResults.topics.length})
                          </div>
                          {searchResults.topics.map((topic) => (
                            <article
                              key={topic.id}
                              onClick={() => {
                                setSearchQuery(topic.name);
                                showToast(`Khám phá chủ đề: #${topic.name}`);
                              }}
                              className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-700 dark:text-zinc-300">
                                    <Hash className="w-4 h-4 stroke-2" />
                                  </div>
                                  <h4 className="font-bold text-sm sm:text-[15px] text-black dark:text-white leading-snug group-hover:underline">
                                    #{topic.name}
                                  </h4>
                                </div>
                                {topic.description && (
                                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed line-clamp-2 font-normal pl-10">
                                    {topic.description}
                                  </p>
                                )}
                                {topic.postCount && (
                                  <span className="text-xs text-zinc-400 dark:text-zinc-500 block mt-1 pl-10">
                                    {topic.postCount}
                                  </span>
                                )}
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center text-zinc-500">
                          <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                            Không tìm thấy bài viết phù hợp cho "{searchQuery}"
                          </p>
                          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                            Hãy thử chuyển sang tab Profiles hoặc tìm bằng từ khoá khác.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB PROFILES: HIỂN THỊ HỒ SƠ NGƯỜI DÙNG TỪ API SEARCH */}
                  {activeTab === 'profiles' && (
                    <div>
                      {searchResults.users.length > 0 ? (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                          {searchResults.users.map((user) => (
                            <div
                              key={user.id}
                              onClick={() => navigate(`/@${user.username}`)}
                              className="p-4 sm:p-5 flex items-start justify-between gap-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <AvatarWithFallback
                                  src={user.avatar}
                                  name={user.displayName}
                                  username={user.username}
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-sm sm:text-[15px] text-black dark:text-white hover:underline truncate">
                                      {user.username}
                                    </span>
                                    {user.isVerified && <VerifiedBadge />}
                                  </div>
                                  <p className="text-xs sm:text-sm text-zinc-500 font-normal truncate">
                                    {user.displayName}
                                  </p>
                                  {user.bio && (
                                    <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 mt-1 line-clamp-2 leading-relaxed whitespace-pre-line font-normal">
                                      {user.bio}
                                    </p>
                                  )}
                                  <span className="text-xs text-zinc-400 dark:text-zinc-500 block mt-1">
                                    {user.followers}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFollow(user);
                                }}
                                className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                                  user.isFollowing
                                    ? 'border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                    : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95'
                                }`}
                              >
                                {user.isFollowing ? 'Following' : 'Follow'}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center text-zinc-500">
                          <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                            Không tìm thấy hồ sơ người dùng cho "{searchQuery}"
                          </p>
                          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                            Hãy thử tìm kiếm với tên người dùng khác.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : isQueryTooShort ? (
            <div className="p-12 text-center text-zinc-500">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Nhập tối thiểu 2 ký tự để tìm kiếm
              </p>
            </div>
          ) : (
            /* C. CHẾ ĐỘ MẶC ĐỊNH (GIỐNG 100% ẢNH MẪU 1 VÀ ẢNH MẪU 2) */
            <div>
              {/* PHẦN 1: TRENDING NOW (ẢNH MẪU 1) */}
              <section className="border-t border-zinc-100 dark:border-zinc-800/70 pt-4">
                {/* Tiêu đề Trending now & phụ đề AI summary */}
                <div className="px-4 sm:px-5 mb-2">
                  <h3 className="text-base sm:text-lg font-bold text-black dark:text-white flex items-center gap-2">
                    <span>Trending now</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
                    What people are saying, summarized by AI
                  </p>
                </div>

                {/* Danh sách các chủ đề xu hướng */}
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                  {trendingList.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => {
                        setSearchQuery(item.title);
                        showToast(`Khám phá chủ đề: ${item.title}`);
                      }}
                      className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm sm:text-[15px] text-black dark:text-white leading-snug group-hover:underline">
                          {item.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2 font-normal">
                          {item.description} ·{' '}
                          <span className="text-zinc-400 dark:text-zinc-500">
                            {item.postCount}
                          </span>
                        </p>
                      </div>

                      {item.image && (
                        <ThumbnailWithFallback
                          src={item.image}
                          title={item.title}
                        />
                      )}
                    </article>
                  ))}
                </div>
              </section>

              {/* PHẦN 2: FOLLOW SUGGESTIONS (ẢNH MẪU 2) */}
              <section className="border-t border-zinc-100 dark:border-zinc-800/80 pt-5 pb-2">
                {/* Tiêu đề Follow suggestions */}
                <div className="px-4 sm:px-5 mb-2">
                  <h3 className="text-sm sm:text-base font-bold text-zinc-400 dark:text-zinc-400">
                    Follow suggestions
                  </h3>
                </div>

                {/* Danh sách tài khoản gợi ý */}
                {isSuggestionsLoading ? (
                  <div className="p-4 sm:p-5 space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3 animate-pulse">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                        <div className="flex-1 space-y-2 py-1 min-w-0">
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
                          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                        </div>
                        <div className="w-20 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                    {followSuggestions.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => navigate(`/@${user.username}`)}
                        className="p-4 sm:p-5 flex items-start justify-between gap-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                      >
                        {/* Avatar và thông tin tài khoản */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <AvatarWithFallback
                            src={user.avatar}
                            name={user.displayName}
                            username={user.username}
                          />

                          <div className="min-w-0 flex-1">
                            {/* Username & Blue verified badge */}
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm sm:text-[15px] text-black dark:text-white group-hover:underline truncate">
                                {user.username}
                              </span>
                              {user.isVerified && <VerifiedBadge />}
                            </div>

                            {/* Display name / subhead */}
                            <p className="text-xs sm:text-sm text-zinc-500 font-normal truncate">
                              {user.displayName}
                            </p>

                            {/* Bio mô tả (hỗ trợ xuống dòng) */}
                            {user.bio && (
                              <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 mt-1.5 line-clamp-3 leading-relaxed whitespace-pre-line font-normal">
                                {user.bio}
                              </p>
                            )}

                            {/* Số lượng follower */}
                            <span className="text-xs text-zinc-400 dark:text-zinc-500 block mt-1.5">
                              {user.followers}
                            </span>
                          </div>
                        </div>

                        {/* Nút Follow / Following */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFollow(user);
                          }}
                          className={`px-5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                            user.isFollowing
                              ? 'border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95'
                          }`}
                        >
                          {user.isFollowing ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>

      {/* 1. NÚT OUTLINE SỔ GHI CHÉP [+] Ở MÉP PHẢI GIỮA MÀN HÌNH */}
      {isAuthenticated && (
        <button
          onClick={() => {
            setCreateModalPlacement('bottom-right');
            setIsCreateModalOpen(true);
          }}
          className="fixed right-6 sm:right-8 top-1/2 -translate-y-1/2 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors z-40 cursor-pointer hidden lg:block"
          title="Tạo Thread mới"
          aria-label="Tạo Thread mới"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M8 3v18" />
            <path d="M15 9v6" />
            <path d="M12 12h6" />
          </svg>
        </button>
      )}

      {/* 2. NÚT NỔI VUÔNG BO GÓC DẤU CỘNG [+] Ở GÓC DƯỚI BÊN PHẢI */}
      {isAuthenticated && (
        <button
          id="floating-new-thread-btn"
          onClick={() => {
            setCreateModalPlacement('bottom-right');
            setIsCreateModalOpen(true);
          }}
          className="fixed bottom-7 right-7 sm:right-9 w-16 h-16 rounded-[16px] bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-700/60 shadow-2xl flex items-center justify-center text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer"
          title="Tạo Thread mới"
          aria-label="Tạo Thread mới"
        >
          <Plus className="w-6 h-6 stroke-[2.4]" />
        </button>
      )}

      {/* MODAL TẠO BÀI VIẾT */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        onSubmitPost={() => {
          showToast('Đã đăng bài viết mới thành công ✨');
        }}
        placement={createModalPlacement}
      />

      {/* TOAST THÔNG BÁO */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs sm:text-sm font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
