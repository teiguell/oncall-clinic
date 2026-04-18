import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getStatusLabel, getStatusColor, formatDate, getService, formatCurrencyFromEuros } from '@/lib/utils'
import { ArrowLeft, Star, RotateCcw, MessageCircle } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import type { Consultation } from '@/types'

export const dynamic = 'force-dynamic'

export default async function PatientHistory() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()

  if (!user) redirect(`/${locale}/login`)

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect(`/${locale}/login`)

  const t = await getTranslations('patient')

  const { data: consultations } = await supabase
    .from('consultations')
    .select(`*, doctor_profiles(*, profiles(*))`)
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false })

  const total = consultations?.length || 0
  const completed = consultations?.filter(c => c.status === 'completed').length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/${locale}/patient/dashboard`}>
            <button className="p-2 rounded-xl hover:bg-gray-100"><ArrowLeft className="h-5 w-5" /></button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('history.title')}</h1>
            <p className="text-sm text-gray-500">{total} {t('history.consultations')} · {completed} {t('history.completed')}</p>
          </div>
        </div>

        {!consultations?.length ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-700">{t('history.empty')}</h2>
            <p className="text-gray-500 mt-2">{t('history.emptyDesc')}</p>
            <Link href={`/${locale}/patient/request`} className="mt-6 inline-block">
              <Button size="lg">{t('dashboard.bookNow')}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((c: Consultation & { doctor_profiles?: { specialty?: string; profiles?: { full_name?: string } } }) => {
              const service = getService(c.service_type)
              const isChatAvailable = c.status === 'completed' && c.completed_at &&
                new Date(c.completed_at).getTime() > Date.now() - 48 * 60 * 60 * 1000
              return (
                <Card key={c.id} className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl flex-shrink-0">{service?.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm">{service?.label}</h3>
                            <Badge className={getStatusColor(c.status)}>
                              {/* TODO: use t('status.${status}') */}
                              {getStatusLabel(c.status)}
                            </Badge>
                            {c.type === 'urgent' && <Badge variant="destructive" className="text-xs">{t('history.urgent')}</Badge>}
                          </div>
                          {c.doctor_profiles?.profiles?.full_name && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Dr/a. {c.doctor_profiles.profiles.full_name} · {c.doctor_profiles.specialty}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-0.5">{formatDate(c.created_at)}</p>
                          {c.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: c.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 space-y-1">
                        {c.price && (
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrencyFromEuros(c.price / 100)}
                          </p>
                        )}
                        {isChatAvailable && (
                          <Link href={`/${locale}/consultation/${c.id}/chat`} className="inline-flex">
                            <button className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                              <MessageCircle className="h-3 w-3" />
                              {t('history.chat')}
                            </button>
                          </Link>
                        )}
                        {c.status === 'completed' && (
                          <Link href={`/${locale}/patient/request?service=${c.service_type}`} className="inline-flex">
                            <button className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                              <RotateCcw className="h-3 w-3" />
                              {t('history.bookAgain')}
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
