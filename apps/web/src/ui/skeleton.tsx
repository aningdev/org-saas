import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { cn } from "@/lib/cn";

type SkeletonProps = JSX.HTMLAttributes<HTMLDivElement>;

function Skeleton(props: SkeletonProps) {
  const rest = omit(props, "class");
  return (
    <div
      data-slot="skeleton"
      class={cn("animate-pulse rounded-md bg-muted", props.class)}
      {...rest}
    />
  );
}

export { Skeleton };
export type { SkeletonProps };
