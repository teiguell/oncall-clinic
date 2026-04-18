"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Send, CheckCheck, Check, AlertTriangle } from 'lucide-react'
import type { Profile } from '@/types'

interface ChatMessage {
  id: string
  consultation_id: string
  sender_id: string
  sender_role: 'patient' | 'doctor'
  content: string
  read_at: string | null
  created_at: string
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'ahora'
  if (diffMin < 60) return `${diffMin}m`
  if (diffHour < 24) return `${diffHour}h`
  return `${diffDay}d`
}

function formatExpiryDate(dateStr: string): string {
  const date = new Date(dateStr)
  const expiry = new Date(date.getTime() + 48 * 60 * 60 * 1000)
  return expiry.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getHoursRemaining(completedAt: string): number {
  const completed = new Date(completedAt).getTime()
  const expiresAt = completed + 48 * 60 * 60 * 1000
  const remaining = expiresAt - Date.now()
  return remaining / (1000 * 60 * 60)
}

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const consultationId = params.id as string
  const locale = useLocale()
  const t = useTranslations('chat')

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [senderRole, setSenderRole] = useState<'patient' | 'doctor' | null>(null)
  const [otherParticipant, setOtherParticipant] = useState<Profile | null>(null)
  const [completedAt, setCompletedAt] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [hoursRemaining, setHoursRemaining] = useState<number>(48)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Mark messages from the other participant as read
  const markMessagesAsRead = useCallback(async (msgs: ChatMessage[], userId: string) => {
    const supabase = createClient()
    const unreadFromOther = msgs.filter(
      (m) => m.sender_id !== userId && !m.read_at
    )
    if (unreadFromOther.length === 0) return

    const ids = unreadFromOther.map((m) => m.id)
    await supabase
      .from('consultation_messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', ids)
  }, [])

  // Load consultation data and messages
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/${locale}/login`); return }

      if (isMounted) setCurrentUserId(user.id)

      // Fetch consultation with doctor and patient profiles
      const { data: consultation } = await supabase
        .from('consultations')
        .select(`
          id, patient_id, doctor_id, status, completed_at,
          doctor_profiles(id, user_id, profiles(*))
        `)
        .eq('id', consultationId)
        .single()

      if (!consultation || !isMounted) {
        if (isMounted) router.push(`/${locale}/patient/dashboard`)
        return
      }

      // Also fetch the patient profile
      const { data: patientProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', consultation.patient_id)
        .single()

      const doctorProfiles = consultation.doctor_profiles as unknown as {
        id: string
        user_id: string
        profiles: Profile
      }

      // Determine current user's role and the other participant
      const isPatient = user.id === consultation.patient_id
      const isDoctor = doctorProfiles && user.id === doctorProfiles.user_id

      if (!isPatient && !isDoctor) {
        router.push(`/${locale}/patient/dashboard`)
        return
      }

      if (isMounted) {
        setSenderRole(isPatient ? 'patient' : 'doctor')

        if (isPatient && doctorProfiles?.profiles) {
          setOtherParticipant(doctorProfiles.profiles)
        } else if (isDoctor && patientProfile) {
          setOtherParticipant(patientProfile)
        }

        const completedTime = consultation.completed_at
        setCompletedAt(completedTime)

        if (completedTime) {
          const hrs = getHoursRemaining(completedTime)
          setHoursRemaining(hrs)
          setIsExpired(hrs <= 0)
        }
      }

      // Load existing messages
      const { data: existingMessages } = await supabase
        .from('consultation_messages')
        .select('*')
        .eq('consultation_id', consultationId)
        .order('created_at', { ascending: true })

      if (isMounted && existingMessages) {
        setMessages(existingMessages)
        setLoading(false)

        // Mark messages as read
        await markMessagesAsRead(existingMessages, user.id)
      }
    }

    loadData()
    return () => { isMounted = false }
  }, [consultationId, locale, router, markMessagesAsRead])

  // Subscribe to realtime updates
  useEffect(() => {
    if (!currentUserId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`chat-${consultationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'consultation_messages',
          filter: `consultation_id=eq.${consultationId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage
          setMessages((prev) => {
            // Avoid duplicate
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })

          // If message is from the other person, mark as read
          if (newMsg.sender_id !== currentUserId) {
            supabase
              .from('consultation_messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMsg.id)
              .then()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'consultation_messages',
          filter: `consultation_id=eq.${consultationId}`,
        },
        (payload) => {
          const updated = payload.new as ChatMessage
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [consultationId, currentUserId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Update expiry timer every minute
  useEffect(() => {
    if (!completedAt) return

    const interval = setInterval(() => {
      const hrs = getHoursRemaining(completedAt)
      setHoursRemaining(hrs)
      setIsExpired(hrs <= 0)
    }, 60000)

    return () => clearInterval(interval)
  }, [completedAt])

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUserId || !senderRole || isExpired || sending) return

    const content = newMessage.trim()
    setNewMessage('')
    setSending(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('consultation_messages')
      .insert({
        consultation_id: consultationId,
        sender_id: currentUserId,
        sender_role: senderRole,
        content,
      })

    if (error) {
      // Restore message on error
      setNewMessage(content)
    }

    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">{t('loadingMessages')}</p>
        </div>
      </div>
    )
  }

  const showWarning = !isExpired && hoursRemaining <= 6

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>

          {otherParticipant && (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherParticipant.avatar_url || ''} />
                <AvatarFallback className="text-xs gradient-primary text-white">
                  {otherParticipant.full_name?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate text-sm">
                  {senderRole === 'patient' ? 'Dr/a. ' : ''}{otherParticipant.full_name}
                </p>
                {completedAt && (
                  isExpired ? (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      {t('expired')}
                    </Badge>
                  ) : (
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                      {t('availableUntil')} {formatExpiryDate(completedAt)}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Warning banner when <6h remaining */}
      {showWarning && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          <p className="text-xs text-yellow-700">
            {t('warningExpiring', { hours: Math.ceil(hoursRemaining) })}
          </p>
        </div>
      )}

      {/* Expired banner */}
      {isExpired && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-xs text-red-700">{t('expiredMessage')}</p>
        </div>
      )}

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm">{t('noMessages')}</p>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  isMine
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white text-gray-900 rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[10px] ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                    {formatRelativeTime(msg.created_at)}
                  </span>
                  {isMine && (
                    msg.read_at ? (
                      <CheckCheck className="h-3 w-3 text-blue-200" />
                    ) : (
                      <Check className="h-3 w-3 text-blue-300" />
                    )
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-3">
        {isExpired ? (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">{t('expiredMessage')}</p>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder')}
              rows={1}
              className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
              style={{ maxHeight: '120px' }}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              size="icon"
              className="h-10 w-10 rounded-full flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
