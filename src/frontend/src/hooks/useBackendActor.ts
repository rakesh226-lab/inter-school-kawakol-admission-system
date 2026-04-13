// useBackendActor.ts — wrapper around @caffeineai/core-infrastructure's useActor
// Passes the project's createActor function so it resolves without argument errors.
import { useActor as _useActor } from "@caffeineai/core-infrastructure";
import { type Backend, createActor } from "../backend";

// Adapt createActor to match the expected signature
export function useActor() {
  return _useActor<Backend>(createActor);
}
