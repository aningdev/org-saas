import {
  Dialog as DialogPrimitive,
  DialogBackdrop,
  DialogClose as DialogClosePrimitive,
  DialogContent as DialogContentPrimitive,
  DialogDescription as DialogDescriptionPrimitive,
  DialogTitle as DialogTitlePrimitive,
  DialogTrigger as DialogTriggerPrimitive,
} from "@ui-sdk/solid/dialog";
import { omit, type ComponentProps } from "solid-js";
import type { JSX } from "@solidjs/web";
import { cn } from "@/lib/cn";

type DialogProps = ComponentProps<typeof DialogPrimitive>;

function Dialog(props: DialogProps) {
  return <DialogPrimitive data-slot="dialog" {...props} />;
}

type DialogTriggerProps = ComponentProps<typeof DialogTriggerPrimitive>;

function DialogTrigger(props: DialogTriggerProps) {
  return <DialogTriggerPrimitive data-slot="dialog-trigger" {...props} />;
}

type DialogCloseProps = ComponentProps<typeof DialogClosePrimitive>;

function DialogClose(props: DialogCloseProps) {
  return <DialogClosePrimitive data-slot="dialog-close" {...props} />;
}

type DialogOverlayProps = ComponentProps<typeof DialogBackdrop>;

function DialogOverlay(props: DialogOverlayProps) {
  const rest = omit(props, "class");
  return (
    <DialogBackdrop
      data-slot="dialog-overlay"
      class={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        props.class,
      )}
      {...rest}
    />
  );
}

type DialogContentProps = ComponentProps<typeof DialogContentPrimitive> & {
  showCloseButton?: boolean;
};

function DialogContent(props: DialogContentProps) {
  const rest = omit(props, "class", "children", "showCloseButton");
  return (
    <>
      <DialogOverlay />
      <DialogContentPrimitive
        data-slot="dialog-content"
        class={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 rounded-xl bg-popover p-6 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-md data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          props.class,
        )}
        {...rest}
      >
        {props.children}
        {props.showCloseButton !== false && (
          <DialogClosePrimitive
            data-slot="dialog-close"
            class="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
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
          </DialogClosePrimitive>
        )}
      </DialogContentPrimitive>
    </>
  );
}

type DivProps = JSX.HTMLAttributes<HTMLDivElement>;

function DialogHeader(props: DivProps) {
  const rest = omit(props, "class");
  return (
    <div data-slot="dialog-header" class={cn("flex flex-col gap-2", props.class)} {...rest} />
  );
}

function DialogFooter(props: DivProps) {
  const rest = omit(props, "class");
  return (
    <div
      data-slot="dialog-footer"
      class={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", props.class)}
      {...rest}
    />
  );
}

type DialogTitleProps = ComponentProps<typeof DialogTitlePrimitive>;

function DialogTitle(props: DialogTitleProps) {
  const rest = omit(props, "class");
  return (
    <DialogTitlePrimitive
      data-slot="dialog-title"
      class={cn("font-heading leading-none font-medium", props.class)}
      {...rest}
    />
  );
}

type DialogDescriptionProps = ComponentProps<typeof DialogDescriptionPrimitive>;

function DialogDescription(props: DialogDescriptionProps) {
  const rest = omit(props, "class");
  return (
    <DialogDescriptionPrimitive
      data-slot="dialog-description"
      class={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        props.class,
      )}
      {...rest}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
