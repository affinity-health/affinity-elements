export type AffinityElementEvent =
  | { prescriptionId: string; type: "prescription.draft_created" }
  | { prescriptionId: string; type: "prescription.signed" }
  | {
      orderId: string;
      prescriptionId: string;
      runId: string;
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
  if (value.type === "prescription.draft_created" || value.type === "prescription.signed") {
    return isIdentifier(value.prescriptionId);
  }
  if (value.type === "order.submitted") {
    return (
      isIdentifier(value.orderId) && isIdentifier(value.prescriptionId) && isIdentifier(value.runId)
    );
  }
  return false;
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
