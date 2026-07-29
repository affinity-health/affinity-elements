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
  onClose,
  onDraftCreated,
  onLoadError,
  onReady,
  onSubmitted,
}: Readonly<{
  className?: string;
  onClose?: () => void;
  onDraftCreated?: (event: { prescriptionId: string }) => void;
  onLoadError?: (error: Error) => void;
  onReady?: () => void;
  onSubmitted?: (event: { prescriptionId: string; status: string }) => void;
}>) {
  const affinity = useContext(AffinityContext);
  const container = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onClose, onDraftCreated, onLoadError, onReady, onSubmitted });
  callbacks.current = { onClose, onDraftCreated, onLoadError, onReady, onSubmitted };

  useEffect(() => {
    if (!affinity || !container.current) return;
    const mounted = affinity.create("prescription-composer").mount(container.current, {
      onLoadError: (error) => callbacks.current.onLoadError?.(error),
      onReady: () => callbacks.current.onReady?.(),
      onEvent: (event: AffinityElementEvent) => {
        if (event.type === "component.close") callbacks.current.onClose?.();
        if (event.type === "prescription.draft_created") {
          callbacks.current.onDraftCreated?.({ prescriptionId: event.prescriptionId });
        }
        if (event.type === "prescription.submitted") {
          callbacks.current.onSubmitted?.({
            prescriptionId: event.prescriptionId,
            status: event.status,
          });
        }
      },
    });
    return () => mounted.destroy();
  }, [affinity]);

  return <div className={className} ref={container} />;
}
