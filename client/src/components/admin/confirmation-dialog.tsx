import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2, Power, RefreshCw, Shield, XCircle, Loader2 } from "lucide-react";

type ActionType = "delete" | "stop" | "restart" | "disable" | "terminate" | "custom";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionType?: ActionType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  requiresConfirmation?: boolean;
  confirmationText?: string;
  isLoading?: boolean;
  destructive?: boolean;
}

const actionIcons: Record<ActionType, typeof AlertTriangle> = {
  delete: Trash2,
  stop: Power,
  restart: RefreshCw,
  disable: Shield,
  terminate: XCircle,
  custom: AlertTriangle,
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  actionType = "custom",
  confirmText,
  cancelText,
  onConfirm,
  requiresConfirmation = false,
  confirmationText = "CONFIRM",
  isLoading = false,
  destructive = true,
}: ConfirmationDialogProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const Icon = actionIcons[actionType];

  const handleConfirm = async () => {
    await onConfirm();
    setInputValue("");
  };

  const isConfirmDisabled = requiresConfirmation && inputValue !== confirmationText;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="confirmation-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2" data-testid="confirmation-title">
            <div className={`p-2 rounded-full ${destructive ? "bg-destructive/10" : "bg-primary/10"}`}>
              <Icon className={`h-5 w-5 ${destructive ? "text-destructive" : "text-primary"}`} />
            </div>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription data-testid="confirmation-description">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {requiresConfirmation && (
          <div className="space-y-2 py-2">
            <p className="text-sm text-muted-foreground">
              {t("admin.confirmAction.typeToConfirm", { text: confirmationText })}
            </p>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={confirmationText}
              data-testid="confirmation-input"
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} data-testid="button-cancel">
            {cancelText || t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isConfirmDisabled || isLoading}
            className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            data-testid="button-confirm"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmText || t("common.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function useConfirmation() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    title: string;
    description: string;
    actionType: ActionType;
    onConfirm: () => void | Promise<void>;
    destructive: boolean;
    requiresConfirmation: boolean;
    confirmationText: string;
  }>({
    open: false,
    title: "",
    description: "",
    actionType: "custom",
    onConfirm: () => {},
    destructive: true,
    requiresConfirmation: false,
    confirmationText: "CONFIRM",
  });
  const [isLoading, setIsLoading] = useState(false);

  const confirm = async (options: {
    title: string;
    description: string;
    actionType?: ActionType;
    onConfirm: () => void | Promise<void>;
    destructive?: boolean;
    requiresConfirmation?: boolean;
    confirmationText?: string;
  }) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        open: true,
        title: options.title,
        description: options.description,
        actionType: options.actionType || "custom",
        onConfirm: async () => {
          setIsLoading(true);
          try {
            await options.onConfirm();
            resolve(true);
          } finally {
            setIsLoading(false);
            setDialogState((prev) => ({ ...prev, open: false }));
          }
        },
        destructive: options.destructive ?? true,
        requiresConfirmation: options.requiresConfirmation ?? false,
        confirmationText: options.confirmationText ?? "CONFIRM",
      });
    });
  };

  const DialogComponent = () => (
    <ConfirmationDialog
      open={dialogState.open}
      onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
      title={dialogState.title}
      description={dialogState.description}
      actionType={dialogState.actionType}
      onConfirm={dialogState.onConfirm}
      destructive={dialogState.destructive}
      requiresConfirmation={dialogState.requiresConfirmation}
      confirmationText={dialogState.confirmationText}
      isLoading={isLoading}
    />
  );

  return { confirm, DialogComponent };
}
