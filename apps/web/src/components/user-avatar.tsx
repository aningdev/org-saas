import { Show, omit } from "solid-js";

import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";

export function UserAvatar(props: {
  name: string;
  image?: string | null;
  size?: "default" | "sm" | "lg";
  class?: string;
}) {
  const rest = omit(props, "name", "image", "size", "class");
  const initials = () =>
    props.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <Avatar size={props.size ?? "default"} class={props.class} {...rest}>
      <Show when={props.image}>{(src) => <AvatarImage src={src()} alt={props.name} />}</Show>
      <AvatarFallback>{initials()}</AvatarFallback>
    </Avatar>
  );
}
