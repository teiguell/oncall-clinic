'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/shared/navbar'
import type { Profile as ProfileType } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { User, Globe, Shield, Lock, Save, ArrowLeft, Trash2 } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: 'patient' | 'doctor' | 'admin'
}

export default function SettingsPage() {
  const t = useTranslations('settings')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/${locale}/login`); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
      }
      setLoading(false)
    }
    loadProfile()
  }, [supabase, router, locale])

  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone: phone || null })
      .eq('id', profile.id)

    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' })
    } else {
      toast({ title: t('saved'), variant: 'success' })
      setProfile({ ...profile, full_name: fullName, phone })
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: t('error'), description: t('passwordMismatch'), variant: 'destructive' })
      return
    }
    if (newPassword.length < 8) {
      toast({ title: t('error'), description: t('passwordTooShort'), variant: 'destructive' })
      return
    }

    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' })
    } else {
      toast({ title: t('passwordChanged'), variant: 'success' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setChangingPassword(false)
  }

  const handleLanguageChange = (newLocale: 'es' | 'en') => {
    if (newLocale === locale) return
    // Replace current locale segment with new one
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/patient/delete-account', { method: 'POST' })
      if (res.ok) {
        toast({ title: t('saved'), variant: 'success' })
        await supabase.auth.signOut()
        router.push(`/${locale}`)
      } else {
        const data = await res.json()
        toast({ title: t('error'), description: data.error || 'Error', variant: 'destructive' })
      }
    } catch {
      toast({ title: t('error'), variant: 'destructive' })
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile as unknown as ProfileType} />
      <main className="container mx-auto max-w-2xl px-4 py-8 fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        </div>

        {/* Profile section */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              {t('profileSection')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">{t('fullName')}</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('email')}</label>
              <Input value={profile.email} disabled className="mt-1 bg-gray-50" />
              <p className="text-xs text-gray-500 mt-1">{t('emailCannotChange')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('phone')}</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600 000 000"
                className="mt-1"
              />
            </div>
            <Button onClick={handleSaveProfile} loading={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? t('saving') : t('saveChanges')}
            </Button>
          </CardContent>
        </Card>

        {/* Language section */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              {t('languageSection')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                variant={locale === 'es' ? 'default' : 'outline'}
                onClick={() => handleLanguageChange('es')}
                className="flex-1"
              >
                🇪🇸 Español
              </Button>
              <Button
                variant={locale === 'en' ? 'default' : 'outline'}
                onClick={() => handleLanguageChange('en')}
                className="flex-1"
              >
                🇬🇧 English
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password section */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-600" />
              {t('passwordSection')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">{t('newPassword')}</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('confirmPassword')}</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              loading={changingPassword}
              variant="outline"
              className="gap-2"
            >
              <Lock className="h-4 w-4" />
              {t('updatePassword')}
            </Button>
          </CardContent>
        </Card>

        {/* Privacy section */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              {t('privacySection')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/${locale}/patient/privacy`}>
              <Button variant="outline" className="w-full gap-2">
                <Shield className="h-4 w-4" />
                {t('privacyConsent')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Delete account */}
        <Card className="border-0 shadow-sm border-red-100 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
              <Trash2 className="h-5 w-5" />
              {t('deleteAccount')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700 mb-4">{t('deleteAccountWarning')}</p>
            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t('deleteAccount')}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  loading={deleting}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('deleteAccount')}
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
