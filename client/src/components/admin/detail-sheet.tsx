import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, ExternalLink, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface DetailField {
  label: string;
  value: string | number | boolean | Date | null | undefined;
  type?: "text" | "code" | "badge" | "link" | "progress" | "date" | "currency" | "status";
  badgeVariant?: "default" | "destructive" | "outline" | "secondary";
  badgeColor?: string;
  copyable?: boolean;
  copyValue?: string;
  linkHref?: string;
}

export interface DetailSection {
  title: string;
  icon?: React.ReactNode;
  fields: DetailField[];
}

export interface DetailAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "warning";
  disabled?: boolean;
}

interface DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  sections: DetailSection[];
  actions?: DetailAction[];
  isLoading?: boolean;
  width?: "sm" | "md" | "lg" | "xl";
}

const widthClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
};

export function DetailSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  description,
  icon,
  sections,
  actions,
  isLoading = false,
  width = "lg",
}: DetailSheetProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: t("common.copied"),
      description: t("common.copiedToClipboard"),
    });
  };

  const formatValue = (field: DetailField) => {
    if (field.value === null || field.value === undefined) {
      return <span className="text-muted-foreground">-</span>;
    }

    switch (field.type) {
      case "code":
        return (
          <code className="px-2 py-1 rounded bg-muted font-mono text-sm break-all">
            {String(field.value)}
          </code>
        );
      case "badge":
        return (
          <Badge 
            variant={field.badgeVariant || "secondary"}
            className={field.badgeColor}
          >
            {String(field.value)}
          </Badge>
        );
      case "link":
        return (
          <a
            href={field.linkHref || String(field.value)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1"
          >
            {String(field.value)}
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      case "progress":
        const numValue = typeof field.value === "number" ? field.value : parseFloat(String(field.value));
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${numValue >= 90 ? "bg-green-500" : numValue >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${Math.min(100, numValue)}%` }}
              />
            </div>
            <span className="text-sm font-medium w-12 text-right">{numValue}%</span>
          </div>
        );
      case "date":
        const date = new Date(String(field.value));
        return isNaN(date.getTime()) ? String(field.value) : date.toLocaleString();
      case "currency":
        return (
          <span className="font-mono">
            {typeof field.value === "number" ? field.value.toLocaleString() : field.value}
          </span>
        );
      case "status":
        const statusValue = String(field.value).toLowerCase();
        const statusColors: Record<string, string> = {
          online: "bg-green-500/10 text-green-500",
          active: "bg-green-500/10 text-green-500",
          healthy: "bg-green-500/10 text-green-500",
          success: "bg-green-500/10 text-green-500",
          offline: "bg-red-500/10 text-red-500",
          inactive: "bg-red-500/10 text-red-500",
          error: "bg-red-500/10 text-red-500",
          failed: "bg-red-500/10 text-red-500",
          syncing: "bg-yellow-500/10 text-yellow-500",
          pending: "bg-yellow-500/10 text-yellow-500",
          warning: "bg-yellow-500/10 text-yellow-500",
        };
        return (
          <Badge className={statusColors[statusValue] || "bg-muted"}>
            {String(field.value)}
          </Badge>
        );
      default:
        return typeof field.value === "boolean" ? (field.value ? "Yes" : "No") : String(field.value);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={`${widthClasses[width]} flex flex-col`} data-testid="detail-sheet">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2" data-testid="detail-sheet-title">
            {icon}
            <div>
              <span>{title}</span>
              {subtitle && (
                <p className="text-xs text-muted-foreground font-mono font-normal">{subtitle}</p>
              )}
            </div>
          </SheetTitle>
          {description && (
            <SheetDescription data-testid="detail-sheet-description">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="space-y-6 py-4">
              {[1, 2, 3].map((section) => (
                <div key={section} className="space-y-3">
                  <Skeleton className="h-5 w-32" />
                  {[1, 2, 3].map((field) => (
                    <div key={field} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" data-testid={`section-${sectionIndex}`}>
                    {section.icon && <span className="text-muted-foreground">{section.icon}</span>}
                    {section.title}
                  </h3>
                  <div className="space-y-3">
                    {section.fields.map((field, fieldIndex) => (
                      <div
                        key={fieldIndex}
                        className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4"
                        data-testid={`field-${sectionIndex}-${fieldIndex}`}
                      >
                        <span className="text-sm text-muted-foreground shrink-0">
                          {field.label}
                        </span>
                        <div className="flex items-center gap-2 text-right">
                          <span className="text-sm break-all">{formatValue(field)}</span>
                          {field.copyable && field.value && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => handleCopy(field.copyValue || String(field.value))}
                              data-testid={`copy-${fieldIndex}`}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {sectionIndex < sections.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {actions && actions.length > 0 && (
          <>
            <Separator />
            <div className="flex gap-2 pt-4 flex-wrap" data-testid="detail-sheet-actions">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant === "warning" ? "outline" : (action.variant || "outline")}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={action.variant === "warning" ? "border-yellow-500 text-yellow-500 hover:bg-yellow-500/10" : ""}
                  data-testid={`action-${index}`}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
