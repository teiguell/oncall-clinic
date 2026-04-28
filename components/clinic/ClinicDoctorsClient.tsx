'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, UserPlus, Trash2, Star } from 'lucide-react'

interface ClinicDoctor {
  id: string
  doctorId: string | null
  fullName: string
  specialty: string
  rating: number | null
  totalReviews: number | null
  avatarUrl: string | null
  status: 'active' | 'inactive' | 'pending'
  addedAt: string
}

/**
 * /clinic/doctors content — Round 15B-5.
 *
 * Lists doctors via GET /api/clinic/doctors. Has an Invite modal that
 * POSTs to /api/clinic/doctors/invite (email). Each row has a remove
 * button that DELETEs /api/clinic/doctors/[id] (status flips to 'inactive').
 */
export function ClinicDoctorsClient() {
  const t = useTranslations('clinicDashboard.doctors')
  const [doctors, setDoctors] = useState<ClinicDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/clinic/doctors')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'load_failed')
        setLoading(false)
        return
      }
      const data = (await res.json()) as ClinicDoctor[]
      setDoctors(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'network_error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const remove = async (id: string) => {
    if (!confirm(t('removeConfirm'))) return
    try {
      const res = await fetch(`/api/clinic/doctors/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? 'remove_failed')
        return
      }
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'network_error')
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
        {error}
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 text-white font-semibold"
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
            fontSize: 13.5,
            letterSpacing: '-0.2px',
            minHeight: 38,
          }}
        >
          <UserPlus className="h-4 w-4" /> {t('invite')}
        </button>
      </div>

      {doctors.length === 0 ? (
        <div
          className="bg-white border border-dashed border-slate-300 text-center"
          style={{ padding: '48px 28px', borderRadius: 14 }}
        >
          <p className="text-slate-500 text-[14.5px]">{t('emptyState')}</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 overflow-hidden" style={{ borderRadius: 14 }}>
          <table className="w-full text-[14px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left font-medium text-slate-600 py-3 px-4">{t('listHeader.name')}</th>
                <th className="text-left font-medium text-slate-600 py-3 px-4 hidden md:table-cell">{t('listHeader.specialty')}</th>
                <th className="text-left font-medium text-slate-600 py-3 px-4 hidden lg:table-cell">{t('listHeader.rating')}</th>
                <th className="text-left font-medium text-slate-600 py-3 px-4">{t('listHeader.status')}</th>
                <th className="text-right font-medium text-slate-600 py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.id} className="border-t border-slate-200">
                  <td className="py-3 px-4 font-medium text-[#0B1220]">{d.fullName}</td>
                  <td className="py-3 px-4 text-slate-600 hidden md:table-cell">
                    {d.specialty?.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-4 text-slate-600 hidden lg:table-cell">
                    {typeof d.rating === 'number' ? (
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {d.rating.toFixed(1)}
                        {typeof d.totalReviews === 'number' && (
                          <span className="text-slate-400">({d.totalReviews})</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={d.status} t={t} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => remove(d.id)}
                      className="text-red-600 hover:bg-red-50 transition-colors p-2 rounded-lg"
                      aria-label={t('remove')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onInvited={() => { setInviteOpen(false); load() }} />}
    </>
  )
}

function StatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  const map: Record<string, { bg: string; text: string }> = {
    active: { bg: '#DCFCE7', text: '#14532D' },
    inactive: { bg: '#F1F5F9', text: '#475569' },
    pending: { bg: '#FEF3C7', text: '#78350F' },
  }
  const s = map[status] ?? map.inactive
  return (
    <span
      className="inline-block font-medium"
      style={{
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 11.5,
        background: s.bg,
        color: s.text,
      }}
    >
      {t(`status.${status}`)}
    </span>
  )
}

function InviteModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const t = useTranslations('clinicDashboard.doctors.inviteModal')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Round 18-C: invite returns either { path: 'registered' } (existing
  // doctor) or { path: 'invited_anonymous', inviteUrl } (unregistered).
  // For the latter, we display the URL so the clinic owner can paste
  // it manually until production email lands.
  const [inviteResult, setInviteResult] = useState<{
    path: 'registered' | 'invited_anonymous' | 'invite_resent'
    inviteUrl?: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const submit = async () => {
    if (!email.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/clinic/doctors/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.hint ?? data?.error ?? 'invite_failed')
        setSubmitting(false)
        return
      }
      // If the response includes an inviteUrl (anonymous path), keep
      // the modal open so the user can copy it. Otherwise close.
      if (data.inviteUrl) {
        setInviteResult({ path: data.path, inviteUrl: data.inviteUrl })
        setSubmitting(false)
      } else {
        onInvited()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'network_error')
      setSubmitting(false)
    }
  }

  const copyUrl = async () => {
    if (!inviteResult?.inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteResult.inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        {!inviteResult ? (
          <>
            <h3 className="text-lg font-bold text-[#0B1220] mb-3">{t('title')}</h3>
            <p className="text-slate-600 text-[13.5px] mb-4">{t('subtitle')}</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="medico@email.com"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-[14.5px] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre (opcional)"
              className="w-full mt-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-[14.5px] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
            {error && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-[13px]">
                {error}
              </div>
            )}
            <div className="flex gap-3 mt-5 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
                style={{ padding: '10px 16px', borderRadius: 10, fontSize: 13.5, minHeight: 38 }}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!email.trim() || submitting}
                className="text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
                  fontSize: 13.5,
                  letterSpacing: '-0.2px',
                  minHeight: 38,
                }}
              >
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('submit')}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold text-[#0B1220] mb-2">
              ✉️ Enlace de invitación generado
            </h3>
            <p className="text-slate-600 text-[13.5px] mb-3">
              El médico aún no está registrado en OnCall. Comparte este enlace
              (válido 14 días) — al abrirlo se completará el onboarding y
              quedará vinculado a tu clínica automáticamente.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[12px] font-mono break-all text-slate-700">
              {inviteResult.inviteUrl}
            </div>
            <div className="flex gap-3 mt-4 justify-end">
              <button
                type="button"
                onClick={() => { setInviteResult(null); onInvited() }}
                className="text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
                style={{ padding: '10px 16px', borderRadius: 10, fontSize: 13.5, minHeight: 38 }}
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={copyUrl}
                className="text-white font-semibold inline-flex items-center justify-center"
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: copied
                    ? 'linear-gradient(135deg, #16A34A, #15803D)'
                    : 'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
                  fontSize: 13.5,
                  letterSpacing: '-0.2px',
                  minHeight: 38,
                }}
              >
                {copied ? '✓ Copiado' : 'Copiar enlace'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
