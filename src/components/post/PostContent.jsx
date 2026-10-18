export default function PostContent({ text, media }) {
  const urls = media?.urls || (media?.url ? [media.url] : []);

  return (
    <div className="mt-2 space-y-3">
      {/* Nội dung văn bản */}
      {text && (
        <p className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-line leading-relaxed break-words">
          {text}
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

      {/* Nhiều ảnh / media: Grid layout chuẩn mạng xã hội */}
      {urls.length > 1 && (
        <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
          {urls.slice(0, 4).map((url, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 rounded-xl h-48 sm:h-56 ${
                urls.length === 3 && idx === 0 ? 'col-span-2 h-64' : ''
              }`}
            >
              <img
                src={url}
                alt={`Media ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                loading="lazy"
              />
              {urls.length > 4 && idx === 3 && (
                <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-lg select-none">
                  +{urls.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
