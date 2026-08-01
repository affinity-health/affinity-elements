import { describe, expect, test } from "vitest";

import { isAffinityFrameMessage } from "./messages.js";

describe("Affinity frame messages", () => {
  test.each([
    { source: "affinity", type: "affinity.ready" },
    { height: 720, source: "affinity", type: "affinity.resize" },
    {
      event: {
        orderId: "ord_test",
        prescriptionIds: ["rx_one", "rx_two"],
        type: "order.draft_created",
      },
      source: "affinity",
      type: "affinity.event",
    },
    {
      event: {
        orderId: "ord_test",
        prescriptionIds: ["rx_one", "rx_two"],
        type: "order.signed",
      },
      source: "affinity",
      type: "affinity.event",
    },
    {
      event: {
        orderId: "ord_test",
        fulfillmentIds: ["ord_fulfillment_one", "ord_fulfillment_two"],
        type: "order.submitted",
      },
      source: "affinity",
      type: "affinity.event",
    },
  ])("accepts a current message", (message) => {
    expect(isAffinityFrameMessage(message)).toBe(true);
  });

  test.each([
    null,
    { source: "other", type: "affinity.ready" },
    { height: Number.NaN, source: "affinity", type: "affinity.resize" },
    { event: {}, source: "affinity", type: "affinity.event" },
    {
      event: { prescriptionId: "rx_test", status: "submitted", type: "prescription.submitted" },
      source: "affinity",
      type: "affinity.event",
    },
    {
      event: { type: "component.close" },
      source: "affinity",
      type: "affinity.event",
    },
    {
      event: { orderId: "ord_test", type: "order.submitted" },
      source: "affinity",
      type: "affinity.event",
    },
  ])("rejects a malformed or obsolete message", (message) => {
    expect(isAffinityFrameMessage(message)).toBe(false);
  });
});
