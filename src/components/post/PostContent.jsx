export default function PostContent({ text, media, threadBadge }) {
  const urls = media?.urls || (media?.url ? [media.url] : []);
  const cleanText = (text === '.' || text === '\u3164' || text?.trim() === '.' || text?.trim() === '\u3164') ? '' : text;

  return (
    <div className="mt-2 space-y-3">
      {/* Nội dung văn bản */}
      {(cleanText || threadBadge) && (
        <p className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-line leading-relaxed break-words">
          {cleanText}
          {threadBadge && (
            <span className="inline-flex items-center text-[11px] font-semibold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full select-none ml-2 align-middle">
              {threadBadge}
            </span>
          )}
        </p>
      )}

      {/* 1 ảnh / media */}
      {urls.length === 1 && (
        <div className="relative rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 max-h-115 flex items-center justify-center">
          <img
            src={urls[0]}
            alt={media?.alt || 'Post media'}
            className="w-full h-auto max-h-115 object-cover hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      {/* Nhiều ảnh: Horizontal Carousel lướt ngang thuần túy, ẩn scrollbar, không nút next/prev */}
      {urls.length > 1 && (
        <div className="my-1 select-none">
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1">
            {urls.map((url, idx) => (
              <div
                key={idx}
                className="relative shrink-0 snap-start h-80 sm:h-96 w-[230px] sm:w-[270px] rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-xs"
              >
                <img
                  src={url}
                  alt={`Media ${idx + 1}`}
                  className="w-full h-full object-cover select-none hover:scale-[1.01] transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
