import { ShieldCheck, Lock, MailCheck, Phone } from 'lucide-react'

export function TrustPanel() {
  return (
    <div className="border-t md:border-t-0 md:border-l border-border/10 bg-surface2 p-6 sm:p-8">
      <div className="text-sm font-semibold">Důvěryhodnost</div>
      <div className="mt-1 text-xs text-muted">Registrace je navržená tak, aby byla rychlá a bezpečná.</div>

      <div className="mt-4 space-y-3">
        <div className="flex gap-3">
          <div className="mt-0.5 rounded-lg bg-white/5 p-2">
            <ShieldCheck size={18} className="text-brand" />
          </div>
          <div>
            <div className="text-sm font-semibold">Bezpečnost na prvním místě</div>
            <div className="mt-0.5 text-xs text-muted">Ověření emailu a povinný bezpečnostní kontakt chrání účet.</div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="mt-0.5 rounded-lg bg-white/5 p-2">
            <Lock size={18} className="text-brand" />
          </div>
          <div>
            <div className="text-sm font-semibold">Transparentní souhlasy</div>
            <div className="mt-0.5 text-xs text-muted">Marketing je vždy volitelný. Bez skrytých checkboxů.</div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="mt-0.5 rounded-lg bg-white/5 p-2">
            <MailCheck size={18} className="text-brand" />
          </div>
          <div>
            <div className="text-sm font-semibold">Ověření hned po kroku 1</div>
            <div className="mt-0.5 text-xs text-muted">Než půjdeš dál, ověříme, že email opravdu patří tobě.</div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="mt-0.5 rounded-lg bg-white/5 p-2">
            <Phone size={18} className="text-brand" />
          </div>
          <div>
            <div className="text-sm font-semibold">Telefon jen pro bezpečnost</div>
            <div className="mt-0.5 text-xs text-muted">Použijeme ho pro obnovu přístupu a důležité bezpečnostní zprávy.</div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border/10 bg-surface p-4">
        <div className="text-xs font-semibold text-muted">Tip</div>
        <div className="mt-1 text-xs text-muted">Použij email, ke kterému máš trvalý přístup. Ověřovací kód dorazí během chvíle.</div>
      </div>
    </div>
  )
}

