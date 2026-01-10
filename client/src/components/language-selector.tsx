import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { languages, type LanguageCode, changeLanguageWithPreload } from '@/lib/i18n';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (code: LanguageCode) => {
    if (isChanging) return;
    
    setIsChanging(true);
    try {
      await changeLanguageWithPreload(code);
      const language = languages.find(l => l.code === code);
      document.documentElement.dir = language?.dir === 'rtl' ? 'rtl' : 'ltr';
    } catch (error) {
      console.error('[i18n] Language change failed:', error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-language-selector">
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t('common.selectLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-2 cursor-pointer ${
              currentLanguage.code === language.code ? 'bg-accent' : ''
            }`}
            data-testid={`menu-item-language-${language.code}`}
          >
            <span className="text-base">{language.flag}</span>
            <span className="flex-1">{language.nativeName}</span>
            {currentLanguage.code === language.code && (
              <span className="text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
