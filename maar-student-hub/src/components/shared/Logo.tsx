/**
 * Signature mark: the "A" pair in MAAR is rendered as two overlapping
 * triangles forming a subtle bookmark/roof shape — study material (the
 * page) meeting progress (the peak). Deliberately not a generic
 * gradient blob or abstract swirl; it reads at 16px and at 160px.
 */
export function Logo({ size = 28, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="9" className="fill-navy-800 dark:fill-navy-700" />
        <path d="M16 8L23 22H9L16 8Z" className="fill-emerald-500" />
        <path d="M16 14L20 22H12L16 14Z" className="fill-navy-800 dark:fill-navy-700" />
      </svg>
      {withWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-ink-900 dark:text-white">
          MAAR
        </span>
      )}
    </div>
  );
}
