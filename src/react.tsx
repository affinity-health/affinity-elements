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
  onLoadError,
  onOrderDraftCreated,
  onOrderSigned,
  onOrderSubmitted,
  onReady,
}: Readonly<{
  className?: string;
  onLoadError?: (error: Error) => void;
  onOrderDraftCreated?: (event: { orderId: string; prescriptionIds: string[] }) => void;
  onOrderSigned?: (event: { orderId: string; prescriptionIds: string[] }) => void;
  onOrderSubmitted?: (event: { fulfillmentIds: string[]; orderId: string }) => void;
  onReady?: () => void;
}>) {
  const affinity = useContext(AffinityContext);
  const container = useRef<HTMLDivElement>(null);
  const callbacks = useRef({
    onLoadError,
    onOrderDraftCreated,
    onOrderSigned,
    onOrderSubmitted,
    onReady,
  });
  callbacks.current = {
    onLoadError,
    onOrderDraftCreated,
    onOrderSigned,
    onOrderSubmitted,
    onReady,
  };

  useEffect(() => {
    if (!affinity || !container.current) return;
    const mounted = affinity.create("prescription-composer").mount(container.current, {
      onLoadError: (error) => callbacks.current.onLoadError?.(error),
      onReady: () => callbacks.current.onReady?.(),
      onEvent: (event: AffinityElementEvent) => {
        if (event.type === "order.draft_created") {
          callbacks.current.onOrderDraftCreated?.({
            orderId: event.orderId,
            prescriptionIds: event.prescriptionIds,
          });
        }
        if (event.type === "order.signed") {
          callbacks.current.onOrderSigned?.({
            orderId: event.orderId,
            prescriptionIds: event.prescriptionIds,
          });
        }
        if (event.type === "order.submitted") {
          callbacks.current.onOrderSubmitted?.({
            fulfillmentIds: event.fulfillmentIds,
            orderId: event.orderId,
          });
        }
      },
    });
    return () => mounted.destroy();
  }, [affinity]);

  return <div className={className} ref={container} />;
}
