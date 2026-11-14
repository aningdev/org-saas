import { Badge } from "@/ui/badge";

const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> =
  {
    owner: { label: "Owner", variant: "default" },
    admin: { label: "Admin", variant: "secondary" },
    member: { label: "Member", variant: "outline" },
  };

export function RoleBadge(props: { role: string }) {
  const config = () =>
    roleConfig[props.role] ?? {
      label: props.role,
      variant: "outline" as const,
    };
  return <Badge variant={config().variant}>{config().label}</Badge>;
}
