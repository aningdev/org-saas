import { createFileRoute, Link } from "@tanstack/solid-router";
import { For } from "solid-js";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";

export const Route = createFileRoute("/_public/about/")({
  head: () => ({
    meta: [
      { title: "About | Org SaaS" },
      {
        name: "description",
        content:
          "Learn how Org SaaS organizes organization membership, roles, teams, and audit history.",
      },
    ],
  }),
  component: AboutPage,
});

const capabilities = [
  {
    title: "Membership and roles",
    description:
      "Invite members and manage organization access with owner, admin, member, and custom roles.",
    details: [
      "Manage organization members and invitations",
      "Use owner, admin, and member roles",
      "Create custom roles within granted permissions",
    ],
  },
  {
    title: "Team collaboration",
    description: "Organize members into teams while keeping access scoped to each organization.",
    details: [
      "Create and update teams",
      "Manage team membership",
      "Teams do not grant permissions by themselves",
    ],
  },
  {
    title: "Audit history",
    description:
      "Review organization activity with permission-aware access and a 180-day retention policy.",
    details: [
      "Review organization audit events",
      "Access follows organization audit permissions",
      "Audit records follow a 180-day retention policy",
    ],
  },
];

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
      class="text-primary mt-0.5 size-4 shrink-0"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function AboutPage() {
  return (
    <section class="container mx-auto px-4 py-20">
      <div class="mx-auto max-w-5xl">
        <header class="mx-auto mb-12 max-w-3xl text-center">
          <Badge variant="secondary" class="mb-4">
            Org SaaS
          </Badge>
          <h1 class="mb-4 text-4xl font-bold md:text-5xl">
            Organization workspaces with clear access
          </h1>
          <p class="text-muted-foreground text-lg">
            Org SaaS helps organizations manage members, roles, teams, and activity from one shared
            workspace.
          </p>
        </header>

        <div class="grid gap-6 md:grid-cols-3">
          <For each={capabilities}>
            {(capability) => (
              <Card class="h-full">
                <CardHeader>
                  <CardTitle>{capability.title}</CardTitle>
                  <CardDescription>{capability.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul class="flex flex-col gap-3 text-sm">
                    <For each={capability.details}>
                      {(detail) => (
                        <li class="flex items-start gap-2">
                          <CheckIcon />
                          <span>{detail}</span>
                        </li>
                      )}
                    </For>
                  </ul>
                </CardContent>
              </Card>
            )}
          </For>
        </div>

        <div class="bg-muted/30 mt-12 rounded-xl border p-8 text-center">
          <h2 class="mb-3 text-2xl font-semibold">Explore Org SaaS</h2>
          <p class="text-muted-foreground mx-auto mb-6 max-w-2xl">
            Create an account to explore the organization workspace. Pricing and plan limits have
            not been set.
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <Link to="/login" search={{ redirect: undefined }}>
              <Button size="lg">Get started</Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline">
                View pricing status
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
