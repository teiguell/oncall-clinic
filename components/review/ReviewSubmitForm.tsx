'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Star, Check, Loader2 } from 'lucide-react'

/**
 * ReviewSubmitForm — Round 17-C client island.
 *
 * Renders one of three states:
 *   - alreadySubmitted=true: thank-you panel
 *   - submitted (after POST): success card
 *   - default: 5-star picker + optional comment + submit
 *
 * The token can be either a review_token or a consultation_id; the
 * server route handles both. We just pass it through.
 */
export function ReviewSubmitForm({
  locale: _locale,
  token,
  doctorName,
  alreadySubmitted,
}: {
  locale: string
  token: string
  doctorName: string | null
  alreadySubmitted: boolean
}) {
  const t = useTranslations('review')
  const [rating, setRating] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submittedNow, setSubmittedNow] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (rating == null || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          rating,
          comment: comment.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? 'submit_failed')
        setSubmitting(false)
        return
      }
      setSubmittedNow(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'network_error')
      setSubmitting(false)
    }
  }

  if (alreadySubmitted || submittedNow) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 grid place-items-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-emerald-100">
          <div
            className="grid place-items-center mx-auto mb-4 bg-emerald-100"
            style={{ width: 56, height: 56, borderRadius: '50%' }}
            aria-hidden="true"
          >
            <Check className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-[#0B1220]">{t('thanks')}</h1>
          <p className="text-slate-600 mt-2 leading-relaxed text-[14.5px]">
            {alreadySubmitted ? t('alreadyDone') : t('thanksBody')}
          </p>
        </div>
      </main>
    )
  }

  const display = hover ?? rating ?? 0

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 grid place-items-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-slate-100">
        <h1
          className="text-center font-bold text-[#0B1220]"
          style={{ fontSize: 22, letterSpacing: '-0.01em' }}
        >
          {t('title', { name: doctorName ?? t('yourDoctor') })}
        </h1>
        <p className="text-center text-slate-600 mt-1.5 text-[14px]">{t('subtitle')}</p>

        {/* Star picker */}
        <div className="flex justify-center gap-1.5 mt-6" role="radiogroup" aria-label={t('ratingLabel')}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setRating(n)}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors min-w-[44px] min-h-[44px]"
            >
              <Star
                className={`h-9 w-9 transition-colors ${
                  n <= display
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        {/* Comment */}
        <label className="block mt-6">
          <span className="block text-[13.5px] font-medium text-slate-700 mb-1.5">
            {t('commentLabel')}
          </span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            rows={3}
            placeholder={t('commentPlaceholder')}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[14.5px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <span className="block text-right text-[11px] text-slate-400 mt-1">
            {comment.length}/500
          </span>
        </label>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-[13px]">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={rating == null || submitting}
          className="mt-5 w-full inline-flex items-center justify-center text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            padding: '13px 18px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            fontSize: 15,
            letterSpacing: '-0.2px',
            minHeight: 48,
          }}
        >
          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {t('submit')}
        </button>
      </div>
    </main>
  )
}
