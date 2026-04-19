import { cn } from '@/lib/utils'

/**
 * Skeleton loader — uses shimmer gradient (UX_MASTERGUIDE §5).
 * Replaces generic spinner with perceived-fast placeholders.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton-shimmer rounded-md', className)} aria-hidden="true" {...props} />
}

export { Skeleton }
