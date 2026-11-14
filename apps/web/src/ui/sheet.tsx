import {
  Drawer,
  DrawerBackdrop,
  DrawerClose as DrawerClosePrimitive,
  DrawerContent as DrawerContentPrimitive,
  DrawerDescription as DrawerDescriptionPrimitive,
  DrawerTitle as DrawerTitlePrimitive,
  DrawerTrigger as DrawerTriggerPrimitive,
} from "@ui-sdk/solid/drawer";
import {
  createContext,
  createEffect,
  createSignal,
  omit,
  useContext,
  type ComponentProps,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { cn } from "@/lib/cn";

type SheetSide = "top" | "right" | "bottom" | "left";

type SheetSideCtx = {
  side: () => SheetSide;
  setSide: (side: SheetSide) => void;
};

const SheetSideContext = createContext<SheetSideCtx | null>(null);

type SheetProps = ComponentProps<typeof Drawer> & { side?: SheetSide };

function Sheet(props: SheetProps) {
  const rest = omit(props, "side");
  const [side, setSide] = createSignal<SheetSide>(props.side ?? "right");
  return (
    <SheetSideContext value={{ side, setSide }}>
      <Drawer data-slot="sheet" side={side()} {...rest} />
    </SheetSideContext>
  );
}

type SheetTriggerProps = ComponentProps<typeof DrawerTriggerPrimitive>;

function SheetTrigger(props: SheetTriggerProps) {
  return <DrawerTriggerPrimitive data-slot="sheet-trigger" {...props} />;
}

type SheetCloseProps = ComponentProps<typeof DrawerClosePrimitive>;

function SheetClose(props: SheetCloseProps) {
  return <DrawerClosePrimitive data-slot="sheet-close" {...props} />;
}

type SheetOverlayProps = ComponentProps<typeof DrawerBackdrop>;

function SheetOverlay(props: SheetOverlayProps) {
  const rest = omit(props, "class");
  return (
    <DrawerBackdrop
      data-slot="sheet-overlay"
      class={cn(
        "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        props.class,
      )}
      {...rest}
    />
  );
}

const sideClasses: Record<SheetSide, string> = {
  top: "inset-x-0 top-0 h-auto border-b data-ending-style:translate-y-[-2.5rem] data-starting-style:translate-y-[-2.5rem]",
  bottom:
    "inset-x-0 bottom-0 h-auto border-t data-ending-style:translate-y-[2.5rem] data-starting-style:translate-y-[2.5rem]",
  left: "inset-y-0 left-0 h-full w-3/4 border-r data-ending-style:translate-x-[-2.5rem] data-starting-style:translate-x-[-2.5rem] sm:max-w-sm",
  right:
    "inset-y-0 right-0 h-full w-3/4 border-l data-ending-style:translate-x-[2.5rem] data-starting-style:translate-x-[2.5rem] sm:max-w-sm",
};

type SheetContentProps = ComponentProps<typeof DrawerContentPrimitive> & {
  side?: SheetSide;
  showCloseButton?: boolean;
};

function SheetContent(props: SheetContentProps) {
  const rest = omit(props, "class", "side", "children", "showCloseButton");
  const ctx = useContext(SheetSideContext);
  const resolvedSide = () => props.side ?? ctx?.side() ?? "right";

  createEffect(
    () => props.side,
    (next) => {
      if (next && ctx) ctx.setSide(next);
    },
  );

  return (
    <>
      <SheetOverlay />
      <DrawerContentPrimitive
        data-slot="sheet-content"
        data-side={resolvedSide()}
        class={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0",
          sideClasses[resolvedSide()],
          props.class,
        )}
        {...rest}
      >
        {props.children}
        {props.showCloseButton !== false && (
          <DrawerClosePrimitive
            data-slot="sheet-close"
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
          </DrawerClosePrimitive>
        )}
      </DrawerContentPrimitive>
    </>
  );
}

type DivProps = JSX.HTMLAttributes<HTMLDivElement>;

function SheetHeader(props: DivProps) {
  const rest = omit(props, "class");
  return (
    <div
      data-slot="sheet-header"
      class={cn("flex flex-col gap-1.5 p-4", props.class)}
      {...rest}
    />
  );
}

function SheetFooter(props: DivProps) {
  const rest = omit(props, "class");
  return (
    <div
      data-slot="sheet-footer"
      class={cn("mt-auto flex flex-col gap-2 p-4", props.class)}
      {...rest}
    />
  );
}

type SheetTitleProps = ComponentProps<typeof DrawerTitlePrimitive>;

function SheetTitle(props: SheetTitleProps) {
  const rest = omit(props, "class");
  return (
    <DrawerTitlePrimitive
      data-slot="sheet-title"
      class={cn("font-heading font-medium text-foreground", props.class)}
      {...rest}
    />
  );
}

type SheetDescriptionProps = ComponentProps<typeof DrawerDescriptionPrimitive>;

function SheetDescription(props: SheetDescriptionProps) {
  const rest = omit(props, "class");
  return (
    <DrawerDescriptionPrimitive
      data-slot="sheet-description"
      class={cn("text-sm text-muted-foreground", props.class)}
      {...rest}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
