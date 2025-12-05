import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Pause,
  RefreshCw,
  Shield,
  Lock,
  Unlock,
} from "lucide-react";

type StatusType =
  | "active"
  | "inactive"
  | "online"
  | "offline"
  | "syncing"
  | "pending"
  | "success"
  | "error"
  | "warning"
  | "paused"
  | "jailed"
  | "blocked"
  | "mitigated"
  | "monitored"
  | "connected"
  | "disconnected"
  | "degraded"
  | "operational"
  | "critical"
  | "passed"
  | "rejected"
  | "executed"
  | "draft"
  | "cancelled";

interface StatusBadgeProps {
  status: StatusType | string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  customLabel?: string;
  testId?: string;
}

const statusConfig: Record<
  StatusType,
  {
    color: string;
    icon: typeof CheckCircle2;
    labelKey: string;
  }
> = {
  active: { color: "bg-green-500/10 text-green-500", icon: CheckCircle2, labelKey: "status.active" },
  inactive: { color: "bg-gray-500/10 text-gray-500", icon: XCircle, labelKey: "status.inactive" },
  online: { color: "bg-green-500/10 text-green-500", icon: CheckCircle2, labelKey: "status.online" },
  offline: { color: "bg-red-500/10 text-red-500", icon: XCircle, labelKey: "status.offline" },
  syncing: { color: "bg-yellow-500/10 text-yellow-500", icon: RefreshCw, labelKey: "status.syncing" },
  pending: { color: "bg-yellow-500/10 text-yellow-500", icon: Clock, labelKey: "status.pending" },
  success: { color: "bg-green-500/10 text-green-500", icon: CheckCircle2, labelKey: "status.success" },
  error: { color: "bg-red-500/10 text-red-500", icon: XCircle, labelKey: "status.error" },
  warning: { color: "bg-yellow-500/10 text-yellow-500", icon: AlertCircle, labelKey: "status.warning" },
  paused: { color: "bg-gray-500/10 text-gray-500", icon: Pause, labelKey: "status.paused" },
  jailed: { color: "bg-red-500/10 text-red-500", icon: Lock, labelKey: "status.jailed" },
  blocked: { color: "bg-green-500/10 text-green-500", icon: Shield, labelKey: "status.blocked" },
  mitigated: { color: "bg-blue-500/10 text-blue-500", icon: Shield, labelKey: "status.mitigated" },
  monitored: { color: "bg-yellow-500/10 text-yellow-500", icon: AlertCircle, labelKey: "status.monitored" },
  connected: { color: "bg-green-500/10 text-green-500", icon: CheckCircle2, labelKey: "status.connected" },
  disconnected: { color: "bg-red-500/10 text-red-500", icon: XCircle, labelKey: "status.disconnected" },
  degraded: { color: "bg-yellow-500/10 text-yellow-500", icon: AlertCircle, labelKey: "status.degraded" },
  operational: { color: "bg-green-500/10 text-green-500", icon: CheckCircle2, labelKey: "status.operational" },
  critical: { color: "bg-red-500/10 text-red-500", icon: AlertCircle, labelKey: "status.critical" },
  passed: { color: "bg-green-500/10 text-green-500", icon: CheckCircle2, labelKey: "status.passed" },
  rejected: { color: "bg-red-500/10 text-red-500", icon: XCircle, labelKey: "status.rejected" },
  executed: { color: "bg-purple-500/10 text-purple-500", icon: CheckCircle2, labelKey: "status.executed" },
  draft: { color: "bg-gray-500/10 text-gray-500", icon: Clock, labelKey: "status.draft" },
  cancelled: { color: "bg-gray-500/10 text-gray-500", icon: XCircle, labelKey: "status.cancelled" },
};

const sizeClasses = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
  lg: "text-sm px-2.5 py-1",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export function StatusBadge({
  status,
  size = "md",
  showIcon = true,
  customLabel,
  testId,
}: StatusBadgeProps) {
  const { t } = useTranslation();
  const normalizedStatus = status.toLowerCase() as StatusType;
  const config = statusConfig[normalizedStatus] || {
    color: "bg-gray-500/10 text-gray-500",
    icon: AlertCircle,
    labelKey: `status.${status}`,
  };
  const Icon = config.icon;

  return (
    <Badge
      className={`${config.color} ${sizeClasses[size]} gap-1 font-medium`}
      data-testid={testId || `badge-status-${status}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {customLabel || t(config.labelKey, { defaultValue: status })}
    </Badge>
  );
}

export function SeverityBadge({
  severity,
  size = "md",
  testId,
}: {
  severity: "critical" | "high" | "medium" | "low" | string;
  size?: "sm" | "md" | "lg";
  testId?: string;
}) {
  const { t } = useTranslation();
  const severityConfig: Record<string, { color: string; label: string }> = {
    critical: { color: "bg-red-500/10 text-red-500", label: t("severity.critical") },
    high: { color: "bg-orange-500/10 text-orange-500", label: t("severity.high") },
    medium: { color: "bg-yellow-500/10 text-yellow-500", label: t("severity.medium") },
    low: { color: "bg-blue-500/10 text-blue-500", label: t("severity.low") },
  };

  const config = severityConfig[severity.toLowerCase()] || {
    color: "bg-gray-500/10 text-gray-500",
    label: severity,
  };

  return (
    <Badge
      className={`${config.color} ${sizeClasses[size]} font-medium`}
      data-testid={testId || `badge-severity-${severity}`}
    >
      {config.label}
    </Badge>
  );
}

export function TypeBadge({
  type,
  size = "md",
  testId,
}: {
  type: string;
  size?: "sm" | "md" | "lg";
  testId?: string;
}) {
  const { t } = useTranslation();
  const typeConfig: Record<string, { color: string }> = {
    validator: { color: "text-purple-500 border-purple-500/30" },
    full: { color: "text-blue-500 border-blue-500/30" },
    archive: { color: "text-orange-500 border-orange-500/30" },
    light: { color: "text-green-500 border-green-500/30" },
    network: { color: "text-blue-500 border-blue-500/30" },
    economics: { color: "text-green-500 border-green-500/30" },
    bridge: { color: "text-purple-500 border-purple-500/30" },
    staking: { color: "text-yellow-500 border-yellow-500/30" },
    ai: { color: "text-cyan-500 border-cyan-500/30" },
    security: { color: "text-red-500 border-red-500/30" },
  };

  const config = typeConfig[type.toLowerCase()] || { color: "text-muted-foreground border-border" };

  return (
    <Badge
      variant="outline"
      className={`${config.color} ${sizeClasses[size]} font-medium`}
      data-testid={testId || `badge-type-${type}`}
    >
      {t(`types.${type.toLowerCase()}`, { defaultValue: type })}
    </Badge>
  );
}
