import { describe, expect, test, vi } from "vitest";

import { initializeAffinity } from "./index.js";

describe("initializeAffinity", () => {
  test("does not request a secret before mount", () => {
    const fetchClientSecret = vi.fn(async () => "aff_cs_test");
    const affinity = initializeAffinity({ fetchClientSecret });

    expect(affinity.create("prescription-composer")).toBeDefined();
    expect(fetchClientSecret).not.toHaveBeenCalled();
  });

  test("rejects an invalid Connect URL", () => {
    expect(() =>
      initializeAffinity({
        connectUrl: "not a URL",
        fetchClientSecret: async () => "aff_cs_test",
      }),
    ).toThrow();
  });
});
