import { createFileRoute, Outlet } from "@tanstack/solid-router";

import Footer from "./-components/footer";
import Header from "./-components/header";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <div class="flex min-h-screen flex-col">
      <Header />
      <main class="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
