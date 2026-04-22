'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Star, Loader2 } from 'lucide-react'

/**
 * Post-consultation review card — appears in /patient/dashboard whenever
 * a consultation with status='completed' exists and no row in
 * consultation_reviews yet links to it.
 *
 * 1-5 stars + optional comment + "make public" checkbox.
 * Submits to Supabase; the `update_doctor_rating` trigger recalculates
 * the doctor's average automatically.
 */
export function PostConsultationReview({
  consultationId,
  doctorId,
  doctorName,
  onSubmitted,
}: {
  consultationId: string
  doctorId: string
  doctorName: string
  onSubmitted?: () => void
}) {
  const t = useTranslations('review')
  const { toast } = useToast()

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = rating >= 1 && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSubmitting(false)
      return
    }
    const { error } = await supabase.from('consultation_reviews').insert({
      consultation_id: consultationId,
      patient_id: user.id,
      doctor_id: doctorId,
      rating,
      comment: comment.trim() || null,
      is_public: isPublic,
    })
    setSubmitting(false)
    if (error) {
      toast({ title: t('errorSubmit'), description: error.message, variant: 'destructive' })
      return
    }
    toast({ title: t('thanks'), variant: 'success' })
    onSubmitted?.()
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
      <div>
        <h3 className="text-[18px] font-bold tracking-[-0.3px]">{t('rateDoctor')}</h3>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          {t('rateDoctorDesc')} · <span className="font-medium text-foreground">{doctorName}</span>
        </p>
      </div>

      {/* Stars */}
      <div
        className="flex items-center gap-1.5"
        role="radiogroup"
        aria-label={t('rateDoctor')}
      >
        {[1, 2, 3, 4, 5].map(i => {
          const filled = i <= (hoverRating || rating)
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={rating === i}
              aria-label={`${i} star${i > 1 ? 's' : ''}`}
              onClick={() => setRating(i)}
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-amber-50 transition-colors active:scale-95"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  filled ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'
                }`}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder={t('commentPlaceholder')}
        rows={3}
        maxLength={500}
        className="w-full rounded-xl border-[1.5px] border-border bg-background px-3.5 py-3 text-[14px] focus:border-primary focus:outline-none transition-colors resize-none"
      />

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={e => setIsPublic(e.target.checked)}
          className="h-5 w-5 rounded-[6px] border-border accent-primary flex-shrink-0"
        />
        <span className="text-[13px] text-foreground">{t('makePublic')}</span>
      </label>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full h-12 text-[15px] font-semibold"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {t('submit')}
      </Button>
    </div>
  )
}
