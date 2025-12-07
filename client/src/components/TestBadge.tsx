import { Badge } from "@/components/ui/badge";
import { FlaskConical } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TestBadgeProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "destructive";
  size?: "sm" | "md";
}

/**
 * Test Badge Component
 * Displays "테스트" (Test) label for pages using simulated/test data
 * Used to indicate that the page is showing testnet or demo data
 */
export function TestBadge({ className = "", variant = "outline", size = "sm" }: TestBadgeProps) {
  const { t } = useTranslation();
  
  return (
    <Badge 
      variant={variant} 
      className={`gap-1 ${size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"} border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 ${className}`}
      data-testid="badge-test"
    >
      <FlaskConical className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      <span>{t('common.testLabel', '테스트')}</span>
    </Badge>
  );
}

/**
 * TestNet Banner Component
 * A more prominent banner for indicating testnet environment
 */
export function TestNetBanner({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  
  return (
    <div 
      className={`flex items-center justify-center gap-2 bg-amber-100 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 py-1.5 px-4 text-sm font-medium ${className}`}
      data-testid="banner-testnet"
    >
      <FlaskConical className="h-4 w-4" />
      <span>{t('common.testnetMessage', '이 페이지는 테스트 데이터를 표시합니다')}</span>
    </div>
  );
}
