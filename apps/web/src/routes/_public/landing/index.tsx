import { createFileRoute, Link } from "@tanstack/solid-router";

import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";

export const Route = createFileRoute("/_public/landing/")({
  component: LandingPage,
});

function ArrowRightIcon(props: { class?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class={props.class}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ZapIcon(props: { class?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class={props.class}
    >
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

function LockIcon(props: { class?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class={props.class}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LandingPage() {
  return (
    <>
      <section class="container mx-auto px-4 py-20 md:py-32">
        <div class="mx-auto max-w-3xl text-center">
          <h1 class="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Build Your Projects with
            <br class="hidden md:inline" />
            <span class="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Modern Tools
            </span>
          </h1>
          <p class="text-muted-foreground mb-8 text-lg md:text-xl">
            A powerful platform for managing your personal projects. Built for developers who need
            efficiency and simplicity.
          </p>
          <div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/login" search={{ redirect: undefined }}>
              <Button size="lg" class="text-base">
                Sign Up Now
                <ArrowRightIcon class="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" class="text-base">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section class="container mx-auto px-4 py-16">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-3xl font-bold md:text-4xl">Powered for Growth</h2>
          <p class="text-muted-foreground text-lg">Everything you need to manage your projects</p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent class="flex flex-col items-start space-y-2 p-6">
              <div class="mb-4 rounded-lg bg-orange-100 p-3 dark:bg-orange-900">
                <ZapIcon class="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 class="text-xl font-semibold">Lightning Fast</h3>
              <p class="text-muted-foreground">
                Built on modern tech stack for optimal performance and instant response times
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="flex flex-col items-start space-y-2 p-6">
              <div class="mb-4 rounded-lg bg-red-100 p-3 dark:bg-red-900">
                <LockIcon class="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 class="text-xl font-semibold">Secure by Design</h3>
              <p class="text-muted-foreground">
                Enterprise-grade security with encrypted data and secure authentication
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section class="bg-muted/50">
        <div class="container mx-auto px-4 py-16 text-center">
          <h2 class="mb-4 text-3xl font-bold md:text-4xl">Ready to Get Started?</h2>
          <p class="text-muted-foreground mb-8 text-lg">
            Join thousands of users already using our platform
          </p>
          <Link to="/login" search={{ redirect: undefined }}>
            <Button size="lg" class="text-lg">
              Start Your Free Trial
              <ArrowRightIcon class="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
