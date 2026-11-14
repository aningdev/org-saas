import {
  Checkbox as CheckboxPrimitive,
  CheckboxIndicator,
} from "@ui-sdk/solid/checkbox";
import { omit, type ComponentProps } from "solid-js";
import { cn } from "@/lib/cn";

type CheckboxProps = ComponentProps<typeof CheckboxPrimitive>;

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class="size-3.5"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Checkbox(props: CheckboxProps) {
  const rest = omit(props, "class", "children");
  return (
    <CheckboxPrimitive
      data-slot="checkbox"
      class={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input shadow-xs transition-shadow outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        props.class,
      )}
      {...rest}
    >
      {props.children ?? (
        <CheckboxIndicator
          data-slot="checkbox-indicator"
          class="grid place-content-center text-current transition-none"
        >
          <CheckIcon />
        </CheckboxIndicator>
      )}
    </CheckboxPrimitive>
  );
}

export { Checkbox, CheckboxIndicator };
export type { CheckboxProps };
