import { cn } from '@/lib/utils'

/**
 * Skeleton loader — uses shimmer gradient (UX_MASTERGUIDE §5).
 * Replaces generic spinners with perceived-fast placeholders.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton-shimmer rounded-md', className)} aria-hidden="true" {...props} />
}

/**
 * DoctorCardSkeleton — matches the shape of a Zocdoc-style doctor card.
 */
function DoctorCardSkeleton() {
  return (
    <div className="rounded-card border border-border/60 bg-card p-4 shadow-card" aria-hidden="true">
      <div className="flex items-start gap-4">
        <div className="skeleton-shimmer h-14 w-14 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-shimmer h-4 w-2/3 rounded" />
          <div className="skeleton-shimmer h-3 w-1/2 rounded" />
          <div className="skeleton-shimmer h-3 w-1/3 rounded" />
        </div>
      </div>
      <div className="skeleton-shimmer mt-4 h-10 w-full rounded-button" />
    </div>
  )
}

/**
 * ConsultationCardSkeleton — matches the list item shape used in
 * patient/history and doctor/consultations.
 */
function ConsultationCardSkeleton() {
  return (
    <div className="rounded-card border border-border/60 bg-card p-4 shadow-card" aria-hidden="true">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton-shimmer h-6 w-20 rounded-full" />
        <div className="skeleton-shimmer h-3 w-16 rounded" />
      </div>
      <div className="skeleton-shimmer h-4 w-4/5 rounded mb-2" />
      <div className="skeleton-shimmer h-3 w-2/3 rounded" />
    </div>
  )
}

/**
 * TrackingMapSkeleton — large map placeholder with a status card below.
 */
function TrackingMapSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="skeleton-shimmer h-[50vh] w-full rounded-card" />
      <div className="rounded-card border border-border/60 bg-card p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="skeleton-shimmer h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton-shimmer h-4 w-1/3 rounded" />
            <div className="skeleton-shimmer h-3 w-1/4 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export { Skeleton, DoctorCardSkeleton, ConsultationCardSkeleton, TrackingMapSkeleton }
