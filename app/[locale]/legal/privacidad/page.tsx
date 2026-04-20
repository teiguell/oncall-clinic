import { redirect } from 'next/navigation'

export default async function PrivacidadRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/legal/privacy`)
}
