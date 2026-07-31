import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";

import {
  initializeAffinity,
  type AffinityElementEvent,
  type AffinityElementsOptions,
} from "./index.js";

const AffinityContext = createContext<ReturnType<typeof initializeAffinity> | null>(null);

export function AffinityProvider({
  appearance,
  children,
  connectUrl,
  fetchClientSecret,
}: Readonly<AffinityElementsOptions & { children: ReactNode }>) {
  const affinity = useMemo(
    () =>
      initializeAffinity({
        ...(appearance ? { appearance } : {}),
        ...(connectUrl ? { connectUrl } : {}),
        fetchClientSecret,
      }),
    [appearance, connectUrl, fetchClientSecret],
  );
  return <AffinityContext.Provider value={affinity}>{children}</AffinityContext.Provider>;
}

export function PrescriptionComposer({
  className,
  onDraftCreated,
  onLoadError,
  onOrderSubmitted,
  onPrescriptionSigned,
  onReady,
}: Readonly<{
  className?: string;
  onDraftCreated?: (event: { prescriptionId: string }) => void;
  onLoadError?: (error: Error) => void;
  onOrderSubmitted?: (event: { orderId: string; prescriptionId: string; runId: string }) => void;
  onPrescriptionSigned?: (event: { prescriptionId: string }) => void;
  onReady?: () => void;
}>) {
  const affinity = useContext(AffinityContext);
  const container = useRef<HTMLDivElement>(null);
  const callbacks = useRef({
    onDraftCreated,
    onLoadError,
    onOrderSubmitted,
    onPrescriptionSigned,
    onReady,
  });
  callbacks.current = {
    onDraftCreated,
    onLoadError,
    onOrderSubmitted,
    onPrescriptionSigned,
    onReady,
  };

  useEffect(() => {
    if (!affinity || !container.current) return;
    const mounted = affinity.create("prescription-composer").mount(container.current, {
      onLoadError: (error) => callbacks.current.onLoadError?.(error),
      onReady: () => callbacks.current.onReady?.(),
      onEvent: (event: AffinityElementEvent) => {
        if (event.type === "prescription.draft_created") {
          callbacks.current.onDraftCreated?.({ prescriptionId: event.prescriptionId });
        }
        if (event.type === "prescription.signed") {
          callbacks.current.onPrescriptionSigned?.({ prescriptionId: event.prescriptionId });
        }
        if (event.type === "order.submitted") {
          callbacks.current.onOrderSubmitted?.({
            orderId: event.orderId,
            prescriptionId: event.prescriptionId,
            runId: event.runId,
          });
        }
      },
    });
    return () => mounted.destroy();
  }, [affinity]);

  return <div className={className} ref={container} />;
}
