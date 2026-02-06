import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  max?: number;
  showValue?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function StarRating({
  rating,
  max = 5,
  showValue = false,
  className,
  ariaLabel,
}: StarRatingProps) {
  const value = Math.min(max, Math.max(0, rating));
  const full = Math.floor(value);
  const hasHalf = value % 1 >= 0.5;
  const empty = max - full - (hasHalf ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      <span
        className="flex items-center gap-0.5"
        role="img"
        aria-label={ariaLabel ?? `Note : ${value} sur ${max}`}
      >
        {Array.from({ length: full }, (_, i) => (
          <span key={`full-${i}`} className="text-primary" aria-hidden>
            ★
          </span>
        ))}
        {hasHalf && (
          <span className="text-primary opacity-80" aria-hidden>
            ★
          </span>
        )}
        {Array.from({ length: empty }, (_, i) => (
          <span key={`empty-${i}`} className="text-muted-foreground/50" aria-hidden>
            ★
          </span>
        ))}
      </span>
      {showValue && (
        <span className="ml-1 text-sm font-medium tabular-nums">
          {value % 1 === 0 ? value : value.toFixed(1)}/{max}
        </span>
      )}
    </div>
  );
}
