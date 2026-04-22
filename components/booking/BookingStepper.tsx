'use client'

/**
 * BookingStepper — visual 4-step progress indicator for /patient/request.
 * Uses the design token progression: filled primary bar for completed,
 * partial bar for active, neutral bar for future.
 * Pattern per prototype §step1-4 header.
 */
export function BookingStepper({
  currentStep,
  totalSteps = 4,
  labels,
}: {
  currentStep: number
  totalSteps?: number
  labels?: string[]
}) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Step ${currentStep + 1} of ${totalSteps}`}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const done = i < currentStep
        const active = i === currentStep
        return (
          <div
            key={i}
            className={`h-[3px] flex-1 rounded-full transition-colors ${
              done
                ? 'bg-primary'
                : active
                  ? 'bg-primary/60'
                  : 'bg-border'
            }`}
            aria-label={labels?.[i]}
          />
        )
      })}
    </div>
  )
}
