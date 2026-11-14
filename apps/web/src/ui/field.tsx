import type { JSX } from "@solidjs/web";
import { cva, type VariantProps } from "class-variance-authority";
import { For, Show, omit, type ComponentProps } from "solid-js";

import { cn } from "@/lib/cn";
import { Label } from "@/ui/label";

type DivProps = JSX.HTMLAttributes<HTMLDivElement>;
type FieldsetProps = JSX.FieldsetHTMLAttributes<HTMLFieldSetElement>;
type LegendProps = JSX.HTMLAttributes<HTMLLegendElement>;
type FieldLabelProps = ComponentProps<typeof Label>;

function FieldGroup(props: DivProps) {
  const rest = omit(props, "class");
  return (
    <div
      data-slot="field-group"
      class={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        props.class,
      )}
      {...rest}
    />
  );
}

const fieldVariants = cva("group/field flex w-full gap-3 data-[invalid=true]:text-destructive", {
  variants: {
    orientation: {
      vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
      horizontal:
        "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto",
      responsive:
        "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

function Field(props: DivProps & VariantProps<typeof fieldVariants>) {
  const rest = omit(props, "class", "orientation");
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={props.orientation ?? "vertical"}
      class={cn(fieldVariants({ orientation: props.orientation }), props.class)}
      {...rest}
    />
  );
}

function FieldLabel(props: FieldLabelProps) {
  const rest = omit(props, "class");
  return (
    <Label
      data-slot="field-label"
      class={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
        props.class,
      )}
      {...rest}
    />
  );
}

type FieldErrorProps = DivProps & {
  errors?: Array<{ message?: string } | undefined>;
};

function FieldError(props: FieldErrorProps) {
  const rest = omit(props, "class", "children", "errors");

  const content = () => {
    if (props.children) return props.children;
    const errors = (props.errors ?? []).filter((e): e is { message?: string } => e != null);
    if (!errors.length) return null;
    const unique = [...new Map(errors.map((e) => [e.message, e] as const)).values()];
    if (unique.length === 1) return unique[0]?.message;
    return (
      <ul class="ml-4 flex list-disc flex-col gap-1">
        <For each={unique}>
          {(error) => <Show when={error.message}>{(msg) => <li>{msg()}</li>}</Show>}
        </For>
      </ul>
    );
  };

  return (
    <Show when={content()}>
      {(node) => (
        <div
          role="alert"
          data-slot="field-error"
          class={cn("text-sm font-normal text-destructive", props.class)}
          {...rest}
        >
          {node()}
        </div>
      )}
    </Show>
  );
}

function FieldDescription(props: DivProps) {
  const rest = omit(props, "class");
  return (
    <p
      data-slot="field-description"
      class={cn("text-sm text-muted-foreground", props.class)}
      {...rest}
    />
  );
}

function FieldSet(props: FieldsetProps) {
  const rest = omit(props, "class");
  return (
    <fieldset data-slot="field-set" class={cn("flex flex-col gap-4", props.class)} {...rest} />
  );
}

function FieldLegend(props: LegendProps & { variant?: "legend" | "label" }) {
  const rest = omit(props, "class", "variant");
  return (
    <legend
      data-slot="field-legend"
      data-variant={props.variant ?? "legend"}
      class={cn("font-medium data-[variant=label]:text-sm", props.class)}
      {...rest}
    />
  );
}

export {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldDescription,
  FieldSet,
  FieldLegend,
  fieldVariants,
};
