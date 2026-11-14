import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@ui-sdk/solid/menu";
import { omit, type ComponentProps } from "solid-js";
import type { JSX } from "@solidjs/web";
import { cn } from "@/lib/cn";

type DropdownMenuProps = ComponentProps<typeof Menu>;

function DropdownMenu(props: DropdownMenuProps) {
  return <Menu data-slot="dropdown-menu" {...props} />;
}

type DropdownMenuTriggerProps = ComponentProps<typeof MenuTrigger>;

function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  return <MenuTrigger data-slot="dropdown-menu-trigger" {...props} />;
}

type DropdownMenuContentProps = ComponentProps<typeof MenuContent>;

function DropdownMenuContent(props: DropdownMenuContentProps) {
  const rest = omit(props, "class");
  return (
    <MenuContent
      data-slot="dropdown-menu-content"
      class={cn(
        "z-50 max-h-(--available-height) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95",
        props.class,
      )}
      {...rest}
    />
  );
}

type DropdownMenuGroupProps = ComponentProps<typeof MenuGroup>;

function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <MenuGroup data-slot="dropdown-menu-group" {...props} />;
}

type DropdownMenuLabelProps = ComponentProps<typeof MenuGroupLabel> & {
  inset?: boolean;
};

function DropdownMenuLabel(props: DropdownMenuLabelProps) {
  const rest = omit(props, "class", "inset");
  return (
    <MenuGroupLabel
      data-slot="dropdown-menu-label"
      data-inset={props.inset || undefined}
      class={cn(
        "px-2 py-1.5 text-xs font-medium text-muted-foreground data-inset:pl-8",
        props.class,
      )}
      {...rest}
    />
  );
}

type DropdownMenuItemProps = ComponentProps<typeof MenuItem> & {
  inset?: boolean;
  variant?: "default" | "destructive";
};

function DropdownMenuItem(props: DropdownMenuItemProps) {
  const rest = omit(props, "class", "inset", "variant");
  return (
    <MenuItem
      data-slot="dropdown-menu-item"
      data-inset={props.inset || undefined}
      data-variant={props.variant ?? "default"}
      class={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      {...rest}
    />
  );
}

type DropdownMenuSubProps = ComponentProps<typeof MenuSub>;

function DropdownMenuSub(props: DropdownMenuSubProps) {
  return <MenuSub data-slot="dropdown-menu-sub" {...props} />;
}

type DropdownMenuSubTriggerProps = ComponentProps<typeof MenuSubTrigger> & {
  inset?: boolean;
};

function DropdownMenuSubTrigger(props: DropdownMenuSubTriggerProps) {
  const rest = omit(props, "class", "inset", "children");
  return (
    <MenuSubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={props.inset || undefined}
      class={cn(
        "flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-8 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
        class="ml-auto size-4"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </MenuSubTrigger>
  );
}

type DropdownMenuSubContentProps = ComponentProps<typeof MenuSubContent>;

function DropdownMenuSubContent(props: DropdownMenuSubContentProps) {
  const rest = omit(props, "class");
  return (
    <MenuSubContent
      data-slot="dropdown-menu-sub-content"
      class={cn(
        "z-50 min-w-[96px] origin-(--transform-origin) overflow-hidden rounded-md bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        props.class,
      )}
      {...rest}
    />
  );
}

type DropdownMenuCheckboxItemProps = ComponentProps<typeof MenuCheckboxItem> & {
  inset?: boolean;
};

function DropdownMenuCheckboxItem(props: DropdownMenuCheckboxItemProps) {
  const rest = omit(props, "class", "inset", "children");
  return (
    <MenuCheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={props.inset || undefined}
      class={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      {...rest}
    >
      <span class="pointer-events-none absolute right-2 flex items-center justify-center">
        <MenuItemIndicator>
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
        </MenuItemIndicator>
      </span>
      {props.children}
    </MenuCheckboxItem>
  );
}

type DropdownMenuRadioGroupProps = ComponentProps<typeof MenuRadioGroup>;

function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
  return <MenuRadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

type DropdownMenuRadioItemProps = ComponentProps<typeof MenuRadioItem> & {
  inset?: boolean;
};

function DropdownMenuRadioItem(props: DropdownMenuRadioItemProps) {
  const rest = omit(props, "class", "inset", "children");
  return (
    <MenuRadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={props.inset || undefined}
      class={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      {...rest}
    >
      <span class="pointer-events-none absolute right-2 flex items-center justify-center">
        <MenuItemIndicator>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            class="size-2 fill-current"
          >
            <circle cx="12" cy="12" r="6" />
          </svg>
        </MenuItemIndicator>
      </span>
      {props.children}
    </MenuRadioItem>
  );
}

type DropdownMenuSeparatorProps = ComponentProps<typeof MenuSeparator>;

function DropdownMenuSeparator(props: DropdownMenuSeparatorProps) {
  const rest = omit(props, "class");
  return (
    <MenuSeparator
      data-slot="dropdown-menu-separator"
      class={cn("-mx-1 my-1 h-px bg-border", props.class)}
      {...rest}
    />
  );
}

type DropdownMenuShortcutProps = JSX.HTMLAttributes<HTMLSpanElement>;

function DropdownMenuShortcut(props: DropdownMenuShortcutProps) {
  const rest = omit(props, "class");
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      class={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
        props.class,
      )}
      {...rest}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
