export type AffinityElementEvent =
  | { orderId: string; prescriptionIds: string[]; type: "order.draft_created" }
  | { orderId: string; prescriptionIds: string[]; type: "order.signed" }
  | {
      fulfillmentIds: string[];
      orderId: string;
      type: "order.submitted";
    };

export type AffinityFrameMessage =
  | { source: "affinity"; type: "affinity.ready" }
  | { height: number; source: "affinity"; type: "affinity.resize" }
  | { event: AffinityElementEvent; source: "affinity"; type: "affinity.event" };

export function isAffinityFrameMessage(value: unknown): value is AffinityFrameMessage {
  if (!isRecord(value) || value.source !== "affinity") return false;
  if (value.type === "affinity.ready") return true;
  if (value.type === "affinity.resize") {
    return typeof value.height === "number" && Number.isFinite(value.height);
  }
  return value.type === "affinity.event" && isAffinityElementEvent(value.event);
}

function isAffinityElementEvent(value: unknown): value is AffinityElementEvent {
  if (!isRecord(value) || typeof value.type !== "string") return false;
  if (value.type === "order.draft_created" || value.type === "order.signed") {
    return isIdentifier(value.orderId) && isIdentifierArray(value.prescriptionIds);
  }
  if (value.type === "order.submitted") {
    return isIdentifier(value.orderId) && isIdentifierArray(value.fulfillmentIds);
  }
  return false;
}

function isIdentifierArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every(isIdentifier);
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
