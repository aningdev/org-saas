import { useQuery } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { Loading } from "solid-js";

import { client } from "@/utils/orpc";

export const Route = createFileRoute("/_public/")({
  component: HomeComponent,
});

const TITLE_TEXT = `
 ██████╗ ███████╗████████╗████████╗███████╗██████╗
 ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
 ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
 ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

 ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
    ██║       ███████╗   ██║   ███████║██║     █████╔╝
    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 `;

function HomeComponent() {
  const healthCheck = useQuery(() => ({
    queryKey: ["healthCheck"] as const,
    queryFn: () => client.healthCheck(),
  }));

  return (
    <div class="container mx-auto max-w-3xl px-4 py-2">
      <pre class="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
      <div class="grid gap-6">
        <section class="border-border rounded-lg border p-4">
          <h2 class="mb-2 font-medium">API Status</h2>
          <Loading
            fallback={
              <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full bg-red-500" />
                <span class="text-muted-foreground text-sm">Checking...</span>
              </div>
            }
          >
            <div class="flex items-center gap-2">
              <div
                class={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
              />
              <span class="text-muted-foreground text-sm">
                {healthCheck.data ? "Connected" : "Disconnected"}
              </span>
            </div>
          </Loading>
        </section>
      </div>
    </div>
  );
}
