import {
  Tooltip as TooltipPrimitive,
  TooltipContent as TooltipContentPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
} from "@ui-sdk/solid/tooltip";
import { omit, type ComponentProps, type ParentProps } from "solid-js";

import { cn } from "@/lib/cn";

/** Noop provider for API compatibility with previous TooltipProvider. */
function TooltipProvider(props: ParentProps<{ delay?: number; class?: string }>) {
  const rest = omit(props, "class", "delay", "children");
  return (
    <div data-slot="tooltip-provider" class={props.class} {...rest}>
      {props.children}
    </div>
  );
}

type TooltipProps = ComponentProps<typeof TooltipPrimitive>;

function Tooltip(props: TooltipProps) {
  return <TooltipPrimitive data-slot="tooltip" {...props} />;
}

type TooltipTriggerProps = ComponentProps<typeof TooltipTriggerPrimitive>;

function TooltipTrigger(props: TooltipTriggerProps) {
  return <TooltipTriggerPrimitive data-slot="tooltip-trigger" {...props} />;
}

type TooltipContentProps = ComponentProps<typeof TooltipContentPrimitive>;

function TooltipContent(props: TooltipContentProps) {
  const rest = omit(props, "class");
  return (
    <TooltipContentPrimitive
      data-slot="tooltip-content"
      class={cn(
        "z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        props.class,
      )}
      {...rest}
    />
  );
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
export type { TooltipProps, TooltipTriggerProps, TooltipContentProps };
