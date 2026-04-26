'use client'

import { useEffect, useRef, useState, useOptimistic, startTransition } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { PhoneCall, Send, AlertTriangle, Loader2 } from 'lucide-react'

/**
 * ChatLogistico — logistics-only chat between patient and doctor during a
 * consultation. NOT a clinical record. Messages auto-purge after 24h.
 *
 * Safety features:
 *   - Red banner at the top: "logistics only, call 112 for symptoms"
 *   - Floating red "🚨 112" button (tel:112)
 *   - Client-side keyword scanner: flags clinical words and shows a warning
 *     modal before sending (user can still send if they insist)
 *   - Visual hint: messages >12h fade to indicate imminent deletion
 */

type Role = 'patient' | 'doctor'

type Message = {
  id: string
  consultation_id: string
  sender_id: string
  sender_role: Role
  content: string
  created_at: string
  read_at: string | null
}

// Keywords that likely indicate clinical/urgent content. Bilingual ES+EN.
const CLINICAL_KEYWORDS = [
  // ES
  'dolor', 'sangre', 'sangrado', 'sangra', 'ahogo', 'ahoga', 'urgente', 'urgencia',
  'infarto', 'convulsi', 'desmay', 'mareo', 'fiebre alta', 'vómito', 'vomito',
  // EN
  'pain', 'bleeding', 'choking', 'emergency', 'heart attack', 'seizure',
  'faint', 'dizzy', 'high fever', 'vomit',
]

function containsClinical(text: string): boolean {
  const lower = text.toLowerCase()
  return CLINICAL_KEYWORDS.some(k => lower.includes(k))
}

export function ChatLogistico({
  consultationId,
  currentUserId,
  currentUserRole,
}: {
  consultationId: string
  currentUserId: string
  currentUserRole: Role
}) {
  const t = useTranslations('chatLogistics')
  const { toast } = useToast()
  const supabase = createClient()

  const [messages, setMessages] = useState<Message[]>([])
  // Round 7 M11 — useOptimistic appends a pending message immediately on
  // submit; the underlying `messages` state is updated by the realtime
  // INSERT listener which will replace the temp once Supabase echoes it
  // back. The optimistic entry has a `tmp-` id we use to render a faded
  // "sending" bubble. If insert fails, we surface a toast and the
  // optimistic state is auto-reset when startTransition completes.
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state: Message[], newMsg: Message) => [...state, newMsg],
  )
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [warning, setWarning] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initial load (last 24h, enforced by RLS policy)
  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from('consultation_messages')
        .select('id, consultation_id, sender_id, sender_role, content, created_at, read_at')
        .eq('consultation_id', consultationId)
        .order('created_at', { ascending: true })
      if (data) setMessages(data as Message[])
    })()
  }, [consultationId, supabase])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`consultation:${consultationId}:chat`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'consultation_messages',
          filter: `consultation_id=eq.${consultationId}`,
        },
        payload => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [consultationId, supabase])

  // Auto-scroll to latest
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const reallySend = async () => {
    if (!draft.trim()) return
    const content = draft.trim()
    setDraft('')
    // Round 7 M11: optimistic append BEFORE the await so the bubble
    // appears instantly. tmp-id is replaced by the realtime listener
    // when Supabase echoes the row back.
    const tempMsg: Message = {
      id: `tmp-${Date.now()}`,
      consultation_id: consultationId,
      sender_id: currentUserId,
      sender_role: currentUserRole,
      content,
      created_at: new Date().toISOString(),
      read_at: null,
    }
    setSending(true)
    startTransition(async () => {
      addOptimisticMessage(tempMsg)
      const { error } = await supabase.from('consultation_messages').insert({
        consultation_id: consultationId,
        sender_id: currentUserId,
        sender_role: currentUserRole,
        content,
      })
      setSending(false)
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' })
        setDraft(content) // restore so user doesn't lose what they typed
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    if (containsClinical(draft)) {
      setWarning(true)
      return
    }
    void reallySend()
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Red banner — logistics only */}
      <div
        role="note"
        className="flex items-start gap-2 bg-red-50 border-b border-red-200 px-3 py-2.5 text-[12.5px] text-red-900"
      >
        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <span>{t('only_logistics')}</span>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-2"
        aria-live="polite"
      >
        {optimisticMessages.length === 0 && (
          <div className="text-center text-[13px] text-muted-foreground py-8">
            {t('empty_state')}
          </div>
        )}
        {optimisticMessages.map(m => {
          const mine = m.sender_id === currentUserId
          const ageHours = (Date.now() - new Date(m.created_at).getTime()) / 3600_000
          const fading = ageHours > 12
          // Round 7 M11: tmp-id signals an optimistic (sending) bubble.
          const isPending = m.id.startsWith('tmp-')
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] px-3 py-2 text-[14px] leading-snug ${
                  mine ? 'msg-patient' : 'msg-doctor'
                } ${fading ? 'opacity-60' : ''} ${isPending ? 'opacity-70' : ''}`}
                title={fading ? t('retention_hint') : undefined}
                aria-busy={isPending || undefined}
              >
                {m.content}
                <div className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {fading && ` · ${t('retention_hint')}`}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="border-t border-border px-3 py-2 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={t('placeholder')}
          className="flex-1 h-11 rounded-xl border-[1.5px] border-border bg-background px-3.5 text-[14px] focus:border-primary focus:outline-none transition-colors"
          maxLength={500}
        />
        <Button
          type="submit"
          disabled={sending || !draft.trim()}
          className="h-11 px-4"
          aria-label={t('send')}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>

      {/* Floating 112 emergency button — bottom-right, always visible */}
      <a
        href="tel:112"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-full bg-red-600 text-white shadow-lg shadow-red-600/40 font-semibold text-[13px] hover:bg-red-700 active:scale-95 transition-all"
        aria-label={t('call_112')}
      >
        <PhoneCall className="h-4 w-4" aria-hidden="true" />
        112
      </a>

      {/* Clinical keyword warning modal */}
      {warning && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clinical-warning-title"
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-4"
          onClick={() => setWarning(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" aria-hidden="true" />
              <div>
                <h3
                  id="clinical-warning-title"
                  className="text-[17px] font-bold tracking-[-0.2px] text-foreground"
                >
                  {t('clinical_warning_title')}
                </h3>
                <p className="text-[13px] text-muted-foreground mt-1">
                  {t('clinical_warning_desc')}
                </p>
              </div>
            </div>
            <a
              href="tel:112"
              className="inline-flex items-center justify-center gap-2 w-full min-h-[44px] rounded-xl bg-red-600 text-white font-semibold text-[14px] hover:bg-red-700 transition-colors"
            >
              <PhoneCall className="h-4 w-4" aria-hidden="true" />
              {t('call_112')}
            </a>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11"
                onClick={() => setWarning(false)}
              >
                {t('clinical_warning_continue')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 text-muted-foreground"
                onClick={() => {
                  setWarning(false)
                  void reallySend()
                }}
              >
                {t('clinical_warning_send_anyway')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
