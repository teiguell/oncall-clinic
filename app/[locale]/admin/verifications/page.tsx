import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminVerificationActions } from '@/components/admin/verification-actions'
import { ArrowLeft, FileText, Star, Calendar, Shield, Globe, Briefcase, ExternalLink, AlertTriangle } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { getTranslations, getLocale } from 'next-intl/server'

export const dynamic = 'force-dynamic'

function getRcExpiryStatus(expiryDate: string | null): { color: string; badgeVariant: 'success' | 'warning' | 'destructive'; key: string } {
  if (!expiryDate) return { color: 'text-gray-400', badgeVariant: 'warning', key: 'rcExpiry' }
  const now = new Date()
  const expiry = new Date(expiryDate)
  const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return { color: 'text-red-600', badgeVariant: 'destructive', key: 'rcExpired' }
  if (daysUntilExpiry <= 7) return { color: 'text-red-600', badgeVariant: 'destructive', key: 'rcExpiringSoon' }
  if (daysUntilExpiry <= 30) return { color: 'text-amber-600', badgeVariant: 'warning', key: 'rcExpiringSoon' }
  return { color: 'text-green-600', badgeVariant: 'success', key: 'rcExpiry' }
}

function formatLanguages(languages: string[] | null): string {
  if (!languages || languages.length === 0) return '-'
  return languages.map(l => l.toUpperCase()).join(', ')
}

export default async function VerificationsPage() {
  const t = await getTranslations('admin')
  const locale = await getLocale()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect(`/${locale}/login`)

  const { data: pendingDoctors } = await supabase
    .from('doctor_profiles')
    .select(`*, profiles(*)`)
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: true })

  const { data: allDoctors } = await supabase
    .from('doctor_profiles')
    .select(`*, profiles(*)`)
    .neq('verification_status', 'pending')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/${locale}/admin/dashboard`}>
            <button className="p-2 rounded-xl hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('verifications.title')}</h1>
            <p className="text-sm text-gray-500">{pendingDoctors?.length || 0} {t('verifications.pendingReview')}</p>
          </div>
        </div>

        {/* Pending */}
        {pendingDoctors && pendingDoctors.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              {t('verifications.pending')} ({pendingDoctors.length})
            </h2>
            <div className="space-y-4">
              {pendingDoctors.map((doctor: {
                id: string
                specialty: string
                city: string
                bio: string | null
                license_number: string
                rating: number
                total_reviews: number
                created_at: string
                comib_license_number: string | null
                rc_insurance_company: string | null
                rc_insurance_policy_number: string | null
                rc_insurance_coverage_amount: number | null
                rc_insurance_expiry_date: string | null
                rc_insurance_document_url: string | null
                reta_registration_number: string | null
                reta_document_url: string | null
                languages: string[] | null
                years_experience: number | null
                profiles?: { full_name?: string; email?: string; phone?: string; avatar_url?: string }
              }) => {
                const rcStatus = getRcExpiryStatus(doctor.rc_insurance_expiry_date)
                return (
                  <Card key={doctor.id} className="border-0 shadow-md border-l-4 border-l-amber-400">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-lg">
                            {doctor.profiles?.full_name?.substring(0, 2).toUpperCase() || 'MD'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-gray-900">{doctor.profiles?.full_name}</h3>
                              <Badge variant="warning">{t('verifications.pending')}</Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">{doctor.specialty} · {doctor.city}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {doctor.profiles?.email}
                              {doctor.profiles?.phone && ` · ${doctor.profiles.phone}`}
                            </p>

                            {/* Languages & Experience */}
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                              {doctor.languages && doctor.languages.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Globe className="h-3.5 w-3.5" />
                                  {t('verifications.languages')}: <strong className="text-gray-700">{formatLanguages(doctor.languages)}</strong>
                                </span>
                              )}
                              {doctor.years_experience != null && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  {t('verifications.experience')}: <strong className="text-gray-700">{doctor.years_experience} a.</strong>
                                </span>
                              )}
                            </div>

                            {/* License & Date */}
                            <div className="mt-2 text-xs flex items-center gap-3 text-gray-500">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5" />
                                {t('verifications.licenseNumber')} <strong className="text-gray-700">{doctor.license_number}</strong>
                              </span>
                              {doctor.comib_license_number && (
                                <span className="flex items-center gap-1">
                                  COMIB: <strong className="text-gray-700">{doctor.comib_license_number}</strong>
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatRelativeDate(doctor.created_at)}
                              </span>
                            </div>

                            {/* RC Insurance Info */}
                            {doctor.rc_insurance_company && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-xl space-y-1.5">
                                <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                  <Shield className="h-3.5 w-3.5" />
                                  RC Insurance
                                </h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                  <span className="text-gray-500">Company:</span>
                                  <span className="font-medium text-gray-700">{doctor.rc_insurance_company}</span>
                                  <span className="text-gray-500">Policy:</span>
                                  <span className="font-medium text-gray-700">{doctor.rc_insurance_policy_number}</span>
                                  <span className="text-gray-500">Coverage:</span>
                                  <span className="font-medium text-gray-700">
                                    {doctor.rc_insurance_coverage_amount
                                      ? `${Number(doctor.rc_insurance_coverage_amount).toLocaleString()} EUR`
                                      : '-'}
                                  </span>
                                  <span className="text-gray-500">{t('verifications.rcExpiry')}:</span>
                                  <span className={`font-medium ${rcStatus.color}`}>
                                    {doctor.rc_insurance_expiry_date || '-'}
                                    {rcStatus.key === 'rcExpired' && (
                                      <Badge variant="destructive" className="ml-1.5 text-[10px] px-1.5 py-0">
                                        <AlertTriangle className="h-3 w-3 mr-0.5" />
                                        {t('verifications.rcExpired')}
                                      </Badge>
                                    )}
                                    {rcStatus.key === 'rcExpiringSoon' && (
                                      <Badge variant="warning" className="ml-1.5 text-[10px] px-1.5 py-0">
                                        {t('verifications.rcExpiringSoon')}
                                      </Badge>
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Documents */}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {doctor.rc_insurance_document_url && (
                                <a
                                  href={doctor.rc_insurance_document_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  RC Doc
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {doctor.reta_document_url && (
                                <a
                                  href={doctor.reta_document_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  RETA Doc
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {doctor.reta_registration_number && (
                                <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg">
                                  RETA: {doctor.reta_registration_number}
                                </span>
                              )}
                            </div>

                            {doctor.bio && (
                              <p className="text-xs text-gray-600 mt-2 line-clamp-2 italic">&ldquo;{doctor.bio}&rdquo;</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <AdminVerificationActions doctorId={doctor.id} doctorName={doctor.profiles?.full_name || ''} doctorEmail={doctor.profiles?.email || ''} />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {(!pendingDoctors || pendingDoctors.length === 0) && (
          <div className="text-center py-12 bg-green-50 rounded-2xl mb-8">
            <div className="text-5xl mb-3">&#10003;</div>
            <p className="font-semibold text-green-700">{t('verifications.noPending')}</p>
            <p className="text-sm text-green-600">{t('verifications.allProcessed')}</p>
          </div>
        )}

        {/* All doctors */}
        {allDoctors && allDoctors.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-800 mb-3">{t('verifications.approvedRejectedDoctors')}</h2>
            <div className="space-y-3">
              {allDoctors.map((doctor: {
                id: string
                specialty: string
                city: string
                verification_status: string
                rating: number
                total_reviews: number
                is_available: boolean
                created_at: string
                rc_insurance_expiry_date: string | null
                languages: string[] | null
                years_experience: number | null
                profiles?: { full_name?: string; email?: string }
              }) => {
                const rcStatus = getRcExpiryStatus(doctor.rc_insurance_expiry_date)
                return (
                  <Card key={doctor.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                            {doctor.profiles?.full_name?.substring(0, 2).toUpperCase() || 'MD'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{doctor.profiles?.full_name}</p>
                            <p className="text-xs text-gray-500">{doctor.specialty} · {doctor.city}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs">{doctor.rating?.toFixed(1)} ({doctor.total_reviews})</span>
                              </div>
                              {doctor.languages && doctor.languages.length > 0 && (
                                <span className="text-xs text-gray-400">
                                  {formatLanguages(doctor.languages)}
                                </span>
                              )}
                              {doctor.years_experience != null && (
                                <span className="text-xs text-gray-400">
                                  {doctor.years_experience}y exp.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doctor.rc_insurance_expiry_date && (
                            <Badge variant={rcStatus.badgeVariant} className="text-[10px]">
                              RC: {doctor.rc_insurance_expiry_date}
                            </Badge>
                          )}
                          {doctor.is_available && <Badge variant="success" className="text-xs">{t('verifications.online')}</Badge>}
                          <Badge variant={
                            doctor.verification_status === 'verified' ? 'success' :
                            doctor.verification_status === 'rejected' ? 'destructive' :
                            'warning'
                          }>
                            {doctor.verification_status === 'verified' ? t('verifications.approved') :
                             doctor.verification_status === 'rejected' ? t('verifications.rejected') :
                             doctor.verification_status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
