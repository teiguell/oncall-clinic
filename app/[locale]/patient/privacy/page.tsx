"use client"

import { useState, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { Lock, Download, Trash2, Mail, Shield, MapPin, BarChart3, Megaphone, UserCog } from 'lucide-react'

type ConsentType =
  | 'health_data_processing'
  | 'geolocation_tracking'
  | 'analytics'
  | 'marketing_communications'
  | 'profiling'

interface ConsentConfig {
  type: ConsentType
  labelKey: string
  descKey: string
  required: boolean
  icon: React.ReactNode
}

const CONSENT_CONFIGS: ConsentConfig[] = [
  {
    type: 'health_data_processing',
    labelKey: 'healthData',
    descKey: 'healthDataDesc',
    required: true,
    icon: <Shield className="h-5 w-5 text-blue-600" />,
  },
  {
    type: 'geolocation_tracking',
    labelKey: 'geolocation',
    descKey: 'geolocationDesc',
    required: true,
    icon: <MapPin className="h-5 w-5 text-blue-600" />,
  },
  {
    type: 'analytics',
    labelKey: 'analytics',
    descKey: 'analyticsDesc',
    required: false,
    icon: <BarChart3 className="h-5 w-5 text-gray-600" />,
  },
  {
    type: 'marketing_communications',
    labelKey: 'marketing',
    descKey: 'marketingDesc',
    required: false,
    icon: <Megaphone className="h-5 w-5 text-gray-600" />,
  },
  {
    type: 'profiling',
    labelKey: 'profiling',
    descKey: 'profilingDesc',
    required: false,
    icon: <UserCog className="h-5 w-5 text-gray-600" />,
  },
]

export default function PrivacyPage() {
  const t = useTranslations('privacy')
  const locale = useLocale()
  const { toast } = useToast()
  const supabase = createClient()

  const [consentState, setConsentState] = useState<Record<ConsentType, boolean>>({
    health_data_processing: true,
    geolocation_tracking: true,
    analytics: false,
    marketing_communications: false,
    profiling: false,
  })
  const [loading, setLoading] = useState(true)
  const [savingType, setSavingType] = useState<ConsentType | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const loadConsents = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get the latest consent record per type
    const { data: records } = await supabase
      .from('consent_log')
      .select('*')
      .eq('user_id', user.id)
      .order('granted_at', { ascending: false })

    if (records && records.length > 0) {
      const latestByType: Record<string, boolean> = {}
      for (const record of records) {
        if (!(record.consent_type in latestByType)) {
          latestByType[record.consent_type] = record.granted
        }
      }
      setConsentState(prev => ({
        ...prev,
        ...latestByType as Record<ConsentType, boolean>,
      }))
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadConsents()
  }, [loadConsents])

  const handleToggleConsent = async (type: ConsentType) => {
    const newValue = !consentState[type]
    setSavingType(type)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null

    // Insert a new audit record via API (captures real IP server-side)
    const response = await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        consent_type: type,
        granted: newValue,
        user_agent: userAgent,
        revoked_at: newValue ? null : new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: 'Unknown error' }))
      toast({
        title: 'Error',
        description: data.error || 'Failed to update consent',
        variant: 'destructive',
      })
    } else {
      setConsentState(prev => ({ ...prev, [type]: newValue }))
      toast({
        title: t('saved'),
        description: t('consentUpdated'),
        variant: 'success',
      })
    }

    setSavingType(null)
  }

  const handleExportData = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/patient/data-export')
      if (!response.ok) throw new Error('Export failed')

      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `oncall-clinic-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: t('downloadData'),
        description: t('downloadDataDesc'),
        variant: 'success',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive',
      })
    }
    setExporting(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmStep === 0) {
      setDeleteConfirmStep(1)
      return
    }

    setDeleting(true)
    try {
      const response = await fetch('/api/patient/delete-account', { method: 'POST' })
      if (!response.ok) throw new Error('Delete failed')

      toast({
        title: t('deleteAccount'),
        description: t('deleteAccountConfirm'),
        variant: 'success',
      })

      // Sign out and redirect
      await supabase.auth.signOut()
      window.location.href = `/${locale}`
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to request account deletion',
        variant: 'destructive',
      })
    }
    setDeleting(false)
    setShowDeleteDialog(false)
    setDeleteConfirmStep(0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-500 mt-2">{t('subtitle')}</p>
      </div>

      {/* Consent toggles */}
      <div className="space-y-4 mb-8">
        {CONSENT_CONFIGS.map(config => (
          <Card key={config.type} className="shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-start gap-4 flex-1 mr-4">
                <div className="mt-0.5">{config.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {t(config.labelKey)}
                    </h3>
                    {config.required ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        <Lock className="h-3 w-3" />
                        {t('required')}
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {t('optional')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {t(config.descKey)}
                  </p>
                </div>
              </div>
              <Switch
                checked={consentState[config.type]}
                onCheckedChange={() => handleToggleConsent(config.type)}
                disabled={config.required || savingType === config.type}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data rights section */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t('dataRights')}
        </h2>

        {/* Download data */}
        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-start gap-4 flex-1 mr-4">
              <Download className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{t('downloadData')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('downloadDataDesc')}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              loading={exporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('downloadData')}
            </Button>
          </CardContent>
        </Card>

        {/* Delete account */}
        <Card className="shadow-sm border-red-100">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-start gap-4 flex-1 mr-4">
              <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{t('deleteAccount')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('deleteAccountDesc')}</p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('deleteAccount')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* DPO Contact */}
      <Card className="shadow-sm bg-blue-50/50 border-blue-100">
        <CardContent className="flex items-start gap-4 p-5">
          <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{t('dpoContact')}</h3>
            <a
              href="mailto:teiguell.med@gmail.com"
              className="text-sm text-blue-600 hover:underline mt-1 block"
            >
              {t('dpoEmail')}
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => {
        setShowDeleteDialog(open)
        if (!open) setDeleteConfirmStep(0)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              {t('deleteAccount')}
            </DialogTitle>
            <DialogDescription>
              {deleteConfirmStep === 0
                ? t('deleteAccountWarning')
                : t('deleteAccountConfirm')
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setDeleteConfirmStep(0)
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              loading={deleting}
            >
              {deleteConfirmStep === 0
                ? t('confirmDelete')
                : t('confirmPermanentDelete')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
