import { useState, useEffect, useRef } from 'react';
import { Plus, X, Search, Check } from 'lucide-react';

export default function CreateFeedModal({ isOpen, onClose, onFeedCreated }) {
  const [feedName, setFeedName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [topicsAndProfiles, setTopicsAndProfiles] = useState([]);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const modalRef = useRef(null);

  // Suggested fashion & aesthetic topics/profiles
  const suggestions = [
    { type: 'topic', label: '#smartcasual', desc: 'Smart Casual fashion discussion' },
    { type: 'topic', label: '#oldmoney', desc: 'Old Money & Sartorial aesthetic' },
    { type: 'topic', label: '#menswear', desc: 'Classic menswear & bespoke tailoring' },
    { type: 'topic', label: '#quietluxury', desc: 'Understated high-end style' },
    { type: 'profile', label: '@alexander.sartorial', desc: 'Alexander Vance · Sartorialist' },
    { type: 'profile', label: '@charles.savilerow', desc: 'Charles Montgomery · Tailoring' },
    { type: 'profile', label: '@oliver.sprezzatura', desc: 'Oliver Laurent · Milan' },
  ];

  // Đóng bằng phím Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (showItemPicker) {
          setShowItemPicker(false);
        } else {
          onClose();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showItemPicker, onClose]);

  // Reset form khi modal mở/đóng
  useEffect(() => {
    if (!isOpen) {
      setFeedName('');
      setDescription('');
      setIsPublic(false);
      setTopicsAndProfiles([]);
      setShowItemPicker(false);
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleItem = (itemLabel) => {
    if (topicsAndProfiles.includes(itemLabel)) {
      setTopicsAndProfiles(topicsAndProfiles.filter((i) => i !== itemLabel));
    } else {
      setTopicsAndProfiles([...topicsAndProfiles, itemLabel]);
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    const formatted = trimmed.startsWith('#') || trimmed.startsWith('@') ? trimmed : `#${trimmed}`;
    if (!topicsAndProfiles.includes(formatted)) {
      setTopicsAndProfiles([...topicsAndProfiles, formatted]);
    }
    setSearchTerm('');
  };

  const handleDone = () => {
    if (onFeedCreated) {
      onFeedCreated({
        name: feedName || 'Custom Feed',
        description,
        isPublic,
        items: topicsAndProfiles,
      });
    }
    onClose();
  };

  const filteredSuggestions = suggestions.filter((s) =>
    s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-feed-title"
        className="relative w-full max-w-120 bg-[#121212] border border-zinc-800 text-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
      >
        {/* Header: Cancel - Create feed - [empty] */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer select-none"
          >
            Cancel
          </button>
          <h2 id="create-feed-title" className="text-base font-bold text-white tracking-tight">
            Create feed
          </h2>
          <div className="w-12" aria-hidden="true" />
        </div>

        {/* Nội dung Form */}
        <div className="px-5 py-2 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Card 1: Feed name + brief description + Public feed toggle */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-zinc-800/80 space-y-3">
            {/* Input Tên Feed */}
            <div>
              <input
                type="text"
                value={feedName}
                onChange={(e) => setFeedName(e.target.value)}
                placeholder="Feed name"
                className="w-full bg-transparent text-white placeholder-zinc-500 font-semibold text-[15px] outline-none"
                autoFocus
              />
            </div>

            {/* Input Mô tả */}
            <div>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a brief description."
                className="w-full bg-transparent text-zinc-300 placeholder-zinc-500 text-sm outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Public feed toggle row */}
            <div className="pt-3 border-t border-zinc-800/60 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="font-bold text-[15px] text-white">Public feed</div>
                <p className="text-xs text-zinc-400 leading-relaxed pr-2">
                  When this is on, anyone can see and share this feed. The feed and its profiles may be suggested for others to follow.
                </p>
              </div>

              {/* Switch Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={isPublic}
                onClick={() => setIsPublic((prev) => !prev)}
                className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 p-0.5 cursor-pointer mt-0.5 ${
                  isPublic ? 'bg-white' : 'bg-zinc-800 border border-zinc-700/80'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full transition-transform ${
                    isPublic ? 'translate-x-5.5 bg-black' : 'translate-x-0 bg-zinc-400'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 2: In this feed */}
          <div>
            <div className="font-bold text-[15px] text-white mb-2">In this feed</div>

            {/* Danh sách các chips đã thêm */}
            {topicsAndProfiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {topicsAndProfiles.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700/80 text-white text-xs font-semibold animate-in fade-in zoom-in-95 duration-100"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item)}
                      className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                      title="Xóa"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Nút 'Add topics or profiles' */}
            <div
              onClick={() => setShowItemPicker((prev) => !prev)}
              className="bg-[#1a1a1a] rounded-2xl p-3.5 px-4 border border-zinc-800/80 flex items-center gap-3.5 cursor-pointer hover:bg-zinc-800/60 transition-colors select-none"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-white shrink-0">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-bold text-[15px] text-white">Add topics or profiles</span>
            </div>

            {/* Drawer / Sub-picker cho topics & profiles */}
            {showItemPicker && (
              <div className="mt-2.5 bg-[#1a1a1a] rounded-2xl p-3.5 border border-zinc-800/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <form onSubmit={handleAddCustom} className="relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search topics (#) or profiles (@)..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-14 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-700"
                  />
                  {searchTerm && (
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-white text-black text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  )}
                </form>

                <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                  {filteredSuggestions.map((s) => {
                    const isSelected = topicsAndProfiles.includes(s.label);
                    return (
                      <div
                        key={s.label}
                        onClick={() => handleToggleItem(s.label)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                          isSelected ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800/60 text-zinc-300'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs sm:text-sm font-semibold truncate text-white">{s.label}</div>
                          <div className="text-[11px] text-zinc-400 truncate">{s.desc}</div>
                        </div>
                        {isSelected ? (
                          <Check className="w-4 h-4 text-white shrink-0" />
                        ) : (
                          <Plus className="w-4 h-4 text-zinc-500 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Done button */}
        <div className="flex justify-end px-5 py-4 mt-2">
          <button
            type="button"
            onClick={handleDone}
            className="bg-white text-black font-bold text-sm px-6 py-2 rounded-full hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
