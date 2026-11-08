import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// true on the client after hydration, false during SSR/prerender.
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
