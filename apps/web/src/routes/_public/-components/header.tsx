import { Link } from "@tanstack/solid-router";
import { For } from "solid-js";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/ui/sheet";

import { UserMenu } from "./user-menu";

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/pricing", label: "Pricing" },
    { to: "/about", label: "About" },
  ] as const;

  return (
    <header class="border-border bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div class="container flex h-14 items-center justify-between px-4">
        {/* Desktop Navigation */}
        <div class="hidden items-center gap-6 md:flex">
          <Link to="/" class="mr-6 flex items-center space-x-2">
            <span class="hidden font-bold sm:inline-block">ORG SAAS</span>
          </Link>
          <nav class="flex items-center space-x-6 text-sm font-medium">
            <For each={links}>
              {(link) => (
                <Link
                  to={link.to}
                  class="text-foreground/60 hover:text-foreground/80 transition-colors"
                  activeProps={{ class: "text-foreground" }}
                >
                  {link.label}
                </Link>
              )}
            </For>
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div class="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger class="hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-0 py-2 text-base font-medium whitespace-nowrap transition-colors hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                class="h-6 w-6"
              >
                <path d="M4 5h16" />
                <path d="M4 12h16" />
                <path d="M4 19h16" />
              </svg>
              <span class="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="left" class="pr-0">
              <SheetHeader class="px-1">
                <SheetTitle class="text-left">
                  <Link to="/" class="flex items-center">
                    <span class="font-bold">ORG SAAS</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div class="mt-4 flex flex-col space-y-3 px-1">
                <For each={links}>
                  {(link) => (
                    <Link
                      to={link.to}
                      class="text-muted-foreground hover:text-foreground transition-colors"
                      activeProps={{ class: "text-foreground font-medium" }}
                    >
                      {link.label}
                    </Link>
                  )}
                </For>
              </div>
            </SheetContent>
          </Sheet>
          <span class="ml-4 font-bold md:hidden">ORG SAAS</span>
        </div>

        <div class="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
