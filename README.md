# Affinity Elements

Affinity Elements renders secure Affinity clinical workflows inside a platform application.

The platform authenticates its user. The platform backend creates a short-lived component session.
The browser receives only the single-use component client secret.

## Install

```bash
bun add @affinity-health/elements
```

## Before you start

Your platform backend must:

1. Authenticate the current user.
2. Resolve the Affinity user, practice, and verified provider mapping.
3. Call `POST /v1/component-sessions`.
4. Return only `clientSecret` to the intended browser.

Never put an Affinity API key in browser or mobile code.

## JavaScript

```ts
import { initializeAffinity } from "@affinity-health/elements";

const affinity = initializeAffinity({
  fetchClientSecret: async () => {
    const response = await fetch("/api/affinity/component-session", {
      credentials: "include",
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Could not create an Affinity component session");
    }

    const session = await response.json();
    return session.clientSecret;
  },
});

const composer = affinity.create("prescription-composer");
const mounted = composer.mount("#affinity-prescription-composer", {
  onLoadError(error) {
    console.error(error);
  },
  onReady() {
    console.log("Affinity is ready");
  },
  onEvent(event) {
    if (event.type === "order.submitted") {
      console.log(event.orderId, event.fulfillmentIds);
    }
  },
});

// Call mounted.destroy() when the owning view is removed.
```

## React

```tsx
import { AffinityProvider, PrescriptionComposer } from "@affinity-health/elements/react";

export function Prescribe() {
  return (
    <AffinityProvider fetchClientSecret={fetchClientSecret}>
      <PrescriptionComposer
        onLoadError={(error) => {
          console.error(error);
        }}
        onReady={() => {
          console.log("Affinity is ready");
        }}
        onOrderDraftCreated={({ orderId, prescriptionIds }) => {
          console.log(orderId, prescriptionIds);
        }}
        onOrderSigned={({ orderId, prescriptionIds }) => {
          console.log(orderId, prescriptionIds);
        }}
        onOrderSubmitted={({ orderId, fulfillmentIds }) => {
          console.log(orderId, fulfillmentIds);
        }}
      />
    </AffinityProvider>
  );
}
```

Keep `fetchClientSecret` stable in React. Use `useCallback` when the function depends on component
state.

## Staging

Set the staging Connect URL while you test a staging integration:

```ts
const affinity = initializeAffinity({
  connectUrl: "https://connect-staging.joinaffinityai.com",
  fetchClientSecret,
});
```

The default URL is `https://connect.joinaffinityai.com`.

## Appearance

Use approved appearance variables:

```ts
const affinity = initializeAffinity({
  appearance: {
    theme: "light",
    variables: {
      borderRadius: "10px",
      colorBackground: "#ffffff",
      colorBorder: "#d8dee8",
      colorPrimary: "#2563eb",
      colorPrimaryText: "#ffffff",
      colorText: "#172033",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
  },
  fetchClientSecret,
});
```

Affinity controls the clinical layout, behavior, accessibility, and security. The package does not
accept arbitrary CSS, selectors, scripts, or remote font URLs.

## Events

The prescription composer can send:

- `order.draft_created`;
- `order.signed`;
- `order.submitted`.

Use these events for interface updates. Use signed webhooks for authoritative state.

## Security

- Add the exact parent origin to the matching platform mode settings.
- Create a new component session immediately before you mount the element.
- Do not put a client secret in a URL, log, analytics event, or persistent storage.
- Do not send clinical fields or keystrokes through parent-window messages.

See the [Affinity platform documentation](https://docs.joinaffinityai.com/api/platform-elements).
