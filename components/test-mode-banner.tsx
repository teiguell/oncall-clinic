"use client"

import { useTranslations } from 'next-intl'

export function TestModeBanner() {
  const t = useTranslations('banner')
  if (process.env.NEXT_PUBLIC_TEST_MODE !== 'true') return null
  return (
    <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium sticky top-0 z-[60]">
      <span className="mr-2">⚠️</span>
      {t('testMode')}
    </div>
  )
}
