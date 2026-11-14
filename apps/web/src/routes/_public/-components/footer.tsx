import { Link } from "@tanstack/solid-router";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer class="border-border bg-background border-t">
      <div class="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row md:py-8">
        <div class="text-muted-foreground text-center text-sm md:text-left">
          © {currentYear} Org SaaS. All rights reserved.
        </div>
        <nav class="text-muted-foreground flex gap-4 text-sm font-medium">
          <Link to="/" class="hover:text-foreground transition-colors hover:underline">
            Home
          </Link>
          <Link to="/pricing" class="hover:text-foreground transition-colors hover:underline">
            Pricing
          </Link>
          <Link to="/about" class="hover:text-foreground transition-colors hover:underline">
            About
          </Link>
        </nav>
      </div>
    </footer>
  );
}
