import { createFileRoute, Link } from "@tanstack/solid-router";
import { For } from "solid-js";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";

export const Route = createFileRoute("/_public/pricing/")({
  head: () => ({
    meta: [
      { title: "Pricing | Org SaaS" },
      {
        name: "description",
        content:
          "Pricing and plan limits have not been set. Explore the organization tools available today.",
      },
    ],
  }),
  component: PricingPage,
});

const capabilities = [
  {
    title: "Membership and roles",
    description: "Manage organization access with clear membership and role controls.",
    details: [
      "Invite and manage organization members",
      "Use owner, admin, and member roles",
      "Create custom roles within granted permissions",
    ],
  },
  {
    title: "Team collaboration",
    description: "Group organization members into teams and manage team membership.",
    details: [
      "Create and update teams",
      "Manage team membership",
      "Keep teams within their organization workspace",
    ],
  },
  {
    title: "Audit history",
    description: "Review organization activity and understand important changes.",
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

function PricingPage() {
  return (
    <section class="container mx-auto px-4 py-20">
      <div class="mx-auto max-w-5xl">
        <header class="mx-auto mb-12 max-w-2xl text-center">
          <Badge variant="secondary" class="mb-4">
            Pricing status
          </Badge>
          <h1 class="mb-4 text-4xl font-bold md:text-5xl">Pricing and plans are not set yet</h1>
          <p class="text-muted-foreground text-lg">
            Explore the organization tools available today. Prices and plan limits have not been
            set.
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
            Prices, usage limits, billing terms, and support commitments have not been set. Create
            an account to explore the organization workspace.
          </p>
          <Link to="/login" search={{ redirect: undefined }}>
            <Button size="lg">Get started</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
