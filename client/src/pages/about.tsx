import { useTranslation } from "react-i18next";
import { AlertTriangle, Stethoscope, MapPin, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { IS_SANDBOX } from "@/lib/sandbox";
import { SandboxBanner } from "@/components/common/SandboxBanner";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 md:px-6">
      {IS_SANDBOX && <SandboxBanner />}
      
      <div className="mb-10 mt-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary-700">
          {t('about.title')}
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          {t('about.subtitle')}
        </p>
      </div>

      {IS_SANDBOX && (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('about.sandboxTitle')}
            </CardTitle>
            <CardDescription className="text-amber-700 text-base">
              {t('about.sandboxDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 font-medium text-lg mb-4">
              {t('about.sandboxImportantNotice')}
            </p>
            <ul className="space-y-3 text-neutral-700">
              <li className="flex items-start gap-2">
                <Stethoscope className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>{t('about.doctorNote')}:</strong> {t('about.doctorNoteDesc')}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>{t('about.locationNote')}:</strong> {t('about.locationNoteDesc')}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>{t('about.paymentsNote')}:</strong> {t('about.paymentsNoteDesc')}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('about.ourMission')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600">
              {t('about.missionDesc')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('about.howItWorks')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600">
              {t('about.howItWorksDesc')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('about.forPatients')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 mb-4">
              {t('about.forPatientsDesc')}
            </p>
            <Link href="/register">
              <a className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                {t('about.registerNow')} →
              </a>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('about.forDoctors')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 mb-4">
              {t('about.forDoctorsDesc')}
            </p>
            <Link href="/register/doctor">
              <a className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                {t('about.joinUs')} →
              </a>
            </Link>
          </CardContent>
        </Card>
      </div>

      {IS_SANDBOX && (
        <div className="mt-10 text-center">
          <p className="text-xl font-medium text-neutral-700 mb-2">
            {t('about.questionTitle')}
          </p>
          <p className="text-neutral-600 mb-4">
            {t('about.contactUs')}
          </p>
          <p className="text-sm text-neutral-500">
            <strong>Email:</strong> support@oncall.clinic
          </p>
        </div>
      )}
    </div>
  );
}