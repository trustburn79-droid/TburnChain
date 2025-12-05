import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save, Plus, Edit } from "lucide-react";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "password" | "textarea" | "select" | "switch" | "date" | "datetime";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  description?: string;
}

interface AdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  isLoading?: boolean;
  isEditing?: boolean;
  submitText?: string;
  width?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const widthClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
};

export function AdminFormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialData,
  onSubmit,
  isLoading = false,
  isEditing = false,
  submitText,
  width = "lg",
}: AdminFormDialogProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const initial: Record<string, any> = {};
      fields.forEach((field) => {
        if (initialData?.[field.name] !== undefined) {
          initial[field.name] = initialData[field.name];
        } else if (field.defaultValue !== undefined) {
          initial[field.name] = field.defaultValue;
        } else if (field.type === "switch") {
          initial[field.name] = false;
        } else {
          initial[field.name] = "";
        }
      });
      setFormData(initial);
      setErrors({});
    }
  }, [open, initialData, fields]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = t("validation.required");
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name];

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled || isLoading}
            rows={field.rows || 3}
            className={errors[field.name] ? "border-destructive" : ""}
            data-testid={`input-${field.name}`}
          />
        );

      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={(v) => handleChange(field.name, v)}
            disabled={field.disabled || isLoading}
          >
            <SelectTrigger
              className={errors[field.name] ? "border-destructive" : ""}
              data-testid={`select-${field.name}`}
            >
              <SelectValue placeholder={field.placeholder || t("common.select")} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "switch":
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={!!value}
              onCheckedChange={(checked) => handleChange(field.name, checked)}
              disabled={field.disabled || isLoading}
              data-testid={`switch-${field.name}`}
            />
            {field.description && (
              <span className="text-sm text-muted-foreground">{field.description}</span>
            )}
          </div>
        );

      case "number":
        return (
          <Input
            type="number"
            value={value ?? ""}
            onChange={(e) => handleChange(field.name, e.target.value ? Number(e.target.value) : "")}
            placeholder={field.placeholder}
            disabled={field.disabled || isLoading}
            min={field.min}
            max={field.max}
            step={field.step}
            className={errors[field.name] ? "border-destructive" : ""}
            data-testid={`input-${field.name}`}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={field.disabled || isLoading}
            className={errors[field.name] ? "border-destructive" : ""}
            data-testid={`input-${field.name}`}
          />
        );

      case "datetime":
        return (
          <Input
            type="datetime-local"
            value={value || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={field.disabled || isLoading}
            className={errors[field.name] ? "border-destructive" : ""}
            data-testid={`input-${field.name}`}
          />
        );

      default:
        return (
          <Input
            type={field.type}
            value={value || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled || isLoading}
            className={errors[field.name] ? "border-destructive" : ""}
            data-testid={`input-${field.name}`}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={widthClasses[width]} data-testid="admin-form-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="form-dialog-title">
            {isEditing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription data-testid="form-dialog-description">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="grid gap-4 py-4" data-testid="form-fields">
          {fields.map((field) => (
            <div key={field.name} className="grid gap-2">
              <Label htmlFor={field.name} className="flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              {renderField(field)}
              {errors[field.name] && (
                <p className="text-xs text-destructive" data-testid={`error-${field.name}`}>
                  {errors[field.name]}
                </p>
              )}
              {field.description && field.type !== "switch" && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            data-testid="button-cancel"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            data-testid="button-submit"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            {submitText || (isEditing ? t("common.save") : t("common.create"))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
