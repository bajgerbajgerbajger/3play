import { create } from 'zustand'

type ModalType = 'welcome' | null
type TriggerType = 'welcome' | 'subscribe' | 'like' | 'upload' | null

interface ModalState {
  activeModal: ModalType
  trigger: TriggerType
  closeModal: () => void
  openWelcome: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  trigger: null,
  closeModal: () => set({ activeModal: null, trigger: null }),
  openWelcome: () => set({ activeModal: 'welcome', trigger: 'welcome' }),
}))