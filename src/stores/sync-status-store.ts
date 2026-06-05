import { create } from 'zustand'

export type SyncStatus = 'online' | 'sincronizando' | 'offline' | 'erro'

type SyncStatusState = {
  status: SyncStatus
  pendentes: number
  setStatus: (status: SyncStatus) => void
  setPendentes: (pendentes: number) => void
}

export const useSyncStatusStore = create<SyncStatusState>((set) => ({
  status: 'online',
  pendentes: 0,
  setStatus: (status) => set({ status }),
  setPendentes: (pendentes) => set({ pendentes }),
}))
