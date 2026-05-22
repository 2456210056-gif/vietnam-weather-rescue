"use client";

import { create } from "zustand";
import type { SOSSignalDTO } from "@/types/sos";

type SOSStore = {
  signals: SOSSignalDTO[];
  setSignals: (signals: SOSSignalDTO[]) => void;
  upsertSignal: (signal: SOSSignalDTO) => void;
};

function sortSignals(signals: SOSSignalDTO[]) {
  return [...signals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const useSOSStore = create<SOSStore>((set) => ({
  signals: [],
  setSignals: (signals) => set({ signals: sortSignals(signals) }),
  upsertSignal: (signal) =>
    set((state) => {
      const withoutOldValue = state.signals.filter((item) => item.id !== signal.id);
      return {
        signals: sortSignals([signal, ...withoutOldValue]).slice(0, 200)
      };
    })
}));
