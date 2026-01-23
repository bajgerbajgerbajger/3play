import { create } from 'zustand'

type ModalType = 'channelCreation' | null
type TriggerType = 'welcome' | 'subscribe' | 'like' | 'upload' | null

interface ModalState {
  activeModal: ModalType
  trigger: TriggerType
  openChannelCreation: (trigger?: TriggerType) => void
  closeModal: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  trigger: null,
  openChannelCreation: (trigger = 'welcome') => set({ activeModal: 'channelCreation', trigger }),
  closeModal: () => set({ activeModal: null, trigger: null }),
}))