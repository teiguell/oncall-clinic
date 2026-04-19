'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Mail, X } from 'lucide-react'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

/**
 * AuthModal — used in the deferred registration flow.
 * Pops up at step 4 (payment) if the user isn't signed in.
 * Offers Google OAuth + email magic link.
 */
export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const t = useTranslations('authModal')
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState<'google' | 'email' | null>(null)
  const [linkSent, setLinkSent] = useState(false)

  if (!open) return null

  const supabase = createClient()

  const handleGoogle = async () => {
    setLoading('google')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' })
    setLoading(null)
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading('email')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    })
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      setLinkSent(true)
      onSuccess?.()
    }
    setLoading(null)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-card rounded-t-card sm:rounded-card shadow-elevated border border-border/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/60">
          <div>
            <h2 className="font-display font-semibold text-lg">{t('title')}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t('subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {linkSent ? (
            <div className="rounded-card border border-emerald-200 bg-emerald-50 p-4 text-center">
              <Mail className="h-8 w-8 text-emerald-600 mx-auto mb-2" aria-hidden="true" />
              <p className="font-display font-semibold mb-1">{t('linkSent')}</p>
              <p className="text-sm text-muted-foreground">{t('linkSentDesc', { email })}</p>
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                size="lg"
                loading={loading === 'google'}
                onClick={handleGoogle}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09a6.61 6.61 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.86z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
                </svg>
                {t('google')}
              </Button>

              <div className="relative flex items-center">
                <div className="flex-1 border-t border-border" />
                <span className="px-3 text-xs text-muted-foreground uppercase tracking-wider">{t('or')}</span>
                <div className="flex-1 border-t border-border" />
              </div>

              <form onSubmit={handleMagicLink} className="space-y-3">
                <Input
                  type="email"
                  label={t('emailLabel')}
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="h-4 w-4" aria-hidden="true" />}
                  required
                  aria-required="true"
                />
                <Button type="submit" className="w-full" size="lg" loading={loading === 'email'}>
                  {t('sendLink')}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
