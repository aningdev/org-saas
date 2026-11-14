import { describe, expect, it, vi } from "vite-plus/test";

vi.mock("../../apps/web/src/ui/toast", () => ({
  toast: { add: vi.fn<(feedback: unknown) => string>(() => "test-toast") },
}));

const { createQueryClient } = await import("../../apps/web/src/utils/query-client");

describe("QueryClient SSR hydration", () => {
  it("round-trips Date values through dehydrate/hydrate serializers", () => {
    const queryClient = createQueryClient();
    const serialize = queryClient.getDefaultOptions().dehydrate?.serializeData;
    const deserialize = queryClient.getDefaultOptions().hydrate?.deserializeData;

    expect(serialize).toEqual(expect.any(Function));
    expect(deserialize).toEqual(expect.any(Function));

    const payload = { at: new Date("2026-01-02T03:04:05.000Z"), label: "ok" };
    const restored = deserialize!(serialize!(payload)) as typeof payload;

    expect(restored.label).toBe("ok");
    expect(restored.at).toBeInstanceOf(Date);
    expect(restored.at.toISOString()).toBe("2026-01-02T03:04:05.000Z");
  });
});
