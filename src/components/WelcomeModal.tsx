import { AnimatePresence, motion } from 'framer-motion'
import { X, Video, MonitorPlay, Sparkles } from 'lucide-react'
import { useModalStore } from '@/store/modal'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

export function WelcomeModal() {
  const { activeModal, closeModal, trigger } = useModalStore()
  const navigate = useNavigate()

  const isOpen = activeModal === 'channelCreation'

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/10 bg-surface shadow-2xl"
          >
            <div className="absolute right-4 top-4 z-10">
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-muted transition hover:bg-white/5 hover:text-text"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Sparkles size={40} />
              </div>

              <h2 className="mb-2 text-2xl font-bold">Vítej v 3Play!</h2>
              <p className="mb-8 text-muted">
                {trigger === 'welcome' 
                  ? 'Tvůj účet je připraven. Chceš rovnou vytvořit svůj kanál a začít nahrávat videa?' 
                  : 'Pro tuto akci je potřeba mít vytvořený kanál.'}
              </p>

              <div className="grid gap-3">
                <Button
                  variant="primary"
                  className="w-full gap-2 h-12 text-lg"
                  onClick={() => {
                    closeModal()
                    navigate('/studio/onboarding')
                  }}
                >
                  <Video size={20} />
                  Vytvořit kanál
                </Button>

                {trigger === 'welcome' && (
                  <Button
                    variant="ghost"
                    className="w-full gap-2 h-12 text-lg"
                    onClick={closeModal}
                  >
                    <MonitorPlay size={20} />
                    Jen se dívat (Možná později)
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-surface2 p-4 text-center text-xs text-muted">
              Vytvořením kanálu souhlasíš s podmínkami pro tvůrce.
              <br />
              Kanál můžeš vytvořit kdykoliv později v nastavení účtu.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
