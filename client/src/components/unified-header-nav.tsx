import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Globe,
  Home,
  User,
  ImageIcon,
  ScanLine,
  LayoutDashboard,
  Coins,
} from "lucide-react";
import { ProfileBadge } from "@/components/profile-badge";
import { useState } from "react";
import i18n from "@/lib/i18n";

interface UnifiedHeaderNavProps {
  variant?: "light" | "dark";
}

export function UnifiedHeaderNav({ variant = "dark" }: UnifiedHeaderNavProps) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [language, setLanguage] = useState(i18n.language || 'en');

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  const navigate = (path: string) => {
    // Use SPA navigation for all routes - wouter handles them correctly
    setLocation(path);
  };

  const baseButtonClass = variant === "dark" 
    ? "h-7 w-7 sm:h-9 sm:w-9 text-gray-400 hover:text-white"
    : "h-7 w-7 sm:h-9 sm:w-9 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white";

  const dropdownBgClass = variant === "dark"
    ? "bg-gray-900 border-gray-700"
    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700";

  const dropdownItemClass = (isActive: boolean) => variant === "dark"
    ? isActive ? 'bg-gray-800 text-white' : 'text-gray-300'
    : isActive ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300';

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={baseButtonClass}
            data-testid="button-language-selector"
          >
            <Globe className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={`${dropdownBgClass} max-h-80 overflow-y-auto`}>
          <DropdownMenuItem onClick={() => handleLanguageChange('en')} className={dropdownItemClass(language === 'en')}>English</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLanguageChange('zh')} className={dropdownItemClass(language === 'zh')}>中文</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLanguageChange('ja')} className={dropdownItemClass(language === 'ja')}>日本語</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLanguageChange('hi')} className={dropdownItemClass(language === 'hi')}>हिन्दी</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLanguageChange('es')} className={dropdownItemClass(language === 'es')}>Español</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLanguageChange('fr')} className={dropdownItemClass(language === 'fr')}>Français</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLanguageChange('ar')} className={dropdownItemClass(language === 'ar')}>العربية</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLanguageChange('bn')} className={dropdownItemClass(language === 'bn')}>বাংলা</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLanguageChange('ru')} className={dropdownItemClass(language === 'ru')}>Русский</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLanguageChange('pt')} className={dropdownItemClass(language === 'pt')}>Português</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLanguageChange('ur')} className={dropdownItemClass(language === 'ur')}>اردو</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLanguageChange('ko')} className={dropdownItemClass(language === 'ko')}>한국어</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden sm:block w-px h-6 bg-gray-700 dark:bg-gray-700 mx-1" />

      <Button
        variant="ghost"
        size="icon"
        className={baseButtonClass}
        onClick={() => navigate("/")}
        data-testid="link-nav-home"
      >
        <Home className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={baseButtonClass}
        onClick={() => navigate("/scan")}
        data-testid="link-nav-scan"
      >
        <ScanLine className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={baseButtonClass}
        onClick={() => navigate("/user")}
        data-testid="link-nav-user"
      >
        <User className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={baseButtonClass}
        onClick={() => navigate("/token-generator")}
        data-testid="link-nav-token-generator"
      >
        <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={baseButtonClass}
        onClick={() => navigate("/nft-marketplace")}
        data-testid="link-nav-nft-marketplace"
      >
        <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={baseButtonClass}
        onClick={() => navigate("/app")}
        data-testid="link-nav-app"
      >
        <LayoutDashboard className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>

      <ProfileBadge />
    </div>
  );
}
