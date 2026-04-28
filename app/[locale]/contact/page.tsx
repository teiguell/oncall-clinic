import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { Mail, Shield, Phone, MapPin, MessageCircle } from 'lucide-react'
import { ONCALL_PHONE_DISPLAY, ONCALL_PHONE_TEL, ONCALL_WA } from '@/lib/format/phone'

// Round 22-5 (Q4-11): plain title — layout template appends "| OnCall Clinic".
export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Contacta con OnCall Clinic: email general, DPO, teléfono, dirección y WhatsApp.',
}

export default async function ContactPage() {
  const t = await getTranslations('contact')

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground mb-8">{t('subtitle')}</p>

        <div className="grid gap-4">
          <ContactRow
            icon={<Mail className="h-5 w-5 text-primary" aria-hidden="true" />}
            label={t('email')}
            value="info@oncall.clinic"
            href="mailto:info@oncall.clinic"
          />
          <ContactRow
            icon={<Shield className="h-5 w-5 text-primary" aria-hidden="true" />}
            label={t('dpo')}
            value="dpo@oncall.clinic"
            href="mailto:dpo@oncall.clinic"
          />
          <ContactRow
            icon={<Phone className="h-5 w-5 text-primary" aria-hidden="true" />}
            label={t('phone')}
            value={ONCALL_PHONE_DISPLAY}
            href={ONCALL_PHONE_TEL}
          />
          <ContactRow
            icon={<MapPin className="h-5 w-5 text-primary" aria-hidden="true" />}
            label={t('address')}
            value={t('addressValue')}
          />
          <ContactRow
            icon={<MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />}
            label={t('whatsapp')}
            value="Chat"
            href={ONCALL_WA}
            external
          />
        </div>
      </main>
    </div>
  )
}

function ContactRow({
  icon, label, value, href, external,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
  external?: boolean
}) {
  const content = (
    <div className="flex items-start gap-3 rounded-card border border-border/60 bg-card p-4 shadow-card">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
        <p className="font-display font-semibold mt-0.5">{value}</p>
      </div>
    </div>
  )
  if (!href) return content
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="card-hover block rounded-card"
    >
      {content}
    </a>
  )
}
