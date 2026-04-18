import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export default async function NotFound() {
  const locale = await getLocale()
  const t = await getTranslations('errors')

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <Search className="h-10 w-10 text-blue-600" />
        </div>
        <p className="text-9xl font-bold text-gray-200 leading-none mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('notFound.title')}</h1>
        <p className="text-gray-600 mb-6">{t('notFound.description')}</p>
        <Link href={`/${locale}`}>
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            {t('notFound.backHome')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
