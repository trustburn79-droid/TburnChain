import { useTranslation } from "react-i18next";

export default function EducationPrograms() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">{t('publicPages.learn.educationPrograms.title')}</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-xl text-muted-foreground mb-8">
          {t('publicPages.learn.educationPrograms.subtitle')}
        </p>
      </div>
    </div>
  );
}
