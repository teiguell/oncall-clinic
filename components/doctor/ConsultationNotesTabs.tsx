'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Lock, FileText, Check, Loader2 } from 'lucide-react'

type Tab = 'internal' | 'report'

/**
 * Doctor-facing tabs for consultation notes. Separates:
 *   - doctor_internal_notes (private, never visible to the patient)
 *   - patient_report (shared with the patient on finish)
 *
 * Both fields autosave to `consultations` with a 3-second debounce.
 * "Finalizar consulta" flips status='completed' + stamps completed_at.
 */
export function ConsultationNotesTabs({
  consultationId,
  initialInternalNotes,
  initialPatientReport,
  onFinished,
}: {
  consultationId: string
  initialInternalNotes?: string | null
  initialPatientReport?: string | null
  onFinished?: () => void
}) {
  const t = useTranslations('consultation')
  const { toast } = useToast()

  const [tab, setTab] = useState<Tab>('internal')
  const [internalNotes, setInternalNotes] = useState(initialInternalNotes ?? '')
  const [patientReport, setPatientReport] = useState(initialPatientReport ?? '')
  const [saving, setSaving] = useState<null | 'internal' | 'report'>(null)
  const [savedAt, setSavedAt] = useState<Record<Tab, number | null>>({
    internal: null,
    report: null,
  })
  const [finishing, setFinishing] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveField = async (field: 'doctor_internal_notes' | 'patient_report', value: string) => {
    const key: Tab = field === 'doctor_internal_notes' ? 'internal' : 'report'
    setSaving(key)
    const supabase = createClient()
    const { error } = await supabase
      .from('consultations')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', consultationId)
    setSaving(null)
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      return
    }
    setSavedAt(prev => ({ ...prev, [key]: Date.now() }))
  }

  // 3s debounced autosave on either textarea change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (tab === 'internal') void saveField('doctor_internal_notes', internalNotes)
      else void saveField('patient_report', patientReport)
    }, 3000)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalNotes, patientReport, tab])

  const handleFinish = async () => {
    setFinishing(true)
    const supabase = createClient()
    // Ensure latest text is flushed before closing
    const { error } = await supabase
      .from('consultations')
      .update({
        doctor_internal_notes: internalNotes,
        patient_report: patientReport,
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', consultationId)
    setFinishing(false)
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      return
    }
    onFinished?.()
  }

  const savedLabel = (key: Tab) => {
    if (saving === key) return { icon: <Loader2 className="h-3 w-3 animate-spin" />, text: t('saving') }
    if (savedAt[key]) return { icon: <Check className="h-3 w-3" />, text: t('savedDraft') }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'internal'}
          onClick={() => setTab('internal')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-lg text-[13px] font-medium transition-colors inline-flex items-center justify-center gap-1.5 ${
            tab === 'internal' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
          }`}
        >
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          {t('internalNotes')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'report'}
          onClick={() => setTab('report')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-lg text-[13px] font-medium transition-colors inline-flex items-center justify-center gap-1.5 ${
            tab === 'report' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
          }`}
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          {t('patientReport')}
        </button>
      </div>

      {tab === 'internal' && (
        <div className="space-y-2">
          <p className="text-[12px] text-muted-foreground">{t('internalNotesDesc')}</p>
          <textarea
            value={internalNotes}
            onChange={e => setInternalNotes(e.target.value)}
            placeholder={t('internalNotesPlaceholder')}
            rows={8}
            className="w-full rounded-xl border-[1.5px] border-border bg-background px-3.5 py-3 text-[14px] focus:border-primary focus:outline-none transition-colors resize-vertical min-h-[160px]"
          />
          <SavedIndicator label={savedLabel('internal')} />
        </div>
      )}

      {tab === 'report' && (
        <div className="space-y-2">
          <p className="text-[12px] text-muted-foreground">{t('patientReportDesc')}</p>
          <textarea
            value={patientReport}
            onChange={e => setPatientReport(e.target.value)}
            placeholder={t('patientReportPlaceholder')}
            rows={8}
            className="w-full rounded-xl border-[1.5px] border-border bg-background px-3.5 py-3 text-[14px] focus:border-primary focus:outline-none transition-colors resize-vertical min-h-[160px]"
          />
          <SavedIndicator label={savedLabel('report')} />
        </div>
      )}

      <Button
        type="button"
        onClick={handleFinish}
        disabled={finishing || !patientReport.trim()}
        className="w-full h-[54px] text-[15px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {finishing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {t('finishConsultation')}
      </Button>
    </div>
  )
}

function SavedIndicator({
  label,
}: {
  label: { icon: React.ReactNode; text: string } | null
}) {
  if (!label) return <div className="h-4" aria-hidden="true" />
  return (
    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
      {label.icon}
      {label.text}
    </div>
  )
}
