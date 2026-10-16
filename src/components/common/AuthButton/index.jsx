export default function AuthButton({
  children,
  type = "submit",
  isLoading = false,
  disabled = false,
  onClick,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      onClick={onClick}
      className={`w-full h-13.5 rounded-2xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm sm:text-base active:scale-99 transition-all cursor-pointer flex items-center justify-center shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
