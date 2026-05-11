import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchJson } from "./http.js";

describe("fetchJson", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON for successful responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true })
    } as Response);

    await expect(fetchJson(new URL("https://example.com/data"))).resolves.toEqual({ ok: true });
  });

  it("throws an error containing host and HTTP status for failed responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 503
    } as Response);

    await expect(fetchJson(new URL("https://example.com/data"))).rejects.toThrow(
      "example.com: HTTP 503"
    );
  });
});
