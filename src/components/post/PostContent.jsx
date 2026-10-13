export default function PostContent({ text, media }) {
  return (
    <div className="mt-2 space-y-3">
      {/* Nội dung văn bản */}
      {text && (
        <p className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-line leading-relaxed">
          {text}
        </p>
      )}

      {/* Hình ảnh / Media (nếu có) */}
      {media && media.url && (
        <div className="relative rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 max-h-115 flex items-center justify-center">
          <img
            src={media.url}
            alt={media.alt || 'Post media'}
            className="w-full h-auto max-h-115 object-cover hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
