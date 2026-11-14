import {
  AlertDialog as AlertDialogPrimitive,
  AlertDialogBackdrop,
  AlertDialogClose as AlertDialogClosePrimitive,
  AlertDialogContent as AlertDialogContentPrimitive,
  AlertDialogDescription as AlertDialogDescriptionPrimitive,
  AlertDialogTitle as AlertDialogTitlePrimitive,
  AlertDialogTrigger as AlertDialogTriggerPrimitive,
} from "@ui-sdk/solid/alert-dialog";
import { omit, type ComponentProps } from "solid-js";
import type { JSX } from "@solidjs/web";
import { cn } from "@/lib/cn";

type AlertDialogProps = ComponentProps<typeof AlertDialogPrimitive>;

function AlertDialog(props: AlertDialogProps) {
  return <AlertDialogPrimitive data-slot="alert-dialog" {...props} />;
}

type AlertDialogTriggerProps = ComponentProps<typeof AlertDialogTriggerPrimitive>;

function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <AlertDialogTriggerPrimitive data-slot="alert-dialog-trigger" {...props} />;
}

type AlertDialogCloseProps = ComponentProps<typeof AlertDialogClosePrimitive>;

function AlertDialogClose(props: AlertDialogCloseProps) {
  return <AlertDialogClosePrimitive data-slot="alert-dialog-close" {...props} />;
}

type AlertDialogOverlayProps = ComponentProps<typeof AlertDialogBackdrop>;

function AlertDialogOverlay(props: AlertDialogOverlayProps) {
  const rest = omit(props, "class");
  return (
    <AlertDialogBackdrop
      data-slot="alert-dialog-overlay"
      class={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        props.class,
      )}
      {...rest}
    />
  );
}

type AlertDialogContentProps = ComponentProps<typeof AlertDialogContentPrimitive> & {
  size?: "default" | "sm";
};

function AlertDialogContent(props: AlertDialogContentProps) {
  const rest = omit(props, "class", "size");
  return (
    <>
      <AlertDialogOverlay />
      <AlertDialogContentPrimitive
        data-slot="alert-dialog-content"
        data-size={props.size ?? "default"}
        class={cn(
          "group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-6 rounded-xl bg-popover p-6 text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-lg data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          props.class,
        )}
        {...rest}
      />
    </>
  );
}

type DivProps = JSX.HTMLAttributes<HTMLDivElement>;

function AlertDialogHeader(props: DivProps) {
  const rest = omit(props, "class");
  return (
    <div
      data-slot="alert-dialog-header"
      class={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left",
        props.class,
      )}
      {...rest}
    />
  );
}

function AlertDialogFooter(props: DivProps) {
  const rest = omit(props, "class");
  return (
    <div
      data-slot="alert-dialog-footer"
      class={cn(
        "flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        props.class,
      )}
      {...rest}
    />
  );
}

type AlertDialogTitleProps = ComponentProps<typeof AlertDialogTitlePrimitive>;

function AlertDialogTitle(props: AlertDialogTitleProps) {
  const rest = omit(props, "class");
  return (
    <AlertDialogTitlePrimitive
      data-slot="alert-dialog-title"
      class={cn(
        "font-heading text-lg font-medium sm:group-data-[size=default]/alert-dialog-content:text-left",
        props.class,
      )}
      {...rest}
    />
  );
}

type AlertDialogDescriptionProps = ComponentProps<typeof AlertDialogDescriptionPrimitive>;

function AlertDialogDescription(props: AlertDialogDescriptionProps) {
  const rest = omit(props, "class");
  return (
    <AlertDialogDescriptionPrimitive
      data-slot="alert-dialog-description"
      class={cn("text-sm text-muted-foreground", props.class)}
      {...rest}
    />
  );
}

function AlertDialogAction(props: AlertDialogCloseProps) {
  const rest = omit(props, "class");
  return (
    <AlertDialogClose
      data-slot="alert-dialog-action"
      class={cn(
        "inline-flex h-9 items-center justify-center rounded-md bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80",
        props.class,
      )}
      value="confirm"
      {...rest}
    />
  );
}

function AlertDialogCancel(props: AlertDialogCloseProps) {
  const rest = omit(props, "class");
  return (
    <AlertDialogClose
      data-slot="alert-dialog-cancel"
      class={cn(
        "inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs hover:bg-muted",
        props.class,
      )}
      {...rest}
    />
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogClose,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
