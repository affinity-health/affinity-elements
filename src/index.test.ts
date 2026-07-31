import { afterEach, describe, expect, test, vi } from "vitest";

import { initializeAffinity } from "./index.js";

describe("initializeAffinity", () => {
  afterEach(() => vi.unstubAllGlobals());

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

  test("initializes only for the configured Connect origin and mounted frame", async () => {
    const fetchClientSecret = vi.fn(async () => "aff_cs_test");
    const harness = mountHarness(fetchClientSecret);

    await harness.receive({
      data: { source: "affinity", type: "affinity.ready" },
      origin: "https://wrong.example",
      source: harness.frameWindow,
    });
    await harness.receive({
      data: { source: "affinity", type: "affinity.ready" },
      origin: "https://connect.joinaffinityai.com",
      source: {},
    });
    expect(fetchClientSecret).not.toHaveBeenCalled();

    await harness.receive({
      data: { source: "affinity", type: "affinity.ready" },
      origin: "https://connect.joinaffinityai.com",
      source: harness.frameWindow,
    });
    await harness.receive({
      data: { source: "affinity", type: "affinity.ready" },
      origin: "https://connect.joinaffinityai.com",
      source: harness.frameWindow,
    });

    expect(fetchClientSecret).toHaveBeenCalledTimes(1);
    expect(harness.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        clientSecret: "aff_cs_test",
        parentOrigin: "https://platform.example",
        source: "affinity-platform",
        type: "affinity.initialize",
      }),
      "https://connect.joinaffinityai.com",
    );
  });

  test("forwards only validated current events", async () => {
    const onEvent = vi.fn();
    const harness = mountHarness(async () => "aff_cs_test", onEvent);

    await harness.receive({
      data: {
        event: { prescriptionId: "rx_test", type: "prescription.signed" },
        source: "affinity",
        type: "affinity.event",
      },
      origin: "https://connect.joinaffinityai.com",
      source: harness.frameWindow,
    });
    await harness.receive({
      data: {
        event: { prescriptionId: "rx_test", status: "submitted", type: "prescription.submitted" },
        source: "affinity",
        type: "affinity.event",
      },
      origin: "https://connect.joinaffinityai.com",
      source: harness.frameWindow,
    });

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith({
      prescriptionId: "rx_test",
      type: "prescription.signed",
    });
  });
});

function mountHarness(
  fetchClientSecret: () => Promise<string>,
  onEvent: (event: unknown) => void = () => undefined,
) {
  let receiveMessage: ((event: MessageEvent<unknown>) => Promise<void>) | undefined;
  const postMessage = vi.fn();
  const frameWindow = { postMessage };
  const frame = {
    allow: "",
    contentWindow: frameWindow,
    referrerPolicy: "",
    remove: vi.fn(),
    sandbox: { add: vi.fn() },
    src: "",
    style: {} as Record<string, string>,
    title: "",
  };
  const container = { replaceChildren: vi.fn() };
  vi.stubGlobal("document", {
    createElement: vi.fn(() => frame),
    querySelector: vi.fn(() => container),
  });
  vi.stubGlobal("window", {
    addEventListener: vi.fn((type: string, listener: typeof receiveMessage) => {
      if (type === "message") receiveMessage = listener;
    }),
    location: { origin: "https://platform.example" },
    removeEventListener: vi.fn(),
  });

  initializeAffinity({ fetchClientSecret })
    .create("prescription-composer")
    .mount(container as unknown as Element, { onEvent });
  if (!receiveMessage) throw new Error("Message listener was not registered");

  return {
    frameWindow,
    postMessage,
    receive: (event: { data: unknown; origin: string; source: unknown }) =>
      receiveMessage?.(event as MessageEvent<unknown>) ?? Promise.resolve(),
  };
}
