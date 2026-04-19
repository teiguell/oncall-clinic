'use client'

import {
  Send, CheckCircle, Navigation, Stethoscope, FileText, MessageCircle,
  Check, type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface ServiceTimelineProps {
  /** 0-5, undefined shows all greyed (landing explainer mode) */
  currentStep?: number
  /** mobile always vertical; desktop respects orientation prop */
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

const STEPS: { icon: LucideIcon; titleKey: string; descKey: string }[] = [
  { icon: Send,          titleKey: 'step1', descKey: 'step1Desc' },
  { icon: CheckCircle,   titleKey: 'step2', descKey: 'step2Desc' },
  { icon: Navigation,    titleKey: 'step3', descKey: 'step3Desc' },
  { icon: Stethoscope,   titleKey: 'step4', descKey: 'step4Desc' },
  { icon: FileText,      titleKey: 'step5', descKey: 'step5Desc' },
  { icon: MessageCircle, titleKey: 'step6', descKey: 'step6Desc' },
]

export function ServiceTimeline({
  currentStep,
  orientation = 'horizontal',
  className,
}: ServiceTimelineProps) {
  const t = useTranslations('timeline')
  const isExplainerMode = currentStep === undefined

  return (
    <div className={cn('w-full', className)}>
      <ol
        className={cn(
          orientation === 'horizontal'
            ? 'hidden md:flex md:items-start md:justify-between md:gap-2'
            : 'hidden',
        )}
      >
        {STEPS.map((step, idx) => {
          const status = isExplainerMode
            ? 'pending'
            : idx < (currentStep ?? 0) ? 'done'
            : idx === currentStep ? 'current'
            : 'pending'
          return <DesktopStep key={idx} step={step} status={status} index={idx} total={STEPS.length} t={t} />
        })}
      </ol>

      {/* Mobile: always vertical */}
      <ol className={cn(orientation === 'horizontal' ? 'md:hidden space-y-3' : 'space-y-3')}>
        {STEPS.map((step, idx) => {
          const status = isExplainerMode
            ? 'pending'
            : idx < (currentStep ?? 0) ? 'done'
            : idx === currentStep ? 'current'
            : 'pending'
          return <MobileStep key={idx} step={step} status={status} index={idx} total={STEPS.length} t={t} />
        })}
      </ol>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t('avgResponse')}
      </p>
    </div>
  )
}

type Status = 'done' | 'current' | 'pending'
type T = ReturnType<typeof useTranslations>

function DesktopStep({
  step, status, index, total, t,
}: {
  step: { icon: LucideIcon; titleKey: string; descKey: string }
  status: Status
  index: number
  total: number
  t: T
}) {
  const Icon = step.icon
  const isLast = index === total - 1
  return (
    <li className="flex-1 relative">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
            status === 'done' && 'bg-emerald-500 border-emerald-500 text-white',
            status === 'current' && 'bg-primary border-primary text-white animate-pulse',
            status === 'pending' && 'bg-gray-100 border-gray-200 text-gray-400',
          )}
        >
          {status === 'done' ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </div>
        <p className={cn('mt-2 text-xs font-medium text-center max-w-[120px]', status === 'pending' ? 'text-gray-400' : 'text-foreground')}>
          {t(step.titleKey as 'step1')}
        </p>
      </div>
      {!isLast && (
        <div
          className={cn(
            'absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 -z-0',
            status === 'done' ? 'bg-emerald-500' : 'bg-gray-200',
          )}
          aria-hidden="true"
        />
      )}
    </li>
  )
}

function MobileStep({
  step, status, index, total, t,
}: {
  step: { icon: LucideIcon; titleKey: string; descKey: string }
  status: Status
  index: number
  total: number
  t: T
}) {
  const Icon = step.icon
  const isLast = index === total - 1
  return (
    <li className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors shrink-0',
            status === 'done' && 'bg-emerald-500 border-emerald-500 text-white',
            status === 'current' && 'bg-primary border-primary text-white animate-pulse',
            status === 'pending' && 'bg-gray-100 border-gray-200 text-gray-400',
          )}
        >
          {status === 'done' ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </div>
        {!isLast && (
          <div className={cn('w-0.5 flex-1 mt-1', status === 'done' ? 'bg-emerald-500' : 'bg-gray-200')} aria-hidden="true" />
        )}
      </div>
      <div className="pb-3 flex-1">
        <p className={cn('font-medium text-sm', status === 'pending' ? 'text-gray-400' : 'text-foreground')}>
          {t(step.titleKey as 'step1')}
        </p>
        <p className="text-xs text-muted-foreground">{t(step.descKey as 'step1Desc')}</p>
      </div>
    </li>
  )
}
