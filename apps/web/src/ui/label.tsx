import { Label as LabelPrimitive } from "@ui-sdk/solid/label";
import { omit, type ComponentProps } from "solid-js";

import { cn } from "@/lib/cn";

type LabelProps = ComponentProps<typeof LabelPrimitive>;

function Label(props: LabelProps) {
  const rest = omit(props, "class");
  return (
    <LabelPrimitive
      data-slot="label"
      class={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        props.class,
      )}
      {...rest}
    />
  );
}

export { Label };
export type { LabelProps };
