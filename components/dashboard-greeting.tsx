'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

interface DashboardGreetingProps {
  firstName: string
  locale: string
}

export function DashboardGreeting({ firstName, locale }: DashboardGreetingProps) {
  const t = useTranslations('patient')
  const [greeting, setGreeting] = useState('')
  const [today, setToday] = useState('')

  useEffect(() => {
    const h = new Date().getHours()
    const g =
      h >= 6 && h < 12
        ? t('dashboard.greeting')
        : h >= 12 && h < 20
          ? t('dashboard.greetingAfternoon')
          : t('dashboard.greetingEvening')
    setGreeting(g)

    setToday(
      new Date().toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    )
  }, [locale, t])

  return (
    <>
      <p className="text-[13px] text-muted-foreground tracking-wide capitalize">
        {today}
      </p>
      <h1 className="text-[26px] font-bold tracking-[-0.7px] text-foreground leading-tight mt-1">
        {greeting}{greeting ? ', ' : ''}{firstName}
      </h1>
    </>
  )
}
