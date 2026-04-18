"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  doctorId: string
  doctorName: string
  doctorEmail: string
}

export function AdminVerificationActions({ doctorId, doctorName, doctorEmail }: Props) {
  const t = useTranslations('admin')
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const updateStatus = async (status: 'verified' | 'rejected') => {
    if (status === 'rejected' && !showRejectInput) {
      setShowRejectInput(true)
      return
    }

    setLoading(status === 'verified' ? 'approve' : 'reject')
    const supabase = createClient()

    const updateData: Record<string, unknown> = { verification_status: status }
    if (status === 'rejected' && rejectionReason.trim()) {
      updateData.rejection_reason = rejectionReason.trim()
    }

    const { error } = await supabase
      .from('doctor_profiles')
      .update(updateData)
      .eq('id', doctorId)

    if (!error) {
      // Create notification for the doctor
      const { data: doctorUser } = await supabase
        .from('doctor_profiles')
        .select('user_id')
        .eq('id', doctorId)
        .single()

      if (doctorUser) {
        await supabase.from('notifications').insert({
          user_id: doctorUser.user_id,
          title: status === 'verified' ? t('verifications.accountVerified') : t('verifications.applicationReviewed'),
          body: status === 'verified'
            ? t('verifications.approvedNotification')
            : rejectionReason.trim()
              ? `${t('verifications.rejectedNotification')} — ${rejectionReason.trim()}`
              : t('verifications.rejectedNotification'),
          type: 'verification',
          data: { status, rejectionReason: rejectionReason.trim() || undefined },
        })
      }

      toast({
        title: status === 'verified'
          ? `${t('verifications.approvedToast', { name: doctorName })}`
          : `${t('verifications.rejectedToast', { name: doctorName })}`,
        variant: status === 'verified' ? 'success' : 'default',
      })
      router.refresh()
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
    setLoading(null)
    setShowRejectInput(false)
    setRejectionReason('')
  }

  return (
    <div className="mt-4 pt-4 border-t space-y-3">
      {showRejectInput && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">
            {t('verifications.rejectionReason')}
          </label>
          <textarea
            className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
            placeholder={t('verifications.rejectionReasonPlaceholder')}
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        {showRejectInput && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => { setShowRejectInput(false); setRejectionReason('') }}
          >
            {t('verifications.cancel')}
          </Button>
        )}
        <div className="flex-1" />
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1.5"
          onClick={() => updateStatus('rejected')}
          loading={loading === 'reject'}
        >
          <XCircle className="h-3.5 w-3.5" />
          {showRejectInput ? t('verifications.confirmReject') : t('verifications.reject')}
        </Button>
        {!showRejectInput && (
          <Button
            size="sm"
            variant="success"
            className="flex items-center gap-1.5"
            onClick={() => updateStatus('verified')}
            loading={loading === 'approve'}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {t('verifications.approve')}
          </Button>
        )}
      </div>
    </div>
  )
}
