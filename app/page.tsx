import { redirect } from 'next/navigation'

// Middleware handles / → /es or /en, but as fallback redirect to default locale
export default function RootPage() {
  redirect('/es')
}
