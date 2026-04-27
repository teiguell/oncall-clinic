'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'

interface Consultation {
  id: string
  createdAt: string
  status: string
  doctorId: string | null
  doctorName: string
  patientInitials: string
  zone: string | null
  priceCents: number
  commissionCents: number
  netClinicCents: number
}

export function ClinicConsultationsClient() {
  const t = useTranslations('clinicDashboard.consultations')
  const [rows, setRows] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [status, setStatus] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      if (status) params.set('status', status)
      const res = await fetch(`/api/clinic/consultations?${params.toString()}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'load_failed')
        setLoading(false)
        return
      }
      setRows((await res.json()) as Consultation[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'network_error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fmt = (cents: number) => `€${(cents / 100).toFixed(0)}`
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString()

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className="block text-[12px] text-slate-500 mb-1">{t('filters.from')}</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]"
          />
        </div>
        <div>
          <label className="block text-[12px] text-slate-500 mb-1">{t('filters.to')}</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]"
          />
        </div>
        <div>
          <label className="block text-[12px] text-slate-500 mb-1">{t('filters.status')}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]"
          >
            <option value="">{t('filters.allStatuses')}</option>
            <option value="completed">{t('filters.completed')}</option>
            <option value="pending">{t('filters.pending')}</option>
            <option value="cancelled">{t('filters.cancelled')}</option>
          </select>
        </div>
        <button
          type="button"
          onClick={load}
          className="text-white font-medium"
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
            fontSize: 13,
            minHeight: 36,
          }}
        >
          {t('filters.apply')}
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">{error}</div>
      ) : rows.length === 0 ? (
        <div
          className="bg-white border border-dashed border-slate-300 text-center"
          style={{ padding: '48px 28px', borderRadius: 14 }}
        >
          <p className="text-slate-500 text-[14.5px]">{t('emptyState')}</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 overflow-x-auto" style={{ borderRadius: 14 }}>
          <table className="w-full text-[13.5px] min-w-[700px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left font-medium text-slate-600 py-3 px-4">{t('columns.date')}</th>
                <th className="text-left font-medium text-slate-600 py-3 px-4">{t('columns.patient')}</th>
                <th className="text-left font-medium text-slate-600 py-3 px-4">{t('columns.doctor')}</th>
                <th className="text-left font-medium text-slate-600 py-3 px-4">{t('columns.zone')}</th>
                <th className="text-right font-medium text-slate-600 py-3 px-4">{t('columns.gross')}</th>
                <th className="text-right font-medium text-slate-600 py-3 px-4">{t('columns.commission')}</th>
                <th className="text-right font-medium text-slate-600 py-3 px-4">{t('columns.net')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-200">
                  <td className="py-3 px-4 text-slate-700">{fmtDate(r.createdAt)}</td>
                  <td className="py-3 px-4 text-slate-700 font-mono">{r.patientInitials}</td>
                  <td className="py-3 px-4 text-slate-700">{r.doctorName}</td>
                  <td className="py-3 px-4 text-slate-600">{r.zone ?? '—'}</td>
                  <td className="py-3 px-4 text-right text-slate-700">{fmt(r.priceCents)}</td>
                  <td className="py-3 px-4 text-right text-slate-500">−{fmt(r.commissionCents)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-[#0B1220]">{fmt(r.netClinicCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
