import { useState, useRef, useEffect } from 'react';
import {
  Search,
  SquarePen,
  ArrowLeft,
  Image as ImageIcon,
  Heart,
  Send,
  X,
  CheckCircle2,
  MoreHorizontal,
  Info,
} from 'lucide-react';
import { initialConversations, suggestedUsers } from './mockConversations';

export default function MessagesPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'requests'
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Cuộn xuống tin nhắn mới nhất khi có tin nhắn mới hoặc đổi đoạn chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversationId]);

  // Cuộc trò chuyện đang chọn
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  // Lọc cuộc trò chuyện theo ô tìm kiếm
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.user.name.toLowerCase().includes(q) ||
      c.user.username.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  // Chọn cuộc trò chuyện và đánh dấu đã đọc
  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c))
    );
  };

  // Gửi tin nhắn trong cuộc trò chuyện
  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversationId) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            lastMessage: newMsg.text,
            timestamp: 'Vừa xong',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    const sentText = messageInput.trim();
    setMessageInput('');

    // Phản hồi tự động mô phỏng từ người nhận sau 1.5 giây
    setTimeout(() => {
      const autoReply = {
        id: `msg-reply-${Date.now()}`,
        sender: 'them',
        text: `Cảm ơn bạn đã nhắn tin! Về "${sentText}", mình sẽ phản hồi chi tiết sớm nhất nhé ✨`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              lastMessage: autoReply.text,
              timestamp: 'Vừa xong',
              messages: [...c.messages, autoReply],
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Bắt đầu cuộc trò chuyện mới từ modal
  const handleStartConversation = (user) => {
    const existing = conversations.find((c) => c.user.username === user.username);
    if (existing) {
      setActiveConversationId(existing.id);
    } else {
      const newConv = {
        id: `conv-${Date.now()}`,
        user: {
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          isVerified: user.isVerified || false,
        },
        lastMessage: 'Bắt đầu cuộc trò chuyện',
        timestamp: 'Vừa xong',
        unread: false,
        messages: [],
      };
      setConversations([newConv, ...conversations]);
      setActiveConversationId(newConv.id);
    }
    setIsNewMessageModalOpen(false);
    setModalSearchQuery('');
  };

  return (
    <div className="h-full w-full flex bg-white dark:bg-black text-black dark:text-white overflow-hidden select-none">
      {/* 1. CỘT TRÁI: Danh sách Tin nhắn (Messages List Pane) */}
      <section
        className={`w-full md:w-96 md:min-w-96 shrink-0 h-full flex flex-col border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-black transition-all ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header: Tiêu đề 'Messages' & Nút Compose */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            Messages
          </h1>
          <button
            onClick={() => setIsNewMessageModalOpen(true)}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-black dark:text-white transition-colors cursor-pointer"
            title="Tin nhắn mới"
            aria-label="Tin nhắn mới"
          >
            <SquarePen className="w-5 h-5 stroke-2" />
          </button>
        </div>

        {/* Thanh tìm kiếm Search */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2.5 bg-zinc-100 dark:bg-[#1a1a1a] border border-zinc-200/80 dark:border-zinc-800 rounded-full px-3.5 py-2 transition-colors focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
            <Search className="w-4 h-4 text-zinc-500 shrink-0 stroke-2" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-black dark:text-white placeholder-zinc-500 outline-none font-normal"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bộ lọc Tabs: Inbox & Requests */}
        <div className="flex items-center gap-2 px-5 pb-3">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'inbox'
                ? 'bg-zinc-900 text-white dark:bg-[#262626] dark:text-white'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Inbox
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-zinc-900 text-white dark:bg-[#262626] dark:text-white'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Requests
          </button>
        </div>

        {/* Danh sách cuộc trò chuyện */}
        <div className="flex-1 overflow-y-auto scrollbar-none no-scrollbar divide-y divide-transparent">
          {activeTab === 'requests' ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              Không có tin nhắn chờ nào.
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              Không tìm thấy cuộc trò chuyện nào.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = c.id === activeConversationId;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectConversation(c.id)}
                  className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-zinc-100/90 dark:bg-zinc-900/80'
                      : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={c.user.avatar}
                      alt={c.user.name}
                      className="w-12 h-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                    />
                    {c.unread && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white dark:border-black rounded-full" />
                    )}
                  </div>

                  {/* Thông tin & Tin nhắn mới nhất */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-semibold text-sm text-black dark:text-white truncate">
                          {c.user.username}
                        </span>
                        {c.user.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 fill-blue-500 text-white shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
                        {c.timestamp}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        c.unread
                          ? 'font-semibold text-black dark:text-white'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {c.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 2. CỘT PHẢI: Khung Chat hoặc Trạng thái trống (Empty State) */}
      <main
        className={`flex-1 h-full flex flex-col bg-white dark:bg-black relative ${
          !activeConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConversation ? (
          // Giao diện khi ĐANG MỞ một cuộc trò chuyện
          <div className="h-full flex flex-col">
            {/* Chat Header */}
            <header className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Nút quay lại trên mobile */}
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="p-1 -ml-1 rounded-full text-zinc-400 hover:text-white md:hidden cursor-pointer"
                  title="Quay lại danh sách"
                >
                  <ArrowLeft className="w-5 h-5 stroke-2" />
                </button>

                <img
                  src={activeConversation.user.avatar}
                  alt={activeConversation.user.name}
                  className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-1 font-bold text-sm text-black dark:text-white truncate">
                    <span>{activeConversation.user.username}</span>
                    {activeConversation.user.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 fill-blue-500 text-white shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 truncate">
                    {activeConversation.user.name}
                  </p>
                </div>
              </div>

              {/* Nút tuỳ chọn chat */}
              <div className="flex items-center gap-2 text-zinc-400">
                <button
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  title="Thông tin cuộc trò chuyện"
                >
                  <Info className="w-5 h-5 stroke-2" />
                </button>
              </div>
            </header>

            {/* Vùng tin nhắn Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-none no-scrollbar flex flex-col">
              {activeConversation.messages.map((m) => {
                const isMe = m.sender === 'me';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[75%] sm:max-w-md ${
                      isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-zinc-100 dark:bg-[#262626] text-black dark:text-white rounded-bl-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 px-1">
                      {m.timestamp}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Thanh soạn thảo tin nhắn Chat Input */}
            <footer className="p-4 border-t border-zinc-200 dark:border-zinc-800/80 shrink-0">
              <div className="flex items-center gap-3 bg-zinc-100 dark:bg-[#1a1a1a] border border-zinc-200/80 dark:border-zinc-800 rounded-full px-4 py-2.5">
                <input
                  type="text"
                  placeholder="Message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-sm text-black dark:text-white placeholder-zinc-500 outline-none"
                />

                <div className="flex items-center gap-2.5 text-zinc-400 shrink-0">
                  <button
                    type="button"
                    title="Đính kèm ảnh"
                    className="hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-5 h-5 stroke-2" />
                  </button>

                  {messageInput.trim() ? (
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      title="Gửi"
                      className="text-blue-500 hover:text-blue-400 font-semibold transition-colors cursor-pointer p-1"
                    >
                      <Send className="w-5 h-5 stroke-2" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      title="Thả tim"
                      onClick={() => {
                        setMessageInput('❤️');
                      }}
                      className="hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Heart className="w-5 h-5 stroke-2" />
                    </button>
                  )}
                </div>
              </div>
            </footer>
          </div>
        ) : (
          // TRẠNG THÁI TRỐNG (MẪU CHUẨN SCREENSHOT: Keep it real in direct messages)
          <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none">
            {/* Biểu tượng máy bay giấy lớn trong vòng tròn */}
            <div className="w-24 h-24 rounded-full border border-zinc-300 dark:border-zinc-700/80 flex items-center justify-center text-zinc-500 dark:text-zinc-300 mb-2">
              <svg
                viewBox="0 0 24 24"
                className="w-10 h-10 fill-none stroke-current stroke-1 -rotate-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </div>

            {/* Tiêu đề chính */}
            <h2 className="text-xl font-bold text-black dark:text-white mt-4">
              Keep it real in direct messages
            </h2>

            {/* Mô tả phụ */}
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
              Start a side conversation, send threads and more.
            </p>

            {/* Nút 'New message' trắng nổi bật */}
            <button
              onClick={() => setIsNewMessageModalOpen(true)}
              className="mt-6 px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-sm rounded-full hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              New message
            </button>
          </div>
        )}
      </main>

      {/* 3. MODAL SOẠN TIN NHẮN MỚI (New Message Modal) */}
      {isNewMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-base text-black dark:text-white">
                New message
              </h3>
              <button
                onClick={() => setIsNewMessageModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5 stroke-2" />
              </button>
            </div>

            {/* Ô tìm kiếm người nhận */}
            <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
              <span className="text-sm font-semibold text-zinc-400">To:</span>
              <input
                type="text"
                placeholder="Search for people..."
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-sm text-black dark:text-white placeholder-zinc-500 outline-none"
              />
            </div>

            {/* Danh sách người dùng gợi ý */}
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-transparent scrollbar-none no-scrollbar">
              <span className="px-3 py-1.5 text-xs font-semibold text-zinc-500 block">
                Suggested
              </span>
              {[...conversations.map((c) => c.user), ...suggestedUsers]
                .filter((u, idx, arr) => arr.findIndex((x) => x.username === u.username) === idx)
                .filter((u) => {
                  const q = modalSearchQuery.toLowerCase().trim();
                  if (!q) return true;
                  return (
                    u.name.toLowerCase().includes(q) ||
                    u.username.toLowerCase().includes(q)
                  );
                })
                .map((u) => (
                  <div
                    key={u.username}
                    onClick={() => handleStartConversation(u)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
                  >
                    <img
                      src={u.avatar}
                      alt={u.username}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 font-semibold text-sm text-black dark:text-white truncate">
                        <span>{u.username}</span>
                        {u.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 fill-blue-500 text-white shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 truncate">{u.name}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
