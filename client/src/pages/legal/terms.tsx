
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  
  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('legal.terms')}</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral">
          <h2>1. {t('legal.terms.general')}</h2>
          <p>{t('legal.terms.general_details')}</p>
          
          <h2>2. {t('legal.terms.service')}</h2>
          <p>{t('legal.terms.service_details')}</p>
          
          <h2>3. {t('legal.terms.responsibilities')}</h2>
          <p>{t('legal.terms.responsibilities_details')}</p>
          
          <h2>4. {t('legal.terms.modifications')}</h2>
          <p>{t('legal.terms.modifications_details')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
