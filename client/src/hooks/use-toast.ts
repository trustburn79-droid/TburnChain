import * as React from "react"
import { showTBurnAlert, type AlertType } from "@/components/tburn-alert-modal"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

interface State {
  toasts: ToasterToast[]
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type Toast = Omit<ToasterToast, "id">

function mapVariantToAlertType(variant?: string | null): AlertType {
  switch (variant) {
    case "destructive":
      return "error";
    case "success":
      return "success";
    case "warning":
      return "warning";
    default:
      return "info";
  }
}

function toast({ title, description, variant, ...props }: Toast) {
  const id = genId()
  
  const alertType = mapVariantToAlertType(variant);
  const titleStr = typeof title === 'string' ? title : (title ? String(title) : '');
  const descStr = typeof description === 'string' ? description : (description ? String(description) : '');
  
  showTBurnAlert(alertType, titleStr, descStr);

  return {
    id: id,
    dismiss: () => {},
    update: () => {},
  }
}

function useToast() {
  const [state] = React.useState<State>({ toasts: [] })

  return {
    ...state,
    toast,
    dismiss: () => {},
  }
}

export { useToast, toast }
