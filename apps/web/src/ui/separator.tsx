import { Separator as SeparatorPrimitive } from "@ui-sdk/solid/separator";
import { omit, type ComponentProps } from "solid-js";
import { cn } from "@/lib/cn";

type SeparatorProps = ComponentProps<typeof SeparatorPrimitive>;

function Separator(props: SeparatorProps) {
  const rest = omit(props, "class", "orientation");
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={props.orientation ?? "horizontal"}
      class={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        props.class,
      )}
      {...rest}
    />
  );
}

export { Separator };
export type { SeparatorProps };
