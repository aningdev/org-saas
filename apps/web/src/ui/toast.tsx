import {
  createToaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  type ToastType,
} from "@ui-sdk/solid/toast";
import type { JSX } from "@solidjs/web";
import { cn } from "@/lib/cn";

const toaster = createToaster();

type ToastAddOptions = {
  title: string;
  description?: string;
  type?: ToastType | "default";
  actionProps?: {
    children?: JSX.Element | string;
    onClick?: () => void;
  };
};

function addToast(options: ToastAddOptions) {
  const type = options.type === "default" ? undefined : options.type;
  const actionLabel =
    typeof options.actionProps?.children === "string"
      ? options.actionProps.children
      : options.actionProps
        ? "Action"
        : undefined;

  return toaster({
    title: options.title,
    description: options.description,
    type,
    action:
      options.actionProps && actionLabel
        ? {
            label: actionLabel,
            onAction: options.actionProps.onClick,
          }
        : undefined,
  });
}

const toast = {
  add: addToast,
  dismiss: (id?: string) => toaster.dismiss(id),
  success: (title: string, options?: Omit<ToastAddOptions, "title" | "type">) =>
    addToast({ ...options, title, type: "success" }),
  error: (title: string, options?: Omit<ToastAddOptions, "title" | "type">) =>
    addToast({ ...options, title, type: "error" }),
  info: (title: string, options?: Omit<ToastAddOptions, "title" | "type">) =>
    addToast({ ...options, title, type: "info" }),
  warning: (title: string, options?: Omit<ToastAddOptions, "title" | "type">) =>
    addToast({ ...options, title, type: "warning" }),
};

function Toaster() {
  return (
    <ToastRegion
      toaster={toaster}
      side="bottom"
      align="end"
      class={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto flex w-auto max-w-sm flex-col outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
      )}
    >
      {() => (
        <Toast
          class={cn(
            "group/toast pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border bg-popover p-4 text-popover-foreground shadow-lg outline-none select-none",
            "data-[type=error]:border-destructive/30",
          )}
        >
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <ToastTitle class="text-sm font-medium" />
            <ToastDescription class="text-sm text-muted-foreground" />
          </div>
          <ToastAction class="shrink-0 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium hover:bg-muted" />
          <ToastClose
            aria-label="Close toast"
            class="relative shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              class="size-4"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </ToastClose>
        </Toast>
      )}
    </ToastRegion>
  );
}

export { Toaster, toast, toaster, createToaster };
export type { ToastAddOptions };
