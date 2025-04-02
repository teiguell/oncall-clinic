
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  
  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('legal.privacy_policy')}</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral">
          <h2>1. {t('legal.privacy.responsible')}</h2>
          <p>{t('legal.privacy.responsible_details')}</p>
          
          <h2>2. {t('legal.privacy.purpose')}</h2>
          <p>{t('legal.privacy.purpose_details')}</p>
          
          <h2>3. {t('legal.privacy.data_protection')}</h2>
          <p>{t('legal.privacy.data_protection_details')}</p>
          
          <h2>4. {t('legal.privacy.rights')}</h2>
          <p>{t('legal.privacy.rights_details')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
