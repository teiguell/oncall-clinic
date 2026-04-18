'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { routing } from '@/i18n/routing'

const LOCALE_LABELS: Record<string, string> = {
  es: '🇪🇸 ES',
  en: '🇬🇧 EN',
}

const LOCALE_FULL: Record<string, string> = {
  es: 'Español',
  en: 'English',
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function switchLocale(nextLocale: string) {
    // Replace the locale prefix in the current pathname
    const pathWithoutLocale = pathname.replace(/^\/(es|en)/, '') || '/'
    startTransition(() => {
      router.replace(`/${nextLocale}${pathWithoutLocale}`)
    })
  }

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          disabled={isPending || l === locale}
          aria-label={`Switch to ${LOCALE_FULL[l]}`}
          className={`
            px-2 py-1 rounded-md text-sm font-medium transition-all duration-150
            ${l === locale
              ? 'bg-blue-600 text-white cursor-default'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
            }
            ${isPending ? 'opacity-50' : ''}
          `}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  )
}
