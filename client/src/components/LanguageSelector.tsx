import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { languages, changeLanguageWithPreload } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface LanguageSelectorProps {
  isDark?: boolean;
}

export function LanguageSelector({ isDark = true }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (langCode: string) => {
    setIsLoading(true);
    try {
      await changeLanguageWithPreload(langCode);
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          data-testid="button-language-selector"
          disabled={isLoading}
          className={`${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
        >
          <Globe className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={`w-48 max-h-80 overflow-y-auto ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-slate-200'}`}
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            data-testid={`menu-item-language-${lang.code}`}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center gap-3 cursor-pointer ${
              lang.code === currentLanguage.code 
                ? isDark ? 'bg-gray-800 text-white' : 'bg-slate-100 text-slate-900'
                : isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="flex-1">{lang.nativeName}</span>
            {lang.code === currentLanguage.code && (
              <span className="text-xs text-green-500">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
