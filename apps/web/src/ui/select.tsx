import {
  Select as SelectPrimitive,
  SelectContent as SelectContentPrimitive,
  SelectGroup as SelectGroupPrimitive,
  SelectItem as SelectItemPrimitive,
  SelectItemIndicator,
  SelectLabel as SelectLabelPrimitive,
  SelectTrigger as SelectTriggerPrimitive,
  SelectValue as SelectValuePrimitive,
  type SelectProps as SelectRootProps,
} from "@ui-sdk/solid/select";
import { omit, type ComponentProps } from "solid-js";
import { cn } from "@/lib/cn";

function Select(props: SelectRootProps) {
  return <SelectPrimitive data-slot="select" {...(props as SelectRootProps)} />;
}

type SelectGroupProps = ComponentProps<typeof SelectGroupPrimitive>;

function SelectGroup(props: SelectGroupProps) {
  const rest = omit(props, "class");
  return (
    <SelectGroupPrimitive
      data-slot="select-group"
      class={cn("scroll-my-1 p-1", props.class)}
      {...rest}
    />
  );
}

type SelectValueProps = ComponentProps<typeof SelectValuePrimitive>;

function SelectValue(props: SelectValueProps) {
  const rest = omit(props, "class");
  return (
    <SelectValuePrimitive
      data-slot="select-value"
      class={cn("flex flex-1 text-left", props.class)}
      {...rest}
    />
  );
}

type SelectTriggerProps = ComponentProps<typeof SelectTriggerPrimitive> & {
  size?: "sm" | "default";
};

function SelectTrigger(props: SelectTriggerProps) {
  const rest = omit(props, "class", "size", "children");
  return (
    <SelectTriggerPrimitive
      data-slot="select-trigger"
      data-size={props.size ?? "default"}
      class={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-md border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      {...rest}
    >
      {props.children}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        class="size-4 text-muted-foreground pointer-events-none"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </SelectTriggerPrimitive>
  );
}

type SelectContentProps = ComponentProps<typeof SelectContentPrimitive>;

function SelectContent(props: SelectContentProps) {
  const rest = omit(props, "class");
  return (
    <SelectContentPrimitive
      data-slot="select-content"
      class={cn(
        "relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        props.class,
      )}
      {...rest}
    />
  );
}

type SelectLabelProps = ComponentProps<typeof SelectLabelPrimitive>;

function SelectLabel(props: SelectLabelProps) {
  const rest = omit(props, "class");
  return (
    <SelectLabelPrimitive
      data-slot="select-label"
      class={cn("px-2 py-1.5 text-xs text-muted-foreground", props.class)}
      {...rest}
    />
  );
}

type SelectItemProps = ComponentProps<typeof SelectItemPrimitive>;

function SelectItem(props: SelectItemProps) {
  const rest = omit(props, "class", "children");
  return (
    <SelectItemPrimitive
      data-slot="select-item"
      class={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      {...rest}
    >
      {props.children}
      <span class="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
        <SelectItemIndicator>
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
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </SelectItemIndicator>
      </span>
    </SelectItemPrimitive>
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectItemIndicator,
};
