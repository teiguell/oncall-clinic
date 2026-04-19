"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Stethoscope, Mail, Lock, ArrowLeft } from 'lucide-react'

type FormData = {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const t = useTranslations('auth')
  const locale = useLocale()

  const schema = z.object({
    email: z.string().email(t('errors.invalidEmail')),
    password: z.string().min(6, t('errors.minPassword')),
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast({
        title: t('login.errorTitle'),
        description: error.message === 'Invalid login credentials'
          ? t('login.invalidCredentials')
          : error.message,
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    // Get user profile to redirect to correct dashboard
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'doctor') {
        router.push(`/${locale}/doctor/dashboard`)
      } else if (profile?.role === 'admin') {
        router.push(`/${locale}/admin/dashboard`)
      } else {
        router.push(`/${locale}/patient/dashboard`)
      }
    }
  }

  const signInWithGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <Stethoscope className="h-7 w-7 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">OnCall Clinic</h1>
          <p className="text-gray-500 mt-1">{t('login.subtitle')}</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
            <CardDescription>{t('login.description')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Google Sign In */}
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 border-2 rounded-xl p-3 text-sm font-medium hover:bg-gray-50 transition-colors mb-6"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('login.googleLogin')}
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t('login.orContinueWith')}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                id="email"
                label={t('login.email')}
                type="email"
                placeholder="tu@email.com"
                icon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                required
                aria-required="true"
                autoComplete="email"
                {...register('email')}
              />
              <Input
                id="password"
                label={t('login.password')}
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                required
                aria-required="true"
                autoComplete="current-password"
                {...register('password')}
              />

              <div className="flex justify-end">
                <Link href={`/${locale}/forgot-password`} className="text-sm text-blue-600 hover:underline">
                  {t('login.forgotPassword')}
                </Link>
              </div>

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                {t('login.submit')}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              {t('login.noAccount')}{' '}
              <Link href={`/${locale}/register`} className="text-blue-600 font-semibold hover:underline">
                {t('login.signUp')}
              </Link>
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href={`/${locale}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            {t('common.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
