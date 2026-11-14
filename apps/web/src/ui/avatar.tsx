import {
  Avatar as AvatarPrimitive,
  AvatarFallback as AvatarFallbackPrimitive,
  AvatarImage as AvatarImagePrimitive,
} from "@ui-sdk/solid/avatar";
import { omit, type ComponentProps } from "solid-js";

import { cn } from "@/lib/cn";

type AvatarProps = ComponentProps<typeof AvatarPrimitive> & {
  size?: "default" | "sm" | "lg";
};

function Avatar(props: AvatarProps) {
  const rest = omit(props, "class", "size");
  return (
    <AvatarPrimitive
      data-slot="avatar"
      data-size={props.size ?? "default"}
      class={cn(
        "group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
        props.class,
      )}
      {...rest}
    />
  );
}

type AvatarImageProps = ComponentProps<typeof AvatarImagePrimitive>;

function AvatarImage(props: AvatarImageProps) {
  const rest = omit(props, "class");
  return (
    <AvatarImagePrimitive
      data-slot="avatar-image"
      class={cn("aspect-square size-full rounded-full object-cover", props.class)}
      {...rest}
    />
  );
}

type AvatarFallbackProps = ComponentProps<typeof AvatarFallbackPrimitive>;

function AvatarFallback(props: AvatarFallbackProps) {
  const rest = omit(props, "class");
  return (
    <AvatarFallbackPrimitive
      data-slot="avatar-fallback"
      class={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs",
        props.class,
      )}
      {...rest}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps };
