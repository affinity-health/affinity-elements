import { isAffinityFrameMessage, type AffinityElementEvent } from "./messages.js";

export type { AffinityElementEvent } from "./messages.js";

export type AffinityAppearance = {
  theme?: "dark" | "light";
  variables?: {
    borderRadius?: string;
    colorBackground?: string;
    colorBorder?: string;
    colorDanger?: string;
    colorMutedText?: string;
    colorPrimary?: string;
    colorPrimaryText?: string;
    colorSuccess?: string;
    colorText?: string;
    fontFamily?: string;
  };
};

export type AffinityElementsOptions = {
  appearance?: AffinityAppearance;
  connectUrl?: string;
  fetchClientSecret: () => Promise<string>;
};

export type AffinityElementMountOptions = {
  onEvent?: (event: AffinityElementEvent) => void;
  onLoadError?: (error: Error) => void;
  onReady?: () => void;
};

export function initializeAffinity(options: AffinityElementsOptions) {
  const connectUrl = new URL(options.connectUrl ?? "https://connect.joinaffinityai.com");

  return {
    create(component: "prescription-composer") {
      return {
        mount(target: Element | string, mountOptions: AffinityElementMountOptions = {}) {
          const container = typeof target === "string" ? document.querySelector(target) : target;
          if (!container) throw new Error("Affinity Elements mount target was not found");

          const frame = document.createElement("iframe");
          frame.src = new URL(`/elements/${component}`, connectUrl).toString();
          frame.title = "Affinity prescription composer";
          frame.allow = "publickey-credentials-get; publickey-credentials-create";
          frame.referrerPolicy = "strict-origin";
          frame.sandbox.add(
            "allow-forms",
            "allow-popups",
            "allow-popups-to-escape-sandbox",
            "allow-same-origin",
            "allow-scripts",
          );
          frame.style.border = "0";
          frame.style.display = "block";
          frame.style.minHeight = "560px";
          frame.style.width = "100%";

          let destroyed = false;
          let initialized = false;
          const receiveMessage = async (browserEvent: MessageEvent<unknown>) => {
            if (
              destroyed ||
              browserEvent.origin !== connectUrl.origin ||
              browserEvent.source !== frame.contentWindow ||
              !isAffinityFrameMessage(browserEvent.data)
            ) {
              return;
            }
            if (browserEvent.data.type === "affinity.event") {
              mountOptions.onEvent?.(browserEvent.data.event);
              return;
            }
            if (browserEvent.data.type === "affinity.resize") {
              if (
                Number.isFinite(browserEvent.data.height) &&
                browserEvent.data.height >= 560 &&
                browserEvent.data.height <= 2_400
              ) {
                frame.style.height = `${Math.ceil(browserEvent.data.height)}px`;
              }
              return;
            }
            if (initialized) return;
            initialized = true;
            try {
              const clientSecret = await options.fetchClientSecret();
              frame.contentWindow?.postMessage(
                {
                  appearance: options.appearance,
                  clientSecret,
                  parentOrigin: window.location.origin,
                  source: "affinity-platform",
                  type: "affinity.initialize",
                },
                connectUrl.origin,
              );
              mountOptions.onReady?.();
            } catch (error) {
              initialized = false;
              mountOptions.onLoadError?.(
                error instanceof Error
                  ? error
                  : new Error("The secure Affinity session could not be created."),
              );
              frame.contentWindow?.postMessage(
                {
                  message: "The secure Affinity session could not be created.",
                  source: "affinity-platform",
                  type: "affinity.initialize_error",
                },
                connectUrl.origin,
              );
            }
          };

          window.addEventListener("message", receiveMessage);
          container.replaceChildren(frame);
          return {
            destroy() {
              destroyed = true;
              window.removeEventListener("message", receiveMessage);
              frame.remove();
            },
          };
        },
      };
    },
  };
}
