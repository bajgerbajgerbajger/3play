# 3Play Mobile (Android/iOS)

Tahle repo obsahuje web (Vite/React) + API a navíc umí z webu postavit instalovatelnou aplikaci pro Android/iOS přes Capacitor.

## Rychlé pojmy
- **PWA**: instalace přímo z prohlížeče (nejrychlejší sdílení).
- **Capacitor**: obalí web do nativní appky pro Google Play / App Store.

## PWA (okamžité sdílení)
Na HTTPS doméně s funkčním service workerem jde aplikaci nainstalovat přes menu prohlížeče (Install app).

## Capacitor – setup
1) Instalace závislostí:
```bash
npm install
```

2) První inicializace platformy:
```bash
npx cap add android
npx cap add ios
```

3) Sync web buildu do nativních projektů:
```bash
npm run mobile:sync
```

## Android (Windows)
```bash
npm run mobile:android
```

## iOS
iOS build a podpis se dělá na macOS (Xcode). Na Windows můžeš projekt připravit, ale neuděláš finální build.

## Poznámky k publikaci do storů
- Budeš potřebovat vlastní `appId` (reverse-domain) a reálné ikony/splash.
- Google Play vyžaduje podepsaný `AAB` a vyplněné privacy informace.
- App Store vyžaduje Apple Developer účet, signing a App Store Connect metadata.

