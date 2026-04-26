"use client"

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, Share2 } from 'lucide-react'

interface ReferralCardProps {
  referralCode: string
}

export function ReferralCard({ referralCode }: ReferralCardProps) {
  const [copied, setCopied] = useState(false)
  // Round 6 (2026-04-25) — `'share' in navigator` is a CSR-only signal.
  // Reading it in JSX produced different SSR (false → no button) vs CSR
  // (true → button) markup → hydration mismatch (#418 risk on
  // /es/patient/dashboard). Mounted-gate keeps SSR / first-CSR identical
  // (both render no button), then the post-mount effect flips the flag
  // and the button appears.
  const [canShareNative, setCanShareNative] = useState(false)
  useEffect(() => {
    setCanShareNative(typeof navigator !== 'undefined' && 'share' in navigator)
  }, [])
  const t = useTranslations('referral')
  const locale = useLocale()

  const shareMessage = `${t('shareMessage')} ${referralCode}`
  const shareUrl = `https://oncall.clinic/${locale}/register?ref=${referralCode}`

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${shareMessage}\n${shareUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareOther = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'OnCall Clinic',
          text: shareMessage,
          url: shareUrl,
        })
      } catch {
        // User cancelled or not supported
      }
    }
  }

  return (
    <Card className="border-0 shadow-md mt-6">
      <CardHeader>
        <CardTitle className="text-base">{t('title')}</CardTitle>
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Referral code display */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-center font-mono font-bold text-lg tracking-wider text-blue-600">
            {referralCode}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={copyCode}
            className="h-12 w-12 rounded-xl flex-shrink-0"
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
        </div>
        {copied && (
          <p className="text-xs text-green-600 text-center font-medium">{t('copied')}</p>
        )}

        {/* Share buttons */}
        <div className="flex gap-3">
          <Button
            onClick={shareWhatsApp}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          >
            {t('shareWhatsApp')}
          </Button>
          {canShareNative && (
            <Button
              variant="outline"
              onClick={shareOther}
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {t('shareOther')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
