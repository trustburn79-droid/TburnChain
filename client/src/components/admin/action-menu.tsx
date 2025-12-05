import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Power,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Download,
  Upload,
  Copy,
  ExternalLink,
  Shield,
  Unlock,
  Lock,
  Ban,
  Check,
} from "lucide-react";

export interface ActionItem {
  id?: string;
  label?: string;
  icon?: React.ReactNode | typeof Eye;
  onClick?: () => void;
  variant?: "default" | "destructive" | "success" | "warning";
  disabled?: boolean;
  hidden?: boolean;
  separator?: boolean;
}

interface ActionMenuProps {
  actions: ActionItem[];
  testId?: string;
}

const iconMap = {
  view: Eye,
  edit: Edit,
  delete: Trash2,
  stop: Power,
  start: Play,
  pause: Pause,
  restart: RefreshCw,
  settings: Settings,
  download: Download,
  upload: Upload,
  copy: Copy,
  external: ExternalLink,
  protect: Shield,
  unlock: Unlock,
  lock: Lock,
  ban: Ban,
  approve: Check,
};

const variantColors = {
  default: "",
  destructive: "text-destructive focus:text-destructive",
  success: "text-green-600 focus:text-green-600",
  warning: "text-yellow-600 focus:text-yellow-600",
};

function renderIcon(icon: React.ReactNode | typeof Eye | undefined, className: string = "h-4 w-4") {
  if (!icon) {
    return <Eye className={className} />;
  }
  if (typeof icon === "function") {
    const IconComponent = icon as typeof Eye;
    return <IconComponent className={className} />;
  }
  return icon;
}

export function ActionMenu({ actions, testId }: ActionMenuProps) {
  const { t } = useTranslation();
  const visibleActions = actions.filter((a) => !a.hidden && !a.separator);
  const allActions = actions.filter((a) => !a.hidden);

  if (visibleActions.length === 0) return null;

  if (visibleActions.length <= 3) {
    return (
      <div className="flex items-center gap-1" data-testid={testId}>
        {visibleActions.map((action, index) => {
          const actionId = action.id || `action-${index}`;
          return (
            <Tooltip key={actionId}>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={variantColors[action.variant || "default"]}
                  data-testid={`action-${actionId}`}
                >
                  {renderIcon(action.icon)}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{action.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  const primaryActions = visibleActions.slice(0, 2);
  const menuActions = allActions.slice(2);

  return (
    <div className="flex items-center gap-1" data-testid={testId}>
      {primaryActions.map((action, index) => {
        const actionId = action.id || `action-${index}`;
        return (
          <Tooltip key={actionId}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={action.onClick}
                disabled={action.disabled}
                className={variantColors[action.variant || "default"]}
                data-testid={`action-${actionId}`}
              >
                {renderIcon(action.icon)}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{action.label}</TooltipContent>
          </Tooltip>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" data-testid="action-menu-trigger">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" data-testid="action-menu-content">
          {menuActions.map((action, index) => {
            if (action.separator) {
              return <DropdownMenuSeparator key={`sep-${index}`} />;
            }
            const actionId = action.id || `menu-action-${index}`;
            return (
              <DropdownMenuItem
                key={actionId}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`flex items-center gap-2 ${variantColors[action.variant || "default"]}`}
                data-testid={`menu-${actionId}`}
              >
                {renderIcon(action.icon, "h-4 w-4")}
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function QuickActions({
  onView,
  onEdit,
  onDelete,
  onSettings,
  showView = true,
  showEdit = true,
  showDelete = false,
  showSettings = false,
  disabled = false,
  testId,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSettings?: () => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showSettings?: boolean;
  disabled?: boolean;
  testId?: string;
}) {
  const { t } = useTranslation();

  const actions: ActionItem[] = [
    ...(showView && onView
      ? [{ id: "view", label: t("common.view"), icon: Eye, onClick: onView, disabled }]
      : []),
    ...(showEdit && onEdit
      ? [{ id: "edit", label: t("common.edit"), icon: Edit, onClick: onEdit, disabled }]
      : []),
    ...(showSettings && onSettings
      ? [{ id: "settings", label: t("common.settings"), icon: Settings, onClick: onSettings, disabled }]
      : []),
    ...(showDelete && onDelete
      ? [{ id: "delete", label: t("common.delete"), icon: Trash2, onClick: onDelete, variant: "destructive" as const, disabled }]
      : []),
  ];

  return <ActionMenu actions={actions} testId={testId} />;
}
